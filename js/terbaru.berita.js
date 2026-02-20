document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.terbaru');
  if (!container) return;

  // ⚡ TANPA EMBED (RINGAN)
  const API =
    'https://lampost.co/wp-json/wp/v2/posts' +
    '?per_page=6&orderby=date&order=desc';

  /* ================= CACHE ================= */
  const catCache = {};
  const mediaCache = {};

  const formatTanggal = dateString =>
    new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

  // ===============================
  // KATEGORI (ASYNC CEPAT)
  // ===============================
  async function getCategory(catId) {
    if (!catId) return { name: 'Teknokrat', slug: 'teknokrat' };
    if (catCache[catId]) return catCache[catId];

    try {
      const res = await fetch(
        `https://lampost.co/wp-json/wp/v2/categories/${catId}`
      );
      if (!res.ok) throw 0;

      const data = await res.json();
      return (catCache[catId] = {
        name: data.name,
        slug: data.slug
      });
    } catch {
      return { name: 'Teknokrat', slug: 'teknokrat' };
    }
  }

  // ===============================
  // GAMBAR HD (ASYNC CEPAT)
  // ===============================
  async function getMedia(mediaId) {
    if (!mediaId) return 'image/ai.jpg';
    if (mediaCache[mediaId]) return mediaCache[mediaId];

    try {
      const res = await fetch(
        `https://lampost.co/wp-json/wp/v2/media/${mediaId}`
      );
      if (!res.ok) throw 0;

      const data = await res.json();

      // ✅ PRIORITAS HD / FULL SIZE
      return (mediaCache[mediaId] =
        data.media_details?.sizes?.full?.source_url ||
        data.media_details?.sizes?.large?.source_url ||
        data.media_details?.sizes?.medium?.source_url ||
        data.source_url ||
        'image/ai.jpg'
      );

    } catch {
      return 'image/ai.jpg';
    }
  }

  // ===============================
  // LOAD POSTS
  // ===============================
  async function loadPosts() {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error('Fetch error');

      const posts = await res.json();
      const htmlArr = [];

      posts.forEach(post => {

        const judul = post.title.rendered;
        const slug = post.slug;
        const tanggal = formatTanggal(post.date);
        const id = `terbaru-${post.id}`;

        // ⚡ LINK SEMENTARA (AMAN)
        htmlArr.push(`
          <a href="#" class="item-microweb" id="${id}">
            <img
              src="image/ai.jpg"
              alt="${judul}"
              class="img-terbaru-teknokrat"
            >
            <div class="berita-microweb">
              <p class="judul-terbaru">${judul}</p>
              <div class="info-microweb">
                <p class="tanggal">${tanggal}</p>
              </div>
            </div>
          </a>
        `);

        // 🔁 UPDATE LINK + GAMBAR (NON BLOCKING)
        (async () => {
          const { slug: categorySlug } =
            await getCategory(post.categories?.[0]);

          const gambar =
            await getMedia(post.featured_media);

          const el = document.getElementById(id);
          if (!el) return;

          el.href = `halaman.html?${categorySlug}/${slug}`;
          el.querySelector('img').src = gambar;
        })();

      });

      container.innerHTML =
        htmlArr.join('') || '<p>Konten tidak tersedia</p>';

    } catch (err) {
      console.error('API gagal dimuat:', err);
      container.innerHTML = '<p>Konten gagal dimuat</p>';
    }
  }

  loadPosts();

});