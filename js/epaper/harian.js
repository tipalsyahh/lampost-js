document.addEventListener('DOMContentLoaded', async () => {

  const berita = document.getElementById('berita');
  if (!berita) return;

  // 🔥 Ambil kategori & slug judul dari URL
  const query = window.location.search.replace('?', '');
  const [kategoriSlug, slug] = query.split('/');

  if (!slug) {
    berita.innerHTML = '<p>Berita tidak ditemukan</p>';
    return;
  }

  try {
    const api =
      `https://lampost.co/epaper/wp-json/wp/v2/posts?slug=${slug}&_embed`;

    const res = await fetch(api);
    if (!res.ok) throw new Error('Gagal ambil berita');

    const posts = await res.json();
    if (!posts.length) throw new Error('Berita tidak ada');

    const post = posts[0];

    /* ========================
       📝 JUDUL
    ======================== */
    document.querySelector('.judul-berita').innerHTML =
      post.title.rendered;

    /* ========================
       📰 ISI BERITA
    ======================== */
    const isi = document.querySelector('.isi-berita');
    isi.innerHTML = post.content.rendered;

    /* ========================
       🖼️ PAKSA IMG RESPONSIVE
    ======================== */
    isi.querySelectorAll('img').forEach(img => {
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.display = 'block';
    });

    /* ========================
       🖼️ GAMBAR UTAMA
    ======================== */
    const gambar = document.querySelector('.gambar-berita');
    if (gambar) {
      gambar.src =
        post._embedded?.['wp:featuredmedia']?.[0]?.source_url
        || 'image/default.jpg';

      gambar.style.maxWidth = '100%';
      gambar.style.height = 'auto';
    }

    /* ========================
       📅 TANGGAL
    ======================== */
    document.getElementById('tanggal').innerText =
      new Date(post.date).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

    /* ========================
       ✍️ EDITOR
    ======================== */
    const editor = document.getElementById('editor');
    if (editor) {
      editor.innerText =
        post._embedded?.['wp:term']?.[2]?.[0]?.name ||
        'Redaksi';
    }

    /* ========================
       🏷️ KATEGORI (DITAMPILKAN)
    ======================== */
    const kategoriEl = document.getElementById('kategori');
    if (kategoriEl) {
      const kategoriNama =
        post._embedded?.['wp:term']?.[0]?.[0]?.name ||
        kategoriSlug ||
        'Berita';

      kategoriEl.innerText = kategoriNama;
    }

  } catch (err) {
    console.error(err);
    berita.innerHTML = '<p>Gagal memuat berita</p>';
  }

});
