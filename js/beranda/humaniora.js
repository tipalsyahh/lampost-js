document.addEventListener('DOMContentLoaded', async () => {

  const container = document.querySelector('.humaniora');
  if (!container) return;

  try {
    // ===============================
    // 1️⃣ AMBIL ID KATEGORI HUMANIORA
    // ===============================
    const catRes = await fetch(
      'https://lampost.co/wp-json/wp/v2/categories?slug=humaniora'
    );
    if (!catRes.ok) throw new Error('Gagal ambil kategori');

    const catData = await catRes.json();
    if (!catData.length) {
      container.insertAdjacentHTML(
        'beforeend',
        '<p>Kategori humaniora tidak ditemukan</p>'
      );
      return;
    }

    const categoryId = catData[0].id;

    // ===============================
    // 2️⃣ AMBIL BERITA HUMANIORA
    // ===============================
    const res = await fetch(
      `https://lampost.co/wp-json/wp/v2/posts?categories=${categoryId}&per_page=4&orderby=date&order=desc&_embed`
    );
    if (!res.ok) throw new Error('Gagal ambil berita');

    const posts = await res.json();

    let html = '';

    posts.forEach(post => {

      /* 📝 JUDUL */
      const judul = post.title.rendered;

      /* 🏷️ KATEGORI SLUG */
      const kategoriSlug =
        post._embedded?.['wp:term']?.[0]?.[0]?.slug || 'berita';

      /* 🔗 LINK (KATEGORI DULU, BARU JUDUL) */
      const link = `halaman.html?${kategoriSlug}/${post.slug}`;

      /* 📅 TANGGAL */
      const tanggal = new Date(post.date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      /* ✍️ EDITOR */
      const editor =
        post._embedded?.['wp:term']?.[2]?.[0]?.name ||
        'Redaksi';

      /* 🖼️ GAMBAR */
      const gambar =
        post._embedded?.['wp:featuredmedia']?.[0]?.source_url
        || 'image/ai.jpg';

      html += `
        <a href="${link}" class="item-olahraga">
          <img src="${gambar}" alt="${judul}" class="img-olahraga" loading="lazy">

          <p class="judul">${judul}</p>

          <div class="meta">
            <span class="editor">By ${editor}</span>
            <span class="tanggal">${tanggal}</span>
          </div>
        </a>
      `;
    });

    // ===============================
    // 3️⃣ SISIPKAN KE DOM
    // ===============================
    container.insertAdjacentHTML('beforeend', html);

  } catch (err) {
    console.error(err);
    container.insertAdjacentHTML(
      'beforeend',
      '<p>Gagal memuat berita humaniora</p>'
    );
  }

});
