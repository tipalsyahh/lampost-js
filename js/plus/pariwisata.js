document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.pariwisata');
  if (!container) return;

  const catCache = {};
  const mediaCache = {};

  function getCategory(catId) {
    if (!catId) return Promise.resolve({ name: 'Berita', slug: 'berita', parent: 0 });
    if (catCache[catId]) return Promise.resolve(catCache[catId]);

    return fetch(`https://lampost.co/wp-json/wp/v2/categories/${catId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        const result = {
          name: data?.name || 'Berita',
          slug: data?.slug || 'berita',
          parent: data?.parent || 0
        };
        catCache[catId] = result;
        return result;
      })
      .catch(() => ({ name: 'Berita', slug: 'berita', parent: 0 }));
  }

  // ✅ TAMBAHAN: ambil parent category (hierarki)
  async function getCategoryHierarchy(catId) {
    const current = await getCategory(catId);

    // jika tidak punya parent
    if (!current.parent || current.parent === 0) {
      return [current];
    }

    const parent = await getCategory(current.parent);

    // urutan: parent -> child
    return [parent, current];
  }

  function getMedia(mediaId) {
    if (!mediaId) return Promise.resolve('https://lampost.co/image/ai.jpeg');
    if (mediaCache[mediaId]) return Promise.resolve(mediaCache[mediaId]);

    return fetch(`https://lampost.co/wp-json/wp/v2/media/${mediaId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        const url =
          data?.media_details?.sizes?.full?.source_url ||
          data?.source_url ||
          'https://lampost.co/image/ai.jpeg';

        mediaCache[mediaId] = url;
        return url;
      })
      .catch(() => 'https://lampost.co/image/ai.jpeg');
  }

  fetch(`https://lampost.co/wp-json/wp/v2/posts?per_page=8&_fields=id,slug,title,featured_media,categories`)
    .then(res => res.ok ? res.json() : [])
    .then(async posts => {

      if (!posts.length) {
        container.innerHTML = '<p>Data tidak ditemukan</p>';
        return;
      }

      const items = await Promise.all(posts.map(async post => {

        const judul = post.title.rendered;

        const [imgUrl, kategoriHierarchy] = await Promise.all([
          getMedia(post.featured_media),
          getCategoryHierarchy(post.categories?.[0])
        ]);

        // ✅ gabungkan slug jadi parent/child
        const slugPath = kategoriHierarchy.map(c => c.slug).join('/');

        // ambil nama kategori terakhir (child)
        const kategoriName = kategoriHierarchy[kategoriHierarchy.length - 1].name;

        const link = `/${slugPath}/${post.slug}`;

        return `
          <a href="${link}" class="post-item">
            <div class="post-thumb">
              <img src="${imgUrl}" alt="${judul}" loading="lazy" decoding="async">
            </div>
            <div class="post-content">
              <div class="post-category">${kategoriName}</div>
              <div class="post-title">${judul}</div>
            </div>
          </a>
        `;
      }));

      container.innerHTML = items.join('');

    })
    .catch(() => {
      container.innerHTML = '<p>Gagal memuat data</p>';
    });

});