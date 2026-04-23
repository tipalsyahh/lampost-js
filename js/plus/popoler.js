document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.terpopuler');
  if (!container) return;

  const PER_PAGE = 10;

  const mediaCache = {};
  const categoryCache = {};

  // ======================
  // GET GAMBAR (HD)
  // ======================
  async function getMedia(mediaId) {
    if (!mediaId) return 'https://lampost.co/image/ai.jpeg';
    if (mediaCache[mediaId]) return mediaCache[mediaId];

    try {
      const res = await fetch(
        `https://lampost.co/wp-json/wp/v2/media/${mediaId}`
      );
      const data = await res.json();

      return (mediaCache[mediaId] =
        data?.media_details?.sizes?.full?.source_url ||
        data?.media_details?.sizes?.large?.source_url ||
        data?.media_details?.sizes?.medium_large?.source_url ||
        data?.source_url ||
        'https://lampost.co/image/ai.jpeg'
      );
    } catch {
      return 'https://lampost.co/image/ai.jpeg';
    }
  }

  // ======================
  // GET KATEGORI NAMA
  // ======================
  async function getCategoryName(catIds) {
    if (!catIds || !catIds.length) return 'Umum';

    try {
      const ids = catIds.join(',');
      const res = await fetch(
        `https://lampost.co/wp-json/wp/v2/categories?include=${ids}`
      );
      const data = await res.json();

      if (!data.length) return 'Umum';

      const child = data.find(c => c.parent !== 0);
      const selected = child || data[data.length - 1];

      return selected.name || 'Umum';

    } catch {
      return 'Umum';
    }
  }

  // ======================
  // 🔥 GET KATEGORI SLUG (UNTUK URL)
  // ======================
  async function getCategorySlug(catIds) {
    if (!catIds || !catIds.length) return 'berita';

    try {
      const ids = catIds.join(',');
      const res = await fetch(
        `https://lampost.co/wp-json/wp/v2/categories?include=${ids}`
      );
      const data = await res.json();

      if (!data.length) return 'berita';

      const child = data.find(c => c.parent !== 0);
      const selected = child || data[data.length - 1];

      return selected.slug || 'berita';

    } catch {
      return 'berita';
    }
  }

  // ======================
  // HITUNG TRENDING
  // ======================
  function getTrendingScore(post) {

    const now = new Date();
    const postDate = new Date(post.date);

    const hoursDiff = (now - postDate) / (1000 * 60 * 60);

    const freshness = Math.max(0, 100 - hoursDiff);
    const comments = post.comment_count || 0;

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

      posts.sort((a, b) => getTrendingScore(b) - getTrendingScore(a));
      posts = posts.slice(0, 6);

      const htmlArr = [];

      posts.forEach((post) => {

        const id = `alink-${post.id}`;
        const judul = post.title.rendered;

        htmlArr.push(`
          <a href="#" class="alink-item" id="${id}">
            <img src="https://lampost.co/image/ai.jpeg" class="alink-img" loading="lazy">
            <div class="alink-content">
              <p class="alink-title">${judul}</p>
              <p class="alink-category">Loading...</p>
            </div>
          </a>
        `);

        (async () => {

          const img = await getMedia(post.featured_media);
          const kategori = await getCategoryName(post.categories);
          const kategoriSlug = await getCategorySlug(post.categories);

          const el = document.getElementById(id);
          if (!el) return;

          const imgEl = el.querySelector('img');

          // fallback aman
          imgEl.onerror = () => {
            imgEl.src = 'https://lampost.co/image/ai.jpeg';
          };

          imgEl.src = img;

          // 🔥 FIX URL DINAMIS
          el.href = `/${kategoriSlug}/${post.slug}`;

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