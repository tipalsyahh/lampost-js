document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('.prestasi-terbaru');
  if (!container) return;

  try {
    /* ========================
       1️⃣ AMBIL ID KATEGORI
    ======================== */
    const catRes = await fetch(
      'https://lampost.co/microweb/universitaslampung/wp-json/wp/v2/categories?slug=inspirasi'
    );

    if (!catRes.ok) throw new Error('Gagal ambil kategori');

    const catData = await catRes.json();
    if (!catData.length) throw new Error('Kategori tidak ditemukan');

    const kategoriId = catData[0].id;

    /* ========================
       2️⃣ AMBIL POST BERDASARKAN KATEGORI
    ======================== */
    const api =
      'https://lampost.co/microweb/universitaslampung/wp-json/wp/v2/posts' +
      `?categories=${kategoriId}&per_page=2&orderby=date&order=desc&_embed`;

    const res = await fetch(api);
    if (!res.ok) throw new Error('Gagal mengambil post');

    const posts = await res.json();
    if (!posts.length) {
      container.innerHTML = '<p>Konten Prestasi Mahasiswa tidak tersedia</p>';
      return;
    }

    const fragment = document.createDocumentFragment();

    posts.forEach(post => {
      /* 🏷️ KATEGORI */
      const kategori =
        post._embedded?.['wp:term']?.[0]?.[0] || {
          slug: 'prestasi-mahasiswa',
          name: 'Prestasi Mahasiswa'
        };

      /* 📝 JUDUL */
      const judul = post.title.rendered;
      const slug = post.slug;

      /* 🔗 LINK */
      const linkBerita = `berita.unila.html?berita-terkini/${slug}`;
      const linkKategori = `kategori.unila.html?kategori=${kategori.slug}`;

      /* 📰 DESKRIPSI */
      let deskripsi =
        post.excerpt?.rendered?.replace(/<[^>]+>/g, '').trim() || '';
      if (deskripsi.length > 150) deskripsi = deskripsi.slice(0, 150) + '...';

      /* 🖼️ GAMBAR */
      const gambar =
        post._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
        'image/ai.jpg';

      /* ✍️ EDITOR */
      const editor =
        post._embedded?.author?.[0]?.name || 'Redaksi';

      /* =========================
         📅 TANGGAL → ANGKA
         FORMAT: DD/MM/YYYY
      ========================= */
      const d = new Date(post.date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const tanggal = `${day}/${month}/${year}`;

      const a = document.createElement('a');
      a.href = linkBerita;
      a.className = 'item-info';

      a.innerHTML = `
        <img src="${gambar}" class="img-unila" loading="lazy" alt="${judul}">
        <div class="berita-unila">
          <p class="judul-unila">${judul}</p>

          <p class="kategori">${kategori.name}</p>
          <div class="info-microweb">
            <p class="editor-kkn">By ${editor}</p>
            <p class="tanggal" id="tanggal-unila-berita">${tanggal}</p>
          </div>

          <p class="deskripsi-unila-lanjutan">${deskripsi}</p>
        </div>
      `;

      fragment.appendChild(a);
    });

    container.innerHTML = '';
    container.appendChild(fragment);

  } catch (err) {
    console.error('API gagal dimuat:', err);
    container.innerHTML = '<p>Konten gagal dimuat</p>';
  }
});
