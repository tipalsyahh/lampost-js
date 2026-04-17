document.addEventListener('DOMContentLoaded', async () => {

  const berita = document.getElementById('berita');
  if (!berita) return;

  const isLocal =
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    location.protocol === 'file:';

  let kategoriSlug, slug;

  /* ========================
     🔥 SUPPORT 2 MODE URL
     1. ?kategori/slug
     2. /microweb/unila/kategori/slug
  ======================== */
  if (window.location.search) {
    const query = decodeURIComponent(window.location.search.substring(1) || '');
    const parts = query.split('/').filter(Boolean);

    if (parts.length >= 2) {
      kategoriSlug = parts[0];
      slug = parts.slice(1).join('/');
    }

  } else {
    const path = window.location.pathname.split('/').filter(Boolean);

    // microweb / unila / kategori / slug
    if (path.length >= 4) {
      kategoriSlug = path[2];
      slug = path.slice(3).join('/');
    }
  }

  /* ========================
     🔥 AUTO CLEAN URL
  ======================== */
  if (!isLocal && window.location.search && kategoriSlug && slug) {
    try {
      const cleanUrl = `/microweb/unila/${kategoriSlug}/${slug}`;
      history.replaceState(null, '', cleanUrl);
    } catch (e) {}
  }

  if (!slug) {
    berita.innerHTML = '<p>Berita tidak ditemukan</p>';
    return;
  }

  try {
    const api =
      `https://lampost.co/microweb/universitaslampung/wp-json/wp/v2/posts?slug=${slug}&_embed`;

    const res = await fetch(api);
    if (!res.ok) throw new Error('Gagal ambil berita');

    const posts = await res.json();
    if (!posts.length) throw new Error('Berita tidak ada');

    const post = posts[0];

    /* ======================== */
    const judul = document.querySelector('.judul-berita');
    if (judul) judul.innerHTML = post.title.rendered;

    const isi = document.querySelector('.isi-berita');
    isi.innerHTML = post.content.rendered;

    /* ======================== */
    isi.querySelectorAll('p').forEach(p => {
      const bersih = p.innerHTML
        .replace(/&nbsp;/gi, '')
        .replace(/\s+/g, '')
        .trim();
      if (!bersih) p.remove();
    });

    /* ========================
       🔁 LINK INTERNAL (DINAMIS KATEGORI)
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

        const search = url.searchParams.get('s');
        if (search) {
          link.href = `/microweb/search.html?q=${encodeURIComponent(search)}`;
          return;
        }

        const parts = url.pathname.split('/').filter(Boolean);

        const slugBerita = parts.at(-1);
        const kategoriBaru = parts.at(-2) || 'berita';

        if (slugBerita) {
          // 🔥 KATEGORI DINAMIS
          link.href = `/microweb/unila/${kategoriBaru}/${slugBerita}`;
          link.target = '_self';
        } else {
          link.href = `/microweb/unila/`;
        }

      } catch {
        link.href = `/microweb/unila/`;
      }
    });

    /* ======================== */
    isi.querySelectorAll('img').forEach(img => {
      img.removeAttribute('width');
      img.removeAttribute('height');
      img.style.maxWidth = '100%';
      img.style.width = '100%';
      img.style.height = 'auto';
      img.style.display = 'block';
    });

    /* ======================== */
    const gambar = document.querySelector('.gambar-berita');
    if (gambar) {
      gambar.src =
        post._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
        'image/default.jpg';
    }

    /* ======================== */
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

    /* ======================== */
    const editor = document.getElementById('editor');
    if (editor) {
      editor.innerText =
        post._embedded?.author?.[0]?.name ||
        'Redaksi';
    }

    /* ======================== */
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