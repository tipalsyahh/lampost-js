document.addEventListener('DOMContentLoaded', async () => {

  const container = document.querySelector('.home');
  if (!container) return;

  try {
    /* ========================
       🌐 REST API WORDPRESS
    ======================== */
    const api =
      'https://lampost.co/microweb/bsi/wp-json/wp/v2/posts' +
      '?per_page=1&offset=1&orderby=date&order=desc&_embed';

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
        post._embedded?.['wp:term']?.[0]?.[0]?.name || 'UBL';

      /* 🏷️ SLUG KATEGORI */
      const kategoriSlug =
        post._embedded?.['wp:term']?.[0]?.[0]?.slug || 'ubl';

      /* 🔗 LINK */
      const link = `berita.bsi.html?${kategoriSlug}/${slug}`;

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

      /* =========================
         📅 TANGGAL → ANGKA
         FORMAT: DD/MM/YYYY
      ========================= */
      const d = new Date(post.date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const tanggal = `${day}/${month}/${year}`;

      /* ✍️ EDITOR */
      const editor =
        post._embedded?.author?.[0]?.name || 'Redaksi';

      output += `
        <a href="${link}" class="item-info">
          <img
            src="${gambar}"
            alt="${judul}"
            class="img-microweb"
            loading="lazy">

          <div class="berita-microweb">
            <p class="judul">${judul}</p>

            <p class="kategori">${category}</p>
            <div class="info-microweb">
              <p class="editor">Oleh ${editor}</p>
              <p class="tanggal">${tanggal}</p>
            </div>

            <p class="deskripsi">${deskripsi}</p>
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
