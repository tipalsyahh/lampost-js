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

  fetch('https://lampost.co/wp-json/wp/v2/categories?slug=breaking-news')
    .then(res => res.ok ? res.json() : [])
    .then(catData => {
      if (!catData.length) {
        container.innerHTML = '<p>Data tidak ditemukan</p>';
        return;
      }

      const categoryId = catData[0].id;

      return fetch(`https://lampost.co/wp-json/wp/v2/posts?categories=${categoryId}&per_page=8`)
        .then(res => res.ok ? res.json() : [])
        .then(posts => {

          const promises = posts.map(post => {
            const judul = post.title.rendered;

            const mediaFetch = post.featured_media
              ? fetch(`https://lampost.co/wp-json/wp/v2/media/${post.featured_media}`)
                  .then(r => r.ok ? r.json() : null)
                  .catch(() => null)
              : Promise.resolve(null);

            return Promise.all([
              getCategory(post.categories?.[0]),
              mediaFetch
            ]).then(([kategoriData, media]) => {

              const imgUrl = media?.source_url || 'https://via.placeholder.com/300x200';
              const link = `halaman.html?${kategoriData.slug}/${post.slug}`;

              return `
              <a href="${link}" class="post-item">
                <div class="post-thumb">
                  <img src="${imgUrl}" alt="${judul}" loading="lazy">
                </div>
                <div class="post-content">
                  <div class="post-category">${kategoriData.name}</div>
                  <div class="post-title">${judul}</div>
                </div>
              </a>
              `;
            });
          });

          Promise.all(promises).then(items => {
            container.innerHTML = items.join('');
          });

        });
    })
    .catch(() => {
      container.innerHTML = '<p>Gagal memuat data</p>';
    });

});
