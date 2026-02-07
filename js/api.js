document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.info');
  const loadMoreBtn = document.getElementById('loadMore');
  if (!container || !loadMoreBtn) return;

  const PER_PAGE = 15;
  const MAX_PAGE = 10;

  let page = 1;
  let isLoading = false;
  let hasMore = true;

  const API_POSTS =
    'https://lampost.co/wp-json/wp/v2/posts?orderby=date&order=desc';

  const catCache = {};
  const mediaCache = {};
  const termCache = {};

  const formatTanggal = dateString => {
    const d = new Date(dateString);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  async function getCategory(catId) {
    if (!catId) return { name: 'Berita', slug: 'berita' };
    if (catCache[catId]) return catCache[catId];

    const res = await fetch(
      `https://lampost.co/wp-json/wp/v2/categories/${catId}`
    );
    const data = await res.json();

    return (catCache[catId] = {
      name: data.name,
      slug: data.slug
    });
  }

  async function getMedia(mediaId) {
    if (!mediaId) return 'image/default.jpg';
    if (mediaCache[mediaId]) return mediaCache[mediaId];

    const res = await fetch(
      `https://lampost.co/wp-json/wp/v2/media/${mediaId}`
    );
    const data = await res.json();

    return (mediaCache[mediaId] =
      data.media_details?.sizes?.medium?.source_url ||
      data.source_url ||
      'image/default.jpg'
    );
  }

  async function getEditor(post) {
    let editor = 'Redaksi';

    const termLink = post._links?.['wp:term']?.[2]?.href;
    if (!termLink) return editor;

    if (termCache[termLink]) return termCache[termLink];

    try {
      const res = await fetch(termLink);
      if (res.ok) {
        const data = await res.json();
        editor = data?.[0]?.name || editor;
        termCache[termLink] = editor;
      }
    } catch (_) {}

    return editor;
  }

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
        `${API_POSTS}&per_page=${PER_PAGE}&page=${page}`
      );
      if (!res.ok) throw new Error('Fetch error');

      let posts = await res.json();
      if (page === 1) posts.shift();

      if (!posts.length) {
        hasMore = false;
        loadMoreBtn.style.display = 'none';
        return;
      }

      const htmlArr = [];

      const promises = posts.map(async post => {

        const judul = post.title.rendered;
        const tanggal = formatTanggal(post.date);
        const gambar = await getMedia(post.featured_media);

        const id = `post-${post.id}`;
        const link = `halaman.html?berita/${post.slug}`;

        // 🔥 TAMPILKAN LANGSUNG (TANPA MENUNGGU DATA LAIN)
        htmlArr.push(`
          <a href="${link}" class="item-berita" id="${id}">
            <img src="${gambar}" alt="${judul}" loading="lazy" decoding="async">
            <div class="info-berita">
              <p class="judul">${judul}</p>
              <p class="kategori">...</p>
              <div class="detail-info">
                <p class="editor">By ...</p>
                <p class="tanggal">${tanggal}</p>
              </div>
            </div>
          </a>
        `);

        // ⏳ DATA PELENGKAP MENYUSUL (NON-BLOCKING)
        (async () => {
          const catId = post.categories?.[0];
          const { name: kategori } = await getCategory(catId);
          const editor = await getEditor(post);

          const el = document.getElementById(id);
          if (!el) return;

          el.querySelector('.kategori').textContent = kategori;
          el.querySelector('.editor').textContent = `By ${editor}`;
        })();

      });

      await Promise.all(promises);
      container.insertAdjacentHTML('beforeend', htmlArr.join(''));
      page++;

    } catch (err) {
      console.error(err);
    } finally {
      isLoading = false;
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = 'Load More';
    }
  }

  // 🚀 LOAD LANGSUNG SAAT HALAMAN SIAP
  loadPosts();
  loadMoreBtn.addEventListener('click', loadPosts);

});