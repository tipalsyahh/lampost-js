document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.home');
  if (!container) return;

  const PER_PAGE = 10;

  const formatTanggal = d => {
    if (!d) return '-';
    d = new Date(d);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  };

  const categoryCache = {};

  async function getCategorySlug(catIds) {
    if (!catIds || !catIds.length) return 'post';

    const id = catIds[0];
    if (categoryCache[id]) return categoryCache[id];

    try {
      const res = await fetch(`https://lampost.co/wp-json/wp/v2/categories/${id}`);
      const data = await res.json();
      return categoryCache[id] = data?.slug || 'post';
    } catch {
      return 'post';
    }
  }

  // 🔥 FIX EDITOR (PAKAI COAUTHORS)
  async function getAuthorName(postId) {
    try {
      const res = await fetch(`https://lampost.co/wp-json/wp/v2/coauthors?post=${postId}`);
      const data = await res.json();

      if (Array.isArray(data) && data.length) {
        return data.map(a => a.name).join(', ');
      }

      return 'Redaksi';
    } catch {
      return 'Redaksi';
    }
  }

  async function loadPosts() {

    try {

      // 🔥 ambil dari GA
      const res = await fetch(window.location.origin + '/index/server/populer.php');
      let posts = await res.json();

      if (!Array.isArray(posts) || !posts.length) {
        container.innerHTML = '<p>Data tidak tersedia</p>';
        return;
      }

      posts = posts.slice(0, PER_PAGE);

      const htmlArr = [];

      posts.forEach((item, index) => {

        const id = `p-${index}`;
        const url = item?.url || '#';

        htmlArr.push(`
          <a href="${url}" class="item-info" id="${id}">
            <img src="https://lampost.co/image/ai.jpeg" class="img-microweb" loading="lazy">
            <div class="berita-microweb">
              <p class="judul">Loading...</p>
              <p class="kategori">Terpopuler</p>
              <div class="info-microweb">
                <p class="editor">Loading...</p>
                <p class="tanggal">-</p>
              </div>
              <p class="deskripsi">...</p>
            </div>
          </a>
        `);

        // ======================
        // AMBIL DATA WP
        // ======================
        (async () => {

          try {

            const slug = url.split('/').filter(Boolean).pop();
            if (!slug) return;

            const wpRes = await fetch(`https://lampost.co/wp-json/wp/v2/posts?slug=${slug}&_embed`);
            const wpData = await wpRes.json();

            if (!wpData || !wpData.length) return;

            const post = wpData[0];

            const judul = post?.title?.rendered || 'Tanpa Judul';

            const img =
              post?._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
              'https://lampost.co/image/ai.jpeg';

            const editor = await getAuthorName(post.id); // 🔥 FIX DI SINI

            const tanggal = formatTanggal(post?.date);

            const kategoriSlug = await getCategorySlug(post?.categories);

            const deskripsi =
              (post?.excerpt?.rendered || '')
                .replace(/<[^>]+>/g,'')
                .slice(0,150) || '...';

            const el = document.getElementById(id);
            if (!el) return;

            const imgEl = el.querySelector('img');

            imgEl.onerror = () => {
              imgEl.src = 'https://lampost.co/image/ai.jpeg';
            };

            imgEl.src = img;

            el.querySelector('.judul').innerHTML = judul;
            el.querySelector('.editor').textContent = `By ${editor}`;
            el.querySelector('.tanggal').textContent = tanggal;
            el.querySelector('.deskripsi').textContent = deskripsi;

            // 🔥 URL clean
            el.href = `/${kategoriSlug}/${post.slug}`;

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