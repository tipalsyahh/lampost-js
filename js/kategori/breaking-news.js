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

  const formatTanggal = d => {
    d = new Date(d);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  fetch('https://lampost.co/wp-json/wp/v2/categories?slug=breaking-news')
    .then(r => r.json())
    .then(d => {
      kategoriId = d?.[0]?.id;
      loadPosts();
    })
    .catch(() => container.innerHTML = '<p>Kategori tidak tersedia</p>');

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
        `https://lampost.co/wp-json/wp/v2/posts?categories=${kategoriId}&per_page=${PER_PAGE}&page=${page}&_embed&orderby=date&order=desc`
      );

      if (!res.ok) {
        hasMore = false;
        loadMoreBtn.style.display = 'none';
        return;
      }

      const posts = await res.json();
      if (!posts.length) {
        hasMore = false;
        loadMoreBtn.style.display = 'none';
        return;
      }

      const html = posts.map(post => {

        const img =
          post._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
          'image/ai.jpg';

        const editor =
          post._embedded?.author?.[0]?.name ||
          'Redaksi';

        let deskripsi =
          post.excerpt?.rendered?.replace(/<[^>]+>/g, '').trim() || '';

        if (deskripsi.length > 150) {
          deskripsi = deskripsi.slice(0, 150) + '...';
        }

        return `
          <a href="../halaman.html?breaking-news/${post.slug}" class="item-info">
            <img src="${img}" class="img-microweb" loading="lazy">
            <div class="berita-microweb">
              <p class="judul">${post.title.rendered}</p>
              <p class="kategori">Breaking News</p>
              <div class="info-microweb">
                <p class="editor">By ${editor}</p>
                <p class="tanggal">${formatTanggal(post.date)}</p>
              </div>
              <p class="deskripsi">${deskripsi}</p>
            </div>
          </a>
        `;

      }).join('');

      container.insertAdjacentHTML('beforeend', html);
      page++;

    } catch { }

    isLoading = false;
    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = 'Load More';
  }

  loadMoreBtn.addEventListener('click', loadPosts);

});