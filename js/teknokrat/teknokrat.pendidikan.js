document.addEventListener('DOMContentLoaded', async () => {

  const container = document.querySelector('.Pendidikan');
  if (!container) return;

  try {
    /* ========================
       1️⃣ AMBIL ID KATEGORI PENDIDIKAN
    ======================== */
    const catRes = await fetch(
      'https://lampost.co/microweb/teknokrat/wp-json/wp/v2/categories?slug=akademik'
    );
    if (!catRes.ok) throw new Error('Gagal ambil kategori');

    const catData = await catRes.json();
    if (!catData.length) throw new Error('Kategori pendidikan tidak ditemukan');

    const kategoriId = catData[0].id;

    /* ========================
       2️⃣ AMBIL POST BERDASARKAN KATEGORI
    ======================== */
    const api =
      'https://lampost.co/microweb/teknokrat/wp-json/wp/v2/posts' +
      `?categories=${kategoriId}&per_page=13&orderby=date&order=desc&_embed`;

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
        post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Pendidikan';

      /* 🏷️ SLUG KATEGORI */
      const categorySlug =
        post._embedded?.['wp:term']?.[0]?.[0]?.slug || 'pendidikan';

      /* 🔗 LINK DETAIL */
      const link = `berita.teknokrat.html?${categorySlug}/${slug}`;

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

      /* 🧱 OUTPUT */
      output += `
        <a href="${link}" class="item-info">
          <img src="${gambar}" alt="${judul}" class="img-microweb" loading="lazy">

          <div class="berita-microweb">
            <p class="judul">${judul}</p>
            <p class="kategori">${category}</p>
            <div class="info-microweb">
              <p class="editor">By ${editor}</p>
              <p class="tanggal">${tanggal}</p>
            </div>

            <p class="deskripsi">${deskripsi}</p>
          </div>
        </a>
      `;
    });

    container.innerHTML =
      output || '<p>Konten pendidikan tidak tersedia</p>';

  } catch (err) {
    console.error('API gagal dimuat:', err);
    container.innerHTML =
      '<p>Konten gagal dimuat</p>';
  }

});
