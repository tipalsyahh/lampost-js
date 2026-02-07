document.addEventListener('DOMContentLoaded', async () => {

  const container = document.querySelector('.home-forum-guru');
  const loadMoreBtn = document.getElementById('loadMore');
  if (!container || !loadMoreBtn) return;

  const PER_PAGE = 10;
  let page = 1;
  let isLoading = false;
  let hasMore = true;
  let kategoriId = null;

  try {
    const catRes = await fetch(
      'https://lampost.co/wp-json/wp/v2/categories?slug=forum-guru'
    );
    if (!catRes.ok) throw new Error();

    const catData = await catRes.json();
    if (!catData.length) throw new Error();

    kategoriId = catData[0].id;

  } catch {
    container.innerHTML = '<p>Kategori opini tidak tersedia</p>';
    return;
  }

  async function loadPosts() {
    if (isLoading || !hasMore) return;
    isLoading = true;

    try {
      const api =
        'https://lampost.co/wp-json/wp/v2/posts' +
        `?categories=${kategoriId}&per_page=${PER_PAGE}&page=${page}&orderby=date&order=desc&_embed`;

      const res = await fetch(api);
      if (!res.ok) {
        if (res.status === 400) {
          hasMore = false;
          loadMoreBtn.style.display = 'none';
          return;
        }
        throw new Error();
      }

      let posts = await res.json();
      if (!posts.length) {
        hasMore = false;
        loadMoreBtn.style.display = 'none';
        return;
      }

      posts = posts.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      let output = '';

      posts.forEach(post => {

        const judul = post.title.rendered;
        const slug = post.slug;

        const kategori =
          post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Opini';

        const kategoriSlug =
          post._embedded?.['wp:term']?.[0]?.[0]?.slug || 'opini';

        const link = `../halaman.html?${kategoriSlug}/${slug}`;

        let deskripsi =
          post.excerpt?.rendered
            ?.replace(/<[^>]+>/g, '')
            ?.trim() || '';

        if (deskripsi.length > 150) {
          deskripsi = deskripsi.slice(0, 150) + '...';
        }

        const gambar =
          post._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
          'image/ai.jpg';

        const d = new Date(post.date);
        const tanggal =
          `${String(d.getDate()).padStart(2, '0')}/` +
          `${String(d.getMonth() + 1).padStart(2, '0')}/` +
          `${d.getFullYear()}`;

        const editor =
          post._embedded?.['wp:term']?.[2]?.[0]?.name || 'Redaksi';

        output += `
          <a href="${link}" class="item-info">
            <img src="${gambar}" alt="${judul}" class="img-forum-guru" loading="lazy">
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
      });

      container.insertAdjacentHTML('beforeend', output);
      page++;

    } catch (err) {
      console.error(err);
    } finally {
      isLoading = false;
    }
  }

  loadPosts();
  loadMoreBtn.addEventListener('click', loadPosts);

});
