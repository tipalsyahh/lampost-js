document.addEventListener('DOMContentLoaded', async () => {

  const berita = document.getElementById('berita');
  if (!berita) return;

  const isLocal =
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    location.protocol === 'file:';

  let kategoriSlug, slug;

  if (window.location.search) {
    const query = decodeURIComponent(window.location.search.substring(1) || '');
    const parts = query.split('/').filter(Boolean);
    if (parts.length >= 2) {
      kategoriSlug = parts[0];
      slug = parts.slice(1).join('/');
    }
  } else {
    const path = window.location.pathname.replace('.html', '').split('/').filter(Boolean);
    if (path.length >= 3 && path[0] === 'index') {
      kategoriSlug = path[1];
      slug = path.slice(2).join('/');
    } else if (path.length >= 2) {
      kategoriSlug = path[0];
      slug = path.slice(1).join('/');
    }
  }

  if (!isLocal && window.location.search && kategoriSlug && slug) {
    try {
      const cleanUrl = `/index/${kategoriSlug}/${slug}`;
      history.replaceState(null, '', cleanUrl);
    } catch (e) { }
  }

  if (!slug) {
    berita.innerHTML = '<p>Berita tidak ditemukan</p>';
    return;
  }

  try {

    const api = `https://lampost.co/wp-json/wp/v2/posts?slug=${slug}&orderby=date&order=desc`;
    const res = await fetch(api);
    if (!res.ok) throw new Error();

    const posts = await res.json();
    if (!posts.length) {
      berita.innerHTML = '<p>Berita tidak ditemukan</p>';
      return;
    }

    const post = posts[0];

    document.title = post.title.rendered + ' - Lampost';

    const judulEl = document.querySelector('.judul-berita');
    if (judulEl) judulEl.innerHTML = post.title.rendered;

    const isi = document.querySelector('.isi-berita');
    isi.innerHTML = post.content.rendered;

    isi.querySelectorAll('p').forEach(p => {
      const t = p.innerHTML.replace(/&nbsp;/g, '').replace(/\s+/g, '').trim();
      if (!t) p.remove();
    });

    isi.querySelectorAll('a[href]').forEach(link => {
      let href = link.getAttribute('href');
      if (!href) return;
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      try {
        const url = href.startsWith('http') ? new URL(href) : new URL(href, 'https://lampost.co');
        if (!url.hostname.includes('lampost.co')) return;

        const search = url.searchParams.get('s');
        if (search) {
          link.href = `/index/search?q=${encodeURIComponent(search)}`;
          link.target = '_self';
          return;
        }

        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length >= 2) {
          link.href = `/index/${parts.at(-2)}/${parts.at(-1)}.html`;
          link.target = '_self';
          return;
        }

        link.href = '/index';
        link.target = '_self';
      } catch {
        link.href = '/index';
        link.target = '_self';
      }
    });

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

    const gambar = document.querySelector('.gambar-berita');
    if (gambar && post.featured_media) {
      fetch(`https://lampost.co/wp-json/wp/v2/media/${post.featured_media}`)
        .then(r => r.ok ? r.json() : null)
        .then(m => {
          if (!m) return;

          gambar.src = m.source_url;
          gambar.style.width = '100%';
          gambar.style.height = 'auto';

          document.querySelectorAll('.caption-gambar-utama').forEach(el => el.remove());

          if (m.caption?.rendered) {
            const cap = document.createElement('p');
            cap.className = 'caption-gambar-utama';
            cap.innerHTML = m.caption.rendered;
            cap.style.textAlign = 'center';
            cap.style.fontSize = '11px';
            cap.style.marginTop = '5px';
            gambar.after(cap);
          }
        })
        .catch(() => gambar.src = '/index/image/default.jpg');
    }

    const tanggal = document.getElementById('tanggal');
    if (tanggal) {
      const d = new Date(post.date);
      const tanggalStr = d.toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
      const jam = d.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
      tanggal.innerText = `${tanggalStr} | pukul ${jam}`;
    }

    const editorEl = document.getElementById('editor');
    if (editorEl) {

      const termLink = post._links?.['wp:term']?.find(t =>
        !['category', 'post_tag'].includes(t.taxonomy)
      )?.href;

      if (!termLink) {
        editorEl.innerText = 'Editor Redaksi';
      } else {
        fetch(termLink)
          .then(r => r.ok ? r.json() : [])
          .then(editors => {

            const formatName = (name = '') => {
              return name
                .replace(/-/g, ' ')
                .split(' ')
                .filter(Boolean)
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' ');
            };

            if (!editors.length) {
              editorEl.innerText = 'Editor Redaksi';
            } else if (editors.length === 1) {
              editorEl.innerText = `Editor ${formatName(editors[0].name)}`;
            } else {
              const last = formatName(editors.pop().name);
              const names = editors.map(e => formatName(e.name)).join(', ');
              editorEl.innerText = `Editor ${names}, Penulis ${last}`;
            }
          })
          .catch(() => editorEl.innerText = 'Editor Redaksi');
      }
    }

    const kategoriEl = document.getElementById('kategori');
    if (kategoriEl && post.categories?.[0]) {
      fetch(`https://lampost.co/wp-json/wp/v2/categories/${post.categories[0]}`)
        .then(r => r.ok ? r.json() : null)
        .then(cat => kategoriEl.innerText = cat?.name || kategoriSlug || 'Berita')
        .catch(() => kategoriEl.innerText = kategoriSlug || 'Berita');
    }

    setTimeout(() => {

      const tagBox = document.getElementById("aiTags");
      if (!tagBox) return;

      const tagLink = post._links?.['wp:term']?.find(t => t.taxonomy === 'post_tag')?.href;
      if (!tagLink) return;

      fetch(tagLink)
        .then(r => r.ok ? r.json() : [])
        .then(tags => {

          tagBox.innerHTML = '';

          tags.forEach(tag => {

            const a = document.createElement("a");

            a.href = isLocal
              ? `tag.html?q=${encodeURIComponent(tag.name)}`
              : `/index/tag?q=${encodeURIComponent(tag.name)}`;

            a.innerText = tag.name;
            a.title = tag.name;

            tagBox.appendChild(a);

          });

        })
        .catch(() => { });

    }, 500);

  } catch (err) {
    console.error(err);
    berita.innerHTML = '<p>Gagal memuat berita</p>';
  }

});