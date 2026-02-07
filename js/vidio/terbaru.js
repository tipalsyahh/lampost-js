document.addEventListener('DOMContentLoaded', async () => {

  const container = document.querySelector('.terbaru');
  if (!container) return;

  try {
    /* ========================
       🌐 REST API WORDPRESS
    ======================== */
    const api =
      'https://lampost.co/wp-json/wp/v2/posts' +
      '?per_page=6&orderby=date&order=desc&_embed';

    const res = await fetch(api);
    if (!res.ok) throw new Error('Gagal mengambil API');

    const posts = await res.json();
    let output = '';

    posts.forEach(post => {

      /* 📝 JUDUL */
      const judul = post.title.rendered;

      /* 🔤 SLUG JUDUL */
      const slug = post.slug;

      /* 🏷️ KATEGORI */
      const category =
        post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Teknokrat';

      /* 🏷️ SLUG KATEGORI */
      const categorySlug =
        post._embedded?.['wp:term']?.[0]?.[0]?.slug || 'teknokrat';

      /* 🔗 LINK DETAIL (KATEGORI DULU, BARU JUDUL) */
      const link = `../../halaman.html?${categorySlug}/${slug}`;

      /* 📰 DESKRIPSI */
      let deskripsi =
        post.excerpt?.rendered
          ?.replace(/<[^>]+>/g, '')
          ?.trim() || '';

      if (deskripsi.length > 150) {
        deskripsi = deskripsi.slice(0, 150) + '...';
      }

      /* 🖼️ GAMBAR */
      const gambar =
        post._embedded?.['wp:featuredmedia']?.[0]?.source_url
        || 'image/ai.jpg';

      /* 📅 TANGGAL */
      const tanggal = new Date(post.date)
        .toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        });

      /* 🧱 OUTPUT */
      output += `
        <a href="${link}" class="item-microweb">
          <img
            src="${gambar}"
            alt="${judul}"
            class="img-terbaru-teknokrat"
            loading="lazy">

          <div class="berita-microweb">
            <p class="judul-terbaru">${judul}</p>
            <div class="info-microweb">
              <p class="tanggal">${tanggal}</p>
            </div>
          </div>
        </a>
      `;
    });

    container.innerHTML =
      output || '<p>Konten tidak tersedia</p>';

  } catch (err) {
    console.error('API gagal dimuat:', err);
    container.innerHTML =
      '<p>Konten gagal dimuat</p>';
  }

});
