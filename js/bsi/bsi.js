document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.berita-ubl');
  const loadMoreBtn = document.querySelector('#loadMore');
  if (!container || !loadMoreBtn) return;

  let page = 1;
  const perPage = 4;
  let isLoading = false;

  async function loadPosts() {
    if (isLoading) return;
    isLoading = true;

    try {
      const api =
        `https://lampost.co/microweb/bsi/wp-json/wp/v2/posts` +
        `?per_page=${perPage}&page=${page}&orderby=date&order=desc&_embed`;

      const res = await fetch(api);
      if (!res.ok) throw new Error('Gagal mengambil API');

      const posts = await res.json();

      if (!posts.length) {
        loadMoreBtn.style.display = 'none';
        return;
      }

      let output = '';

      posts.forEach(post => {

        /* 📝 JUDUL */
        const judul = post.title.rendered;

        /* 🔤 SLUG JUDUL */
        const slug = post.slug;

        /* 🏷️ KATEGORI */
        const kategori =
          post._embedded?.['wp:term']?.[0]?.[0]?.name || 'UBL';

        /* 🏷️ SLUG KATEGORI */
        const kategoriSlug =
          post._embedded?.['wp:term']?.[0]?.[0]?.slug || 'ubl';

        /* 🔗 LINK */
        const link = `berita.bsi.html?${kategoriSlug}/${slug}`;

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
            <img
              src="${gambar}"
              alt="${judul}"
              class="img-ubl"
              loading="lazy">
              <div class="berita-microweb">
              <p class="judul-ubl">${judul}</p>
              <p class="kategori">${kategori}</p>
              <div class="info-microweb">
                <p class="editor">By ${editor}</p>
                <p class="tanggal">${tanggal}</p>
              </div>
            </div>
          </a>
        `;
      });

      container.insertAdjacentHTML('beforeend', output);
      page++;

    } catch (err) {
      console.error('API gagal dimuat:', err);
      loadMoreBtn.style.display = 'none';
    } finally {
      isLoading = false;
    }
  }

  // Load awal
  loadPosts();

  // Load 10 lagi
  loadMoreBtn.addEventListener('click', loadPosts);

});
