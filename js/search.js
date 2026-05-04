document.addEventListener('DOMContentLoaded', () => {
  const title = document.querySelector('h2.search-title');
  const container = document.getElementById('search-results');
  if (!title || !container) return;

  const params = new URLSearchParams(location.search);
  const q = params.get('q') || '';
  const query = decodeURIComponent(q).trim();

  title.textContent = `Search Result for '${query}'`;

  if (!query) {
    container.innerHTML = '<p>Masukkan kata kunci pencarian.</p>';
    return;
  }

  container.innerHTML = '<p>Sedang mencari berita...</p>';

  let page = 1;
  let loading = false;
  let finished = false;
  let hasRendered = false;

  const PER_PAGE = 10;

  const catCache = {};
  const mediaCache = {};
  const editorCache = {};

  async function getCategory(post) {
    const id = post.categories?.[post.categories.length - 1];
    if (!id) return { name: 'Berita', slug: 'berita', parent: 0 };
    if (catCache[id]) return catCache[id];

    const res = await fetch(`https://lampost.co/wp-json/wp/v2/categories/${id}`);
    const data = await res.json();

    return (catCache[id] = { name: data.name, slug: data.slug, parent: data.parent });
  }

  async function getParentCategory(parentId) {
    if (!parentId) return null;
    if (catCache[parentId]) return catCache[parentId];

    try {
      const res = await fetch(`https://lampost.co/wp-json/wp/v2/categories/${parentId}`);
      const data = await res.json();
      return (catCache[parentId] = { name: data.name, slug: data.slug, parent: data.parent });
    } catch {
      return null;
    }
  }

  // 🔥 MEDIA FIX (ANTI KOSONG)
  async function getMedia(id) {
    const fallback = 'https://lampost.co/image/ai.jpeg';

    if (!id || id === 0) return fallback;
    if (mediaCache[id]) return mediaCache[id];

    try {
      const res = await fetch(`https://lampost.co/wp-json/wp/v2/media/${id}`);
      if (!res.ok) return fallback;

      const data = await res.json();
      const img =
        data.media_details?.sizes?.medium?.source_url ||
        data.source_url ||
        fallback;

      return (mediaCache[id] = img);
    } catch {
      return fallback;
    }
  }

  async function getEditor(post) {
    if (editorCache[post.id]) return editorCache[post.id];

    let editor = 'Redaksi';
    const term = post._links?.['wp:term']?.[2]?.href;
    if (!term) return editor;

    try {
      const res = await fetch(term);
      const data = await res.json();
      editor = data?.[0]?.name || editor;
    } catch {}

    return (editorCache[post.id] = editor);
  }

  function renderItem(post) {
    const judul = post.title.rendered;
    const tanggal = new Date(post.date).toLocaleDateString('id-ID');
    const id = `search-${post.id}`;

    const deskripsi =
      (post.excerpt?.rendered || post.content?.rendered || '')
        .replace(/(<([^>]+)>)/gi, '')
        .slice(0, 150) + '...';

    return `
      <a href="#" class="item-info" id="${id}">
        <img 
          class="img-microweb" 
          loading="lazy"
          onerror="this.onerror=null;this.src='https://lampost.co/image/ai.jpeg';"
        >
        <div class="berita-microweb">
          <p class="judul">${judul}</p>
          <p class="kategori"></p>
          <div class="info-microweb">
            <p class="editor"></p>
            <p class="tanggal">${tanggal}</p>
          </div>
          <p class="deskripsi">${deskripsi}</p>
        </div>
      </a>
    `;
  }

  async function enrich(post) {
    const el = document.getElementById(`search-${post.id}`);
    if (!el) return;

    const imgEl = el.querySelector('img');
    const img = await getMedia(post.featured_media);

    imgEl.src = img;

    const cat = await getCategory(post);
    const parent = await getParentCategory(cat.parent);
    const editor = await getEditor(post);

    let finalUrl = `/${cat.slug}/${post.slug}`;
    if (parent && parent.slug) {
      finalUrl = `/${parent.slug}/${cat.slug}/${post.slug}`;
    }

    el.href = finalUrl;
    el.querySelector('.kategori').textContent = cat.name;
    el.querySelector('.editor').textContent = `By ${editor}`;
  }

  async function loadMore() {
    if (loading || finished) return;
    loading = true;

    if (btn.isConnected) btn.textContent = 'Memuat...';

    try {
      const res = await fetch(
        `https://lampost.co/wp-json/wp/v2/posts` +
        `?search=${encodeURIComponent(query)}` +
        `&search_columns=title,content` +
        `&per_page=${PER_PAGE}&page=${page}`
      );

      if (!res.ok) {
        finished = true;
        btnWrapper.remove();
        if (!hasRendered) {
          container.innerHTML =
            `<p>Berita "<strong>${query}</strong>" tidak ditemukan.</p>`;
        }
        return;
      }

      const posts = await res.json();

      if (!posts.length) {
        finished = true;
        btnWrapper.remove();
        if (!hasRendered) {
          container.innerHTML =
            `<p>Berita "<strong>${query}</strong>" tidak ditemukan.</p>`;
        }
        return;
      }

      if (!hasRendered) container.innerHTML = '';

      container.insertAdjacentHTML(
        'beforeend',
        posts.map(renderItem).join('')
      );

      posts.forEach(post => enrich(post));
      hasRendered = true;

      if (!btnWrapper.isConnected) container.appendChild(btnWrapper);

      page++;
      btn.textContent = 'Load More';

    } catch {
      btn.textContent = 'Gagal memuat';
    }

    loading = false;
  }

  // 🔥 BUTTON CENTER
  const btn = document.createElement('button');
  btn.className = 'load-more';
  btn.textContent = 'Load More';
  btn.addEventListener('click', loadMore);

  const btnWrapper = document.createElement('div');
  btnWrapper.style.textAlign = 'center';
  btnWrapper.style.margin = '20px 0';
  btnWrapper.appendChild(btn);

  loadMore();
});