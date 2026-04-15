document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.pariwisata');
  if (!container) return;

  const catCache = {};

  function getCategory(catId) {
    if (!catId) return Promise.resolve({ name: 'Berita', slug: 'berita' });
    if (catCache[catId]) return Promise.resolve(catCache[catId]);

    return fetch(`https://lampost.co/wp-json/wp/v2/categories/${catId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        const result = {
          name: data?.name || 'Berita',
          slug: data?.slug || 'berita'
        };
        catCache[catId] = result;
        return result;
      })
      .catch(() => ({ name: 'Berita', slug: 'berita' }));
  }

  fetch(`https://lampost.co/wp-json/wp/v2/posts?per_page=8&_embed`)
    .then(res => res.ok ? res.json() : [])
    .then(async posts => {

      if (!posts.length) {
        container.innerHTML = '<p>Data tidak ditemukan</p>';
        return;
      }

      const items = await Promise.all(posts.map(async post => {

        const judul = post.title.rendered;

        const media = post._embedded?.['wp:featuredmedia']?.[0];
        const imgUrl =
          media?.media_details?.sizes?.full?.source_url ||
          media?.source_url ||
          'https://via.placeholder.com/300x200';

        const kategoriData = await getCategory(post.categories?.[0]);

        const link = `halaman.html?${kategoriData.slug}/${post.slug}`;

        return `
          <a href="${link}" class="post-item">
            <div class="post-thumb">
              <img src="${imgUrl}" alt="${judul}" loading="lazy" decoding="async">
            </div>
            <div class="post-content">
              <div class="post-category">${kategoriData.name}</div>
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