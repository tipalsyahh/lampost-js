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
    if (path.length >= 2) {
      kategoriSlug = path[0];
      slug = path.slice(1).join('/');
    }
  }

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
          link.href = `/search?q=${encodeURIComponent(search)}`;
          link.target = '_self';
          return;
        }

        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length >= 2) {
          link.href = `/${parts.at(-2)}/${parts.at(-1)}`;
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

    const gambar = document.querySelector('.gambar-berita');
    if (gambar && post.featured_media) {
      fetch(`https://lampost.co/wp-json/wp/v2/media/${post.featured_media}`)
        .then(r => r.ok ? r.json() : null)
        .then(m => {
          if (!m) return;
          gambar.src = m.source_url;
          gambar.style.width = '100%';
          gambar.style.height = 'auto';
        })
        .catch(() => gambar.src = '/image/default.jpg');
    }

    const tanggal = document.getElementById('tanggal');
    if (tanggal) {
      tanggal.innerText = new Date(post.date).toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
    }

    const editorEl = document.getElementById('editor');
    if (editorEl) {

      const termLink = post._links?.['wp:term']?.find(t =>
        !['category', 'post_tag'].includes(t.taxonomy)
      )?.href;

      if (!termLink) {
        editorEl.innerText = 'oleh Redaksi';
      } else {
        fetch(termLink)
          .then(r => r.ok ? r.json() : [])
          .then(editors => {
            if (!editors.length) {
              editorEl.innerText = 'oleh Redaksi';
            } else if (editors.length === 1) {
              editorEl.innerText = `oleh ${editors[0].name}`;
            } else {
              const last = editors.pop().name;
              editorEl.innerText = `oleh ${editors.map(e => e.name).join(', ')}, dan ${last}`;
            }
          })
          .catch(() => editorEl.innerText = 'oleh Redaksi');
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
              : `/tag.html?q=${encodeURIComponent(tag.name)}`;

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
