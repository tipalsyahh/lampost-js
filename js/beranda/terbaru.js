document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.berita-terbaru');
  if (!container) return;

  const CATEGORY_API = 'https://lampost.co/wp-json/wp/v2/categories?slug=kriminal';

  function stripHTML(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  function render(post) {

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

    return `
      <a href="${link}" class="news-card">
        <div class="news-card-container">
      
          <div class="news-image">
            <img src="${gambar}" alt="${judul}" loading="lazy" decoding="async">
            <span class="read-time">${tanggal}</span>
          </div>
      
          <div class="news-content">
            <h3 class="news-title">${judul}</h3>
      
            <div class="news-tags">
              <span class="tag">${kategori}</span>
            </div>
      
            <p class="news-desc">${deskripsi}</p>
      
            <div class="news-meta">
              <span>By ${editor}</span>
            </div>
          </div>
      
        </div>
      </a>
    `;
  }

  fetch(CATEGORY_API)
    .then(res => {
      if (!res.ok) throw new Error('Gagal ambil kategori');
      return res.json();
    })
    .then(cat => {

      if (!cat.length) throw new Error('Kategori kriminal tidak ditemukan');

      const catId = cat[0].id;

      return fetch(`https://lampost.co/wp-json/wp/v2/posts?categories=${catId}&per_page=5&orderby=date&order=desc&_embed`);
    })
    .then(res => {
      if (!res.ok) throw new Error('Gagal ambil berita');
      return res.json();
    })
    .then(posts => {

      if (!posts || !posts.length) return;

      let index = 0;
      container.innerHTML = render(posts[index]);

      setInterval(() => {
        index = (index + 1) % posts.length;

        const card = container.querySelector('.news-card-container');

        if (card) {
          card.classList.add('fade-out');

          setTimeout(() => {
            container.innerHTML = render(posts[index]);

            const newCard = container.querySelector('.news-card-container');
            newCard.classList.add('fade-in');

            setTimeout(() => {
              newCard.classList.remove('fade-in');
            }, 300);

          }, 300);
        }

      }, 4000);

    })
    .catch(err => {
      console.error('Gagal load list berita:', err);
      container.innerHTML = 'Gagal memuat berita';
    });

});
