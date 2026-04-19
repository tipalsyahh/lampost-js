document.addEventListener('DOMContentLoaded', async () => {

  const berita = document.getElementById('berita');
  if (!berita) return;

  const isLocal =
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    location.protocol === 'file:';

  // 🔥 TAMBAHAN (tidak menghapus yang lama)
  let kategoriSlug, subKategori, slug;
  let parentSlug = '';
  let childSlug = '';

  if (window.location.search) {
    const query = decodeURIComponent(window.location.search.substring(1) || '');
    const parts = query.split('/').filter(Boolean);

    // 🔥 SUPPORT SUB KATEGORI
    if (parts.length >= 3) {
      kategoriSlug = parts[0];
      subKategori = parts[1];
      slug = parts.slice(2).join('/');
    } else if (parts.length >= 2) {
      kategoriSlug = parts[0];
      slug = parts.slice(1).join('/');
    }

  } else {
    const path = window.location.pathname.replace('.html', '').split('/').filter(Boolean);

    // 🔥 SUPPORT SUB KATEGORI
    if (path.length >= 3) {
      kategoriSlug = path[0];
      subKategori = path[1];
      slug = path.slice(2).join('/');
    } else if (path.length >= 2) {
      kategoriSlug = path[0];
      slug = path.slice(1).join('/');
    }
  }

  // 🔥 CLEAN URL AWAL (LOGIKA LAMA — TETAP ADA)
  if (!isLocal && window.location.search && kategoriSlug && slug) {
    try {
      const cleanUrl = `/${kategoriSlug}/${slug}`;
      history.replaceState(null, '', cleanUrl);
    } catch (e) { }
  }

  if (!slug) {
    berita.innerHTML = '<p>Berita tidak ditemukan</p>';
    return;
  }

  try {

    const api = `https://lampost.co/wp-json/wp/v2/posts?slug=${slug}&orderby=date&order=desc&_embed`;
    const res = await fetch(api);
    if (!res.ok) throw new Error();

    const posts = await res.json();
    if (!posts.length) {
      berita.innerHTML = '<p>Berita tidak ditemukan</p>';
      return;
    }

    const post = posts[0];

    // 🔥 TAMBAHAN: AMBIL KATEGORI ASLI WORDPRESS
    try {
      if (post.categories && post.categories.length) {

        const catRes = await fetch(`https://lampost.co/wp-json/wp/v2/categories/${post.categories[0]}`);
        const cat = await catRes.json();

        childSlug = cat.slug;

        if (cat.parent && cat.parent !== 0) {
          const parentRes = await fetch(`https://lampost.co/wp-json/wp/v2/categories/${cat.parent}`);
          const parent = await parentRes.json();
          parentSlug = parent.slug;
        }
      }
    } catch (e) {}

    // 🔥 OVERRIDE CLEAN URL (INI YANG MEMPERBAIKI MASALAH)
    if (!isLocal && slug) {
      try {
        let cleanUrl = '/';

        if (parentSlug) cleanUrl += parentSlug + '/';
        if (childSlug) cleanUrl += childSlug + '/';

        cleanUrl += slug;

        history.replaceState(null, '', cleanUrl);
      } catch (e) {}
    }

    fetch(`https://lampost.co/wp-json/custom/v1/view/${post.id}`);
    new Image().src = `https://lampost.co/?p=${post.id}`;

    document.title = post.title.rendered + ' - Lampost';

    const judulEl = document.querySelector('.judul-berita');
    if (judulEl) judulEl.innerHTML = post.title.rendered;

    let subJudulText = '';

    if (post.meta?.jnews_single_post?.subtitle) {
      subJudulText = post.meta.jnews_single_post.subtitle;
    }

    subJudulText = (subJudulText || '').replace(/<[^>]+>/g, '').trim();

    document.querySelectorAll('.subjudul-berita').forEach(el => el.remove());

    if (judulEl && subJudulText !== '') {
      const subJudulEl = document.createElement('p');
      subJudulEl.className = 'subjudul-berita';
      subJudulEl.innerText = subJudulText;
      judulEl.insertAdjacentElement('afterend', subJudulEl);
    }

    const isi = document.querySelector('.isi-berita');
    isi.innerHTML = post.content.rendered;

    isi.querySelectorAll('iframe, video, embed').forEach(el => el.remove());

    let videoUsed = false;

    try {
      const videoRes = await fetch(`https://lampost.co/wp-json/custom/v1/video/${post.id}`);
      const videoData = await videoRes.json();

      let videoUrl =
        videoData?.video ||
        videoData?.url ||
        videoData?.embed ||
        '';

      if (typeof videoUrl === 'object' && videoUrl.rendered) {
        videoUrl = videoUrl.rendered;
      }

      let videoId = null;

      if (videoUrl.includes('<iframe')) {
        const match = videoUrl.match(/embed\/([a-zA-Z0-9_-]+)/);
        if (match) videoId = match[1];
      }

      if (!videoId && videoUrl.includes('youtube.com')) {
        videoId = videoUrl.split('v=')[1]?.split('&')[0];
      }

      if (!videoId && videoUrl.includes('youtu.be')) {
        videoId = videoUrl.split('/').pop();
      }

      if (videoId) {

        videoUsed = true;

        const thumbDiv = document.createElement('div');
        thumbDiv.style.cssText = `
          background-image:url('https://i.ytimg.com/vi/${videoId}/hqdefault.jpg');
          width:100%;
          padding-top:56.25%;
          background-size:cover;
          background-position:center;
          position:relative;
          cursor:pointer;
          margin-bottom:1rem;
        `;

        const play = document.createElement('div');
        play.innerText = '▶';
        play.style.cssText = `
          position:absolute;
          top:50%;
          left:50%;
          transform:translate(-50%,-50%);
          font-size:60px;
          color:white;
          text-shadow:0 0 10px rgba(0,0,0,.8);
        `;

        thumbDiv.appendChild(play);

        thumbDiv.addEventListener('click', () => {
          thumbDiv.outerHTML = `
            <iframe
              width="100%"
              height="400"
              src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0"
              frameborder="0"
              allow="autoplay; encrypted-media"
              allowfullscreen>
            </iframe>
          `;
        });

        isi.prepend(thumbDiv);
      }

    } catch (e) {}

    if (videoUsed) {
      isi.querySelectorAll('img').forEach(img => img.remove());
      const gambarFix = document.querySelector('.gambar-berita');
      if (gambarFix) gambarFix.style.display = 'none';
    }

    isi.querySelectorAll('p').forEach(p => {
      const t = p.innerHTML.replace(/&nbsp;/g, '').replace(/\s+/g, '').trim();
      if (!t) p.remove();
    });

    // 🔥 PERBAIKAN LINK INTERNAL (TANPA HAPUS LOGIKA)
    isi.querySelectorAll('a[href]').forEach(link => {
      let href = link.getAttribute('href');
      if (!href) return;
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      try {
        const url = href.startsWith('http') ? new URL(href) : new URL(href, 'https://lampost.co');
        if (!url.hostname.includes('lampost.co')) return;

        const searchParam = url.searchParams.get('s');

        if (searchParam) {
          link.href = `/search?q=${encodeURIComponent(searchParam)}`;
          link.target = '_self';
          return;
        }

        const parts = url.pathname.split('/').filter(Boolean);

        if (parts.includes('search')) {
          const q = url.searchParams.get('q') || '';
          link.href = `/search${q ? `?q=${encodeURIComponent(q)}` : ''}`;
          link.target = '_self';
          return;
        }

        // 🔥 FIX: tidak lagi potong kategori
        if (parts.length >= 2) {
          const newPath = '/' + parts.slice(-3).join('/');
          link.href = newPath;
          link.target = '_self';
          return;
        }

        link.href = '/';
        link.target = '_self';

      } catch {
        link.href = '/';
        link.target = '_self';
      }
    });

    // 🔽 SEMUA KODE DI BAWAH INI TETAP SAMA (TIDAK DIUBAH)

    isi.querySelectorAll('img').forEach(img => {
      img.removeAttribute('width');
      img.removeAttribute('height');
      img.style.width = '100%';
      img.style.height = 'auto';
      img.style.display = 'block';
    });

    isi.querySelectorAll('figure').forEach(f => {
      f.style.width = '100%';
      f.style.margin = '1rem auto';
    });

    isi.querySelectorAll('.alignleft,.alignright').forEach(el => {
      el.style.float = 'none';
      el.style.margin = '1rem auto';
    });

    isi.querySelectorAll('figcaption, .wp-caption-text, p.wp-caption-text').forEach(el => el.remove());

    isi.querySelectorAll('p, blockquote').forEach(el => {

      const text = el.innerText.replace(/\s+/g, ' ').trim().toUpperCase();

      if (text.includes('BACA JUGA')) {

        const links = el.querySelectorAll('a');
        if (!links.length) return;

        const wrapper = document.createElement('blockquote');
        wrapper.className = 'baca-juga';

        const label = document.createElement('span');
        label.className = 'label';
        label.innerText = 'BACA JUGA:';

        wrapper.appendChild(label);

        links.forEach(link => {
          const newLink = document.createElement('a');
          newLink.href = link.href;
          newLink.innerText = link.innerText;
          wrapper.appendChild(newLink);
        });

        el.replaceWith(wrapper);
      }
    });

  } catch (err) {
    console.error(err);
    berita.innerHTML = '<p>Gagal memuat berita</p>';
  }

});