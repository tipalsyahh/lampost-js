document.addEventListener('DOMContentLoaded', async () => {

  const container = document.querySelector('.stiab-terbaru');
  if (!container) return;

  const API_URL =
    'https://lampost.co/microweb/stiab/wp-json/wp/v2/posts?per_page=1&orderby=date&order=desc&_embed';

  try {

    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Gagal mengambil data');

    const posts = await res.json();
    let html = '';

    posts.forEach(post => {

      /* 📝 JUDUL */
      const judul = post.title.rendered;

      /* 🏷️ KATEGORI */
      const kategori =
        post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Berita';

      /* 🏷️ KATEGORI SLUG */
      const kategoriSlug =
        post._embedded?.['wp:term']?.[0]?.[0]?.slug || 'berita';

      /* 🔗 LINK */
      const link = `berita.stiab.html?${kategoriSlug}/${post.slug}`;

      /* ✍️ EDITOR (SAMA DENGAN SCRIPT KEDUA) */
      const editor =
        post._embedded?.author?.[0]?.name || 'Redaksi';

      /* 🖼️ GAMBAR */
      const gambar =
        post._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
        'image/default.jpg';

      /* 📅 TANGGAL */
      const tanggal = new Date(post.date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });

      html += `
        <a href="${link}" class="card-link">
          <div class="card-image-wrapper">
            <img src="${gambar}" alt="${judul}" class="card-image" loading="lazy">

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
    });

    container.innerHTML = html;

  } catch (err) {
    console.error('Gagal load list berita:', err);
    container.innerHTML = 'Gagal memuat berita';
  }

});
