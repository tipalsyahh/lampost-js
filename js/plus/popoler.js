document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.terpopuler');
  if (!container) return;

  const PER_PAGE = 10;

  const mediaCache = {};
  const categoryCache = {};

  // ======================
  // GET GAMBAR
  // ======================
  async function getMedia(mediaId) {
    if (!mediaId) return 'image/ai.jpg';
    if (mediaCache[mediaId]) return mediaCache[mediaId];

    try {
      const res = await fetch(
        `https://lampost.co/wp-json/wp/v2/media/${mediaId}`
      );
      const data = await res.json();

      return (mediaCache[mediaId] =
        data.media_details?.sizes?.medium?.source_url ||
        data.source_url ||
        'image/ai.jpg'
      );
    } catch {
      return 'image/ai.jpg';
    }
  }

  // ======================
  // GET KATEGORI
  // ======================
  async function getCategoryName(catIds) {

    if (!catIds || !catIds.length) return 'Umum';

    const id = catIds[0];

    if (categoryCache[id]) return categoryCache[id];

    try {
      const res = await fetch(
        `https://lampost.co/wp-json/wp/v2/categories/${id}`
      );
      const data = await res.json();

      return (categoryCache[id] = data.name || 'Umum');

    } catch {
      return 'Umum';
    }
  }

  // ======================
  // HITUNG SKOR TRENDING
  // ======================
  function getTrendingScore(post) {

    const now = new Date();
    const postDate = new Date(post.date);

    const hoursDiff = (now - postDate) / (1000 * 60 * 60);

    // semakin baru → skor tinggi
    const freshness = Math.max(0, 100 - hoursDiff);

    // komentar (kalau ada)
    const comments = post.comment_count || 0;

    // formula gabungan
    return freshness + (comments * 5);
  }

  // ======================
  // LOAD POSTS
  // ======================
  async function loadPosts() {

    try {

      const res = await fetch(
        `https://lampost.co/wp-json/wp/v2/posts?per_page=${PER_PAGE}`
      );

      let posts = await res.json();

      if (!Array.isArray(posts) || !posts.length) {
        container.innerHTML = '<p>Data tidak tersedia</p>';
        return;
      }

      // 🔥 SORTING TRENDING
      posts.sort((a, b) => getTrendingScore(b) - getTrendingScore(a));

      // ambil 6 terbaik
      posts = posts.slice(0, 6);

      const htmlArr = [];

      posts.forEach((post, index) => {

        const id = `alink-${post.id}`;
        const judul = post.title.rendered;
        const slug = post.slug;

        htmlArr.push(`
          <a href="halaman.html?tajuk-lampung-post/${slug}" class="alink-item" id="${id}">
            <img src="image/ai.jpg" class="alink-img" loading="lazy">
            <div class="alink-content">
              <p class="alink-title">${judul}</p>
              <p class="alink-category">Loading...</p>
            </div>
          </a>
        `);

        (async () => {

          const img = await getMedia(post.featured_media);
          const kategori = await getCategoryName(post.categories);

          const el = document.getElementById(id);
          if (!el) return;

          el.querySelector('img').src = img;
          el.querySelector('.alink-category').textContent = kategori;

        })();

      });

      container.innerHTML = htmlArr.join('');

    } catch (e) {
      console.error(e);
      container.innerHTML = '<p>Gagal memuat data</p>';
    }
  }

  loadPosts();

});