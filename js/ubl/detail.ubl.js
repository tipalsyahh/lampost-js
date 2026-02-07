document.addEventListener('DOMContentLoaded', async () => {

  const berita = document.getElementById('berita');
  if (!berita) return;

  // 🔥 Ambil kategori & slug judul dari URL (PAKAI /)
  const query = decodeURIComponent(
    window.location.search.replace('?', '')
  );

  const partsUrl = query.split('/');
  const kategoriSlug = partsUrl[0];
  const slug = partsUrl[1];

  if (!slug) {
    berita.innerHTML = '<p>Berita tidak ditemukan</p>';
    return;
  }

  try {
    const api =
      `https://lampost.co/microweb/ubl/wp-json/wp/v2/posts?slug=${slug}&_embed`;

    const res = await fetch(api);
    if (!res.ok) throw new Error('Gagal ambil berita');

    const posts = await res.json();
    if (!posts.length) throw new Error('Berita tidak ada');

    const post = posts[0];

    /* ========================
       📝 JUDUL
    ======================== */
    const judul = document.querySelector('.judul-berita');
    if (judul) judul.innerHTML = post.title.rendered;

    /* ========================
       📰 ISI BERITA
    ======================== */
    const isi = document.querySelector('.isi-berita');
    isi.innerHTML = post.content.rendered;

    /* ========================
       🧹 HAPUS <p>&nbsp;</p>
    ======================== */
    isi.querySelectorAll('p').forEach(p => {
      const bersih = p.innerHTML
        .replace(/&nbsp;/gi, '')
        .replace(/\s+/g, '')
        .trim();
      if (!bersih) p.remove();
    });

    /* ========================
       🔁 REDIRECT LINK INTERNAL
    ======================== */
    isi.querySelectorAll('a[href]').forEach(link => {
      let href = link.getAttribute('href');
      if (!href) return;

      if (
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')
      ) return;

      try {
        const url = href.startsWith('http')
          ? new URL(href)
          : new URL(href, 'https://lampost.co');

        if (!url.hostname.includes('lampost.co')) return;

        // 🔎 SEARCH
        const search = url.searchParams.get('s');
        if (search) {
          link.href = `search.html?q=${encodeURIComponent(search)}`;
          link.target = '_self';
          return;
        }

        const parts = url.pathname.split('/').filter(Boolean);
        const slugBerita = parts.at(-1);

        if (slugBerita) {
          // 🔥 PAKAI / (BUKAN |)
          link.href = `berita.ubl.html?${kategoriSlug}/${slugBerita}`;
          link.target = '_self';
        } else {
          link.href = 'index.html';
          link.target = '_self';
        }

      } catch {
        link.href = 'index.html';
        link.target = '_self';
      }
    });

    /* ========================
       🖼️ IMG RESPONSIVE
    ======================== */
    isi.querySelectorAll('img').forEach(img => {
      img.removeAttribute('width');
      img.removeAttribute('height');
      img.style.maxWidth = '100%';
      img.style.width = '100%';
      img.style.height = 'auto';
      img.style.display = 'block';
    });

    /* ========================
       🖼️ GAMBAR UTAMA
    ======================== */
    const gambar = document.querySelector('.gambar-berita');
    if (gambar) {
      gambar.src =
        post._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
        'image/default.jpg';

      gambar.style.maxWidth = '100%';
      gambar.style.width = '100%';
      gambar.style.height = 'auto';
    }

    /* ========================
       📅 TANGGAL
    ======================== */
    const tanggal = document.getElementById('tanggal');
    if (tanggal) {
      tanggal.innerText =
        new Date(post.date).toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
    }

    /* ========================
       ✍️ EDITOR
    ======================== */
    const editor = document.getElementById('editor');
    if (editor) {
      editor.innerText =
        post._embedded?.author?.[0]?.name ||
        'Redaksi';
    }

    /* ========================
       🏷️ KATEGORI
    ======================== */
    const kategoriEl = document.getElementById('kategori');
    if (kategoriEl) {
      kategoriEl.innerText =
        post._embedded?.['wp:term']?.[0]?.[0]?.name ||
        kategoriSlug ||
        'Berita';
    }

  } catch (err) {
    console.error(err);
    berita.innerHTML = '<p>Gagal memuat berita</p>';
  }

});