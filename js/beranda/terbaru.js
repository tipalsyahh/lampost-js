document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.berita-terbaru');
  if (!container) return;

  const CATEGORY_API = 'https://lampost.co/wp-json/wp/v2/categories?slug=kriminal';

  function stripHTML(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  function setContent(post, el) {

    const judul = post.title.rendered;

    const kategori =
      post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Kriminal';

    const kategoriSlug =
      post._embedded?.['wp:term']?.[0]?.[0]?.slug || 'kriminal';

    const link = `halaman.html?${kategoriSlug}/${post.slug}`;

    const editor =
      post._embedded?.['wp:term']?.[2]?.[0]?.name || 'Redaksi';

    const gambar =
      post._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
      'image/default.jpg';

    const tanggal = new Date(post.date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const deskripsi = post.excerpt?.rendered
      ? stripHTML(post.excerpt.rendered).substring(0, 140) + '...'
      : '';

    el.querySelector('.news-card').href = link;
    el.querySelector('.news-image img').src = gambar;
    el.querySelector('.news-image img').alt = judul;
    el.querySelector('.read-time').textContent = tanggal;
    el.querySelector('.news-title').textContent = judul;
    el.querySelector('.tag').textContent = kategori;
    el.querySelector('.news-desc').textContent = deskripsi;
    el.querySelector('.news-meta span').textContent = 'By ' + editor;
  }

  fetch(CATEGORY_API)
    .then(res => res.json())
    .then(cat => {

      const catId = cat[0].id;

      return fetch(`https://lampost.co/wp-json/wp/v2/posts?categories=${catId}&per_page=5&orderby=date&order=desc&_embed`);
    })
    .then(res => res.json())
    .then(posts => {

      if (!posts.length) return;

      let index = 0;

      container.innerHTML = `
        <a href="#" class="news-card">
          <div class="news-card-container">

            <div class="news-inner">

              <div class="news-image">
                <img src="" alt="">
                <span class="read-time"></span>
              </div>

              <div class="news-content">
                <h3 class="news-title"></h3>
                <div class="news-tags">
                  <span class="tag"></span>
                </div>
                <p class="news-desc"></p>
                <div class="news-meta">
                  <span></span>
                </div>
              </div>

            </div>

          </div>
        </a>
      `;

      const wrapper = container;
      const inner = wrapper.querySelector('.news-inner');

      setContent(posts[index], wrapper);

      inner.style.transition = 'opacity 1.5s ease-in-out';

      setInterval(() => {
        index = (index + 1) % posts.length;

        inner.style.opacity = '0';

        setTimeout(() => {
          setContent(posts[index], wrapper);
          inner.style.opacity = '1';
        }, 600);

      }, 4000);

    })
    .catch(err => {
      console.error('Gagal load list berita:', err);
      container.innerHTML = 'Gagal memuat berita';
    });

});
