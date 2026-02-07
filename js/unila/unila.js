document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.home');
  const loadMoreBtn = document.getElementById('loadMore');
  if (!container || !loadMoreBtn) return;

  const PER_PAGE = 5;
  let page = 1;
  let isLoading = false;
  let hasMore = true;

  const BASE_API =
    'https://lampost.co/microweb/universitaslampung/wp-json/wp/v2/posts';

  async function loadPosts() {
    if (isLoading || !hasMore) return;
    isLoading = true;
    loadMoreBtn.disabled = true;

    try {
      const api = `${BASE_API}?per_page=${PER_PAGE}&page=${page}&orderby=date&order=desc&_embed`;
      const res = await fetch(api); // ✅ tanpa proxy

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

      const fragment = document.createDocumentFragment();

      posts.forEach(post => {
        const kategori = post._embedded?.['wp:term']?.[0]?.[0] || {};
        const judul = post.title.rendered;
        const slug = post.slug;

        let deskripsi = post.excerpt?.rendered
          ?.replace(/<[^>]+>/g, '')
          ?.trim() || '';
        if (deskripsi.length > 120) {
          deskripsi = deskripsi.slice(0, 120) + '…';
        }

        const gambar =
          post._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
          'image/ai.jpg';

        const editor =
          post._embedded?.author?.[0]?.name || 'Redaksi';
        const d = new Date(post.date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const tanggal = `${day}/${month}/${year}`;

        const linkEl = document.createElement('a');
        linkEl.href = `berita.unila.html?berita-terkini/${slug}`;
        linkEl.className = 'item-info';

        linkEl.innerHTML = `
          <img src="${gambar}" class="img-microweb" loading="lazy" alt="${judul}">
          <div class="berita-microweb">
            <p class="judul">${judul}</p>
            <p class="kategori">${kategori.name}</p>
            <div class="info-microweb">
              <p class="editor">By ${editor}</p>
              <p class="tanggal" id="tanggal-unila">${tanggal}</p>
            </div>
            <p class="deskripsi">${deskripsi}</p>
          </div>
        `;

        fragment.appendChild(linkEl);
      });

      container.appendChild(fragment);
      page++;

    } catch (err) {
      console.error('Gagal load berita (tanpa proxy):', err);
    } finally {
      isLoading = false;
      loadMoreBtn.disabled = false;
    }
  }

  loadPosts();
  loadMoreBtn.addEventListener('click', loadPosts);
});
