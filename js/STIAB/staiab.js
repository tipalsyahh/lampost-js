document.addEventListener('DOMContentLoaded', async () => {

  const container = document.querySelector('.home-staiab');
  const loadMoreBtn = document.getElementById('loadMore');
  if (!container || !loadMoreBtn) return;

  const PER_PAGE = 6;
  let page = 1;
  let isLoading = false;
  let hasMore = true;

  async function loadPosts() {
    if (isLoading || !hasMore) return;
    isLoading = true;

    try {
      const api =
        'https://lampost.co/microweb/stiab/wp-json/wp/v2/posts' +
        `?per_page=${PER_PAGE}&page=${page}&orderby=date&order=desc&_embed`;

      const res = await fetch(api);
      if (!res.ok) {
        if (res.status === 400) {
          hasMore = false;
          loadMoreBtn.style.display = 'none';
          return;
        }
        throw new Error('API gagal');
      }

      const posts = await res.json();

      if (!posts.length) {
        hasMore = false;
        loadMoreBtn.style.display = 'none';
        return;
      }

      let output = '';

      posts.forEach(post => {

        /* 📝 JUDUL & SLUG */
        const judul = post.title.rendered;
        const slug = post.slug;

        /* 🏷️ KATEGORI */
        const kategori =
          post._embedded?.['wp:term']?.[0]?.[0]?.name || 'stiab';

        /* 🏷️ KATEGORI SLUG */
        const kategoriSlug =
          post._embedded?.['wp:term']?.[0]?.[0]?.slug || 'stiab';

        /* 🔗 LINK */
        const link = `berita.stiab.html?${kategoriSlug}/${slug}`;

        /* 📰 DESKRIPSI */
        let deskripsi =
          post.excerpt?.rendered
            ?.replace(/<[^>]+>/g, '')
            ?.trim() || '';

        if (deskripsi.length > 150) {
          deskripsi = deskripsi.slice(0, 150) + '...';
        }

        /* 🖼️ GAMBAR */
        const gambar =
          post._embedded?.['wp:featuredmedia']?.[0]?.source_url
          || 'image/ai.jpg';

        /* =========================
           📅 TANGGAL → ANGKA
           FORMAT: DD/MM/YYYY
        ========================= */
        const d = new Date(post.date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const tanggal = `${day}/${month}/${year}`;

        /* ✍️ EDITOR */
        const editor =
          post._embedded?.author?.[0]?.name || 'Redaksi';

        output += `
          <a href="${link}" class="item-info">
            <img src="${gambar}" alt="${judul}" class="img-staiab" loading="lazy">
            <div class="berita-staiab">
              <p class="kategori">${kategori}</p>
              <p class="judul">${judul}</p>
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

  /* LOAD AWAL */
  loadPosts();

  /* LOAD MORE */
  loadMoreBtn.addEventListener('click', loadPosts);

});
