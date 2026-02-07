document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.home');
  const loadMoreBtn = document.getElementById('loadMore');
  if (!container || !loadMoreBtn) return;

  const PER_PAGE = 6;
  const MAX_PAGE = 6;

  let page = 1;
  let isLoading = false;
  let hasMore = true;
  let kategoriId = null;

  const catCache = {};
  const mediaCache = {};
  const editorCache = {};

  const formatTanggal = d =>
    new Date(d).toLocaleDateString('id-ID');

  /* Ambil ID kategori */
  (async () => {
    try {
      const res = await fetch(
        'https://lampost.co/wp-json/wp/v2/categories?slug=bola'
      );
      const data = await res.json();

      if (!data.length) throw new Error();
      kategoriId = data[0].id;
      loadPosts();

    } catch {
      container.innerHTML = '<p>Kategori tidak tersedia</p>';
    }
  })();

  const getCategory = async id => {
    if (!id) return { name: 'Opini', slug: 'opini' };
    if (catCache[id]) return catCache[id];

    const res = await fetch(
      `https://lampost.co/wp-json/wp/v2/categories/${id}`
    );
    const data = await res.json();

    return (catCache[id] = {
      name: data.name,
      slug: data.slug
    });
  };

  const getMedia = async id => {
    if (!id) return 'image/ai.jpg';
    if (mediaCache[id]) return mediaCache[id];

    const res = await fetch(
      `https://lampost.co/wp-json/wp/v2/media/${id}`
    );
    const data = await res.json();

    return (mediaCache[id] =
      data.media_details?.sizes?.medium?.source_url ||
      data.source_url ||
      'image/ai.jpg'
    );
  };

  const getEditor = async post => {
    const link = post._links?.['wp:term']?.[2]?.href;
    if (!link) return 'Redaksi';
    if (editorCache[link]) return editorCache[link];

    try {
      const res = await fetch(link);
      const data = await res.json();
      return (editorCache[link] =
        data?.[0]?.name || 'Redaksi');
    } catch {
      return 'Redaksi';
    }
  };

  async function loadPosts() {
    if (isLoading || !hasMore || page > MAX_PAGE) {
      loadMoreBtn.style.display = 'none';
      return;
    }

    isLoading = true;
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Loading...';

    try {
      const res = await fetch(
        `https://lampost.co/wp-json/wp/v2/posts` +
        `?categories=${kategoriId}` +
        `&per_page=${PER_PAGE}` +
        `&page=${page}` +
        `&orderby=date&order=desc`
      );

      if (!res.ok) throw new Error();

      const posts = await res.json();
      if (!posts.length) throw new Error();

      const html = await Promise.all(
        posts.map(async post => {

          const judul = post.title.rendered;
          const slug = post.slug;
          const tanggal = formatTanggal(post.date);

          const { name: kategori, slug: kategoriSlug } =
            await getCategory(post.categories?.[0]);

          const gambar = await getMedia(post.featured_media);
          const editor = await getEditor(post);

          let deskripsi =
            post.excerpt?.rendered
              ?.replace(/<[^>]+>/g, '')
              ?.trim() || '';

          if (deskripsi.length > 150)
            deskripsi = deskripsi.slice(0, 150) + '...';

          return `
            <a href="../../halaman.html?${kategoriSlug}/${slug}" class="item-info">
              <img src="${gambar}" alt="${judul}" loading="lazy" class="img-microweb">
              <div class="berita-microweb">
                <p class="judul">${judul}</p>
                <p class="kategori">${kategori}</p>
                <div class="info-microweb">
                  <p class="editor">By ${editor}</p>
                  <p class="tanggal">${tanggal}</p>
                </div>
                <p class="deskripsi">${deskripsi}</p>
              </div>
            </a>
          `;
        })
      );

      container.insertAdjacentHTML('beforeend', html.join(''));
      page++;

    } catch {
      hasMore = false;
      loadMoreBtn.style.display = 'none';
    } finally {
      isLoading = false;
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = 'Load More';
    }
  }

  loadMoreBtn.addEventListener('click', loadPosts);

});
