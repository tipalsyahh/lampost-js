document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.berita-terbaru');
  if (!container) return;

  const API_URL =
    'https://lampost.co/wp-json/wp/v2/posts?per_page=1&orderby=date&order=desc&_embed';

  function stripHTML(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  function render(post) {

    const judul = post.title.rendered;

    const kategori =
      post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Berita';

    const kategoriSlug =
      post._embedded?.['wp:term']?.[0]?.[0]?.slug || 'berita';

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
              <span class="read-time">4 min read</span>
            </div>
        
            <div class="news-content">
              <h3 class="news-title">${judul}</h3>
        
              <div class="news-tags">
                <span class="tag">${kategori}</span>
              </div>
        
              <p class="news-desc">
                ${deskripsi}
              </p>
        
              <div class="news-meta">
                <span>By ${editor}</span>
                <span>${tanggal}</span>
              </div>
            </div>
        
          </div>
        </a>
    `;
  }

  fetch(API_URL)
    .then(res => {
      if (!res.ok) throw new Error('Fetch error');
      return res.json();
    })
    .then(posts => {
      if (!posts || !posts.length) return;
      container.innerHTML = render(posts[0]);
    })
    .catch(err => {
      console.error('Gagal load list berita:', err);
      container.innerHTML = 'Gagal memuat berita';
    });

});
