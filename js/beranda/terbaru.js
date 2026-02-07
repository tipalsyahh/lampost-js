document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.berita-terbaru');
  if (!container) return;

  const API_URL =
    'https://lampost.co/wp-json/wp/v2/posts?per_page=1&orderby=date&order=desc&_embed';

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

    return `
      <a href="${link}" class="card-link">
        <div class="card-image-wrapper">

          <img src="${gambar}" alt="${judul}" class="card-terbaru" loading="lazy" decoding="async">

          <div class="card-text-overlay">
            <span class="card-text">${judul}</span>

            <div class="card-meta">
              <span class="card-author">By ${editor}</span>
              <span class="card-date">${tanggal}</span>
              <span class="card-category">${kategori}</span>
            </div>

          </div>
        </div>
      </a>
    `;
  }

  // 🔥 fetch non-blocking
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