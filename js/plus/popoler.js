document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.terpopuler');
  if (!container) return;

  const PER_PAGE = 8;

  async function getMedia(mediaId) {
    if (!mediaId) return 'https://lampost.co/image/ai.jpeg';

    try {
      const res = await fetch(`https://lampost.co/wp-json/wp/v2/media/${mediaId}`);
      const data = await res.json();

      return data?.media_details?.sizes?.medium_large?.source_url ||
             data?.source_url ||
             'https://lampost.co/image/ai.jpeg';
    } catch {
      return 'https://lampost.co/image/ai.jpeg';
    }
  }

  async function getCategory(catIds) {
    if (!catIds || !catIds.length) return 'Umum';

    try {
      const res = await fetch(`https://lampost.co/wp-json/wp/v2/categories?include=${catIds.join(',')}`);
      const data = await res.json();

      return data[0]?.name || 'Umum';
    } catch {
      return 'Umum';
    }
  }

  async function loadPosts() {

    try {

      const res = await fetch(window.location.origin + '/index/server/populer.php');
      let posts = await res.json();

      if (!Array.isArray(posts) || !posts.length) {
        container.innerHTML = '<p>Data tidak tersedia</p>';
        return;
      }

      posts = posts.slice(0, PER_PAGE);

      const htmlArr = [];

      posts.forEach((post, index) => {

        const id = `alink-${index}`;
        const url = post.url;

        htmlArr.push(`
          <a href="${url}" class="alink-item" id="${id}">
            <img src="https://lampost.co/image/ai.jpeg" class="alink-img" loading="lazy">
            <div class="alink-content">
              <p class="alink-title">Loading...</p>
              <p class="alink-category">Loading...</p>
            </div>
          </a>
        `);

        // ======================
        // AMBIL DATA WP
        // ======================
        (async () => {

          try {

            const slug = url.split('/').filter(Boolean).pop();

            const wpRes = await fetch(`https://lampost.co/wp-json/wp/v2/posts?slug=${slug}`);
            const wpData = await wpRes.json();

            if (!wpData.length) return;

            const postData = wpData[0];

            const judul = postData.title.rendered;
            const img = await getMedia(postData.featured_media);
            const kategori = await getCategory(postData.categories);

            const el = document.getElementById(id);
            if (!el) return;

            const imgEl = el.querySelector('img');

            imgEl.onerror = () => {
              imgEl.src = 'https://lampost.co/image/ai.jpeg';
            };

            imgEl.src = img;

            el.querySelector('.alink-title').innerHTML = judul;

            // 🔥 TANPA TANGGAL
            el.querySelector('.alink-category').textContent = kategori;

          } catch (err) {
            console.log('WP error:', err);
          }

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