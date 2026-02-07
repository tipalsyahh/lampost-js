document.addEventListener('DOMContentLoaded', async () => {
  const container = document.querySelector('.prestasi-terbaru');
  if (!container) return;

  try {
    /* ========================
       AMBIL POST TERBARU (TANPA KATEGORI)
    ======================== */
    const api =
      'https://lampost.co/microweb/ubl/wp-json/wp/v2/posts' +
      '?per_page=2&orderby=date&order=desc&_embed';

    const res = await fetch(api);
    if (!res.ok) throw new Error('Gagal mengambil post');

    const posts = await res.json();
    if (!posts.length) {
      container.innerHTML = '<p>Konten Prestasi Mahasiswa tidak tersedia</p>';
      return;
    }

    const fragment = document.createDocumentFragment();

    posts.forEach(post => {
      /* 📝 JUDUL */
      const judul = post.title.rendered;
      const slug = post.slug;

      /* 🔗 LINK */
      const linkBerita = `berita.ubl.html?berita-terkini/${slug}`;

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

      /* 📅 TANGGAL */
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
