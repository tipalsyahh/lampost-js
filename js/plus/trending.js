document.addEventListener('DOMContentLoaded', () => {

  const wrap = document.querySelector('.lingkar-box');
  if (!wrap) return;

  const cache = {};

  function getSlug(id) {
    if (!id) return Promise.resolve('berita');
    if (cache[id]) return Promise.resolve(cache[id]);

    return fetch(`https://lampost.co/wp-json/wp/v2/categories/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const s = d?.slug || 'berita';
        cache[id] = s;
        return s;
      })
      .catch(() => 'berita');
  }

  // 🔥 UBAH: ambil TAG bukan kategori
  fetch('https://lampost.co/wp-json/wp/v2/tags?slug=lampung-post-executive-forum')
    .then(r => r.ok ? r.json() : [])
    .then(tagData => {

      if (!tagData.length) {
        wrap.innerHTML = `<p>tag tidak ditemukan</p>`;
        return;
      }

      const tagId = tagData[0].id;

      // 🔥 UBAH: pakai tags= bukan categories=
      return fetch(`https://lampost.co/wp-json/wp/v2/posts?tags=${tagId}&per_page=6&orderby=date&order=desc`)
        .then(r => r.ok ? r.json() : [])
        .then(posts => {

          const baseHTML = posts.map((post, i) => {

            const time = new Date(post.date).toLocaleString('id-ID', {
              hour: '2-digit',
              minute: '2-digit'
            });

            return `
              <a href="#" data-i="${i}" class="lingkar-item">
                <div class="lingkar-text">
                  <h4>${post.title.rendered}</h4>
                  <span>${time}</span>
                </div>
                <img data-img="${i}" src="" alt="" loading="lazy">
              </a>
            `;
          }).join('');

          wrap.innerHTML = `
            <div class="lingkar-wrapper">
              <div class="lingkar-bg"></div>
              <div class="lingkar-panel">
                <h3>Liputan Khusus</h3>
                <div class="lingkar-list">
                  ${baseHTML}
                </div>
              </div>
            </div>
          `;

          posts.forEach((post, i) => {

            Promise.all([
              getSlug(post.categories?.[0]),
              post.featured_media
                ? fetch(`https://lampost.co/wp-json/wp/v2/media/${post.featured_media}`)
                    .then(r => r.ok ? r.json() : null)
                    .catch(() => null)
                : Promise.resolve(null)
            ]).then(([slug, media]) => {

              const el = wrap.querySelector(`[data-i="${i}"]`);
              const img = wrap.querySelector(`[data-img="${i}"]`);

              if (el) el.href = `halaman.html?${slug}/${post.slug}`;
              if (img) img.src = media?.source_url || '';

            });

          });

        });
    })
    .catch(() => {
      wrap.innerHTML = `<p>gagal memuat</p>`;
    });

});