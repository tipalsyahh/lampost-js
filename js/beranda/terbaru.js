document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.berita-terbaru');
  if (!container) return;

  const CATEGORY_API = 'https://lampost.co/wp-json/wp/v2/categories?slug=kriminal';

  const stripHTML = html => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  // 🔥 TAMBAHAN CACHE
  const catCache = {};

  async function getParentCategory(parentId) {
    if (!parentId) return null;
    if (catCache[parentId]) return catCache[parentId];

    try {
      const res = await fetch(`https://lampost.co/wp-json/wp/v2/categories/${parentId}`);
      const data = await res.json();

      return (catCache[parentId] = {
        name: data.name,
        slug: data.slug,
        parent: data.parent
      });
    } catch {
      return null;
    }
  }

  async function setContent(post, el) {

    const judul = post.title.rendered;

    const catData = post._embedded?.['wp:term']?.[0]?.[0];
    const kategori = catData?.name || 'Kriminal';
    const kategoriSlug = catData?.slug || 'kriminal';
    const parentId = catData?.parent || 0;

    const editor = post._embedded?.['wp:term']?.[2]?.[0]?.name || 'Redaksi';
    const gambar = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://lampost.co/image/ai.jpeg';

    // 🔥 AMBIL PARENT
    const parent = await getParentCategory(parentId);

    // 🔥 BUILD URL BARU
    let link = `/${kategoriSlug}/${post.slug}`;

    if (parent && parent.slug) {
      link = `/${parent.slug}/${kategoriSlug}/${post.slug}`;
    }

    const tanggal = new Date(post.date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const deskripsi = post.excerpt?.rendered
      ? stripHTML(post.excerpt.rendered).slice(0, 140) + '...'
      : '';

    el.card.href = link;
    el.img.src = gambar;
    el.img.alt = judul;
    el.date.textContent = tanggal;
    el.title.textContent = judul;
    el.tag.textContent = kategori;
    el.desc.textContent = deskripsi;
    el.editor.textContent = 'By ' + editor;
  }

  fetch(CATEGORY_API)
    .then(r => r.json())
    .then(cat => fetch(`https://lampost.co/wp-json/wp/v2/posts?categories=${cat[0].id}&per_page=5&orderby=date&order=desc&_embed`))
    .then(r => r.json())
    .then(posts => {

      if (!posts.length) return;

      container.innerHTML = `
        <a href="#" class="news-card">
          <div class="news-card-container">
            <div class="news-inner">
              <div class="news-image">
                <img src="" alt="">
                <span class="read-time"></span>
              </div>
              <div class="news-content">
                <h3></h3>
                <div class="news-tags">
                  <span class="tag"></span>
                </div>
                <p class="news-desc"></p>
                <div class="news-meta">
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </a>
      `;

      const el = {
        card: container.querySelector('.news-card'),
        img: container.querySelector('.news-image img'),
        date: container.querySelector('.read-time'),
        title: container.querySelector('.news-content h3'),
        tag: container.querySelector('.tag'),
        desc: container.querySelector('.news-desc'),
        editor: container.querySelector('.news-meta span'),
        inner: container.querySelector('.news-inner')
      };

      let index = 0;

      // 🔥 PERUBAHAN: jadi async
      setContent(posts[index], el);

      el.inner.style.transition = 'opacity 1.2s ease';

      setInterval(() => {
        index = (index + 1) % posts.length;

        el.inner.style.opacity = '0';

        setTimeout(() => {
          setContent(posts[index], el);
          el.inner.style.opacity = '1';
        }, 400);

      }, 4000);

    })
    .catch(err => {
      console.error('Gagal load list berita:', err);
      container.innerHTML = 'Gagal memuat berita';
    });

});