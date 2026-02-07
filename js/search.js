document.addEventListener('DOMContentLoaded', () => {
  const title = document.querySelector('h2.search-title');
  const container = document.getElementById('search-results');
  if (!title || !container) return;

  const params = new URLSearchParams(location.search);
  const q = params.get('q') || '';
  const query = decodeURIComponent(q).trim();
  const queryLower = query.toLowerCase();

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
    if (!id) return { name: 'Berita', slug: 'berita' };
    if (catCache[id]) return catCache[id];

    const res = await fetch(`https://lampost.co/wp-json/wp/v2/categories/${id}`);
    const data = await res.json();

    return (catCache[id] = { name: data.name, slug: data.slug });
  }

  async function getMedia(id) {
    if (!id || id === 0) return null;
    if (mediaCache[id]) return mediaCache[id];

    try {
      const res = await fetch(`https://lampost.co/wp-json/wp/v2/media/${id}`);
      if (!res.ok) return null;

      const data = await res.json();
      const img =
        data.media_details?.sizes?.medium?.source_url ||
        data.source_url ||
        null;

      mediaCache[id] = img;
      return img;
    } catch {
      return null;
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
        <img class="img-microweb" loading="lazy">
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

    if (img) imgEl.src = img;
    else imgEl.remove();

    const { name: kategori, slug } = await getCategory(post);
    const editor = await getEditor(post);

    el.href = `halaman.html?${slug}/${post.slug}`;
    el.querySelector('.kategori').textContent = kategori;
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
        `&per_page=${PER_PAGE}&page=${page}`
      );

      if (!res.ok) {
        finished = true;
        btn.remove();
        if (!hasRendered) {
          container.innerHTML =
            `<p>Berita "<strong>${query}</strong>" tidak ditemukan.</p>`;
        }
        return;
      }

      const posts = await res.json();

      if (!posts.length) {
        finished = true;
        btn.remove();
        if (!hasRendered) {
          container.innerHTML =
            `<p>Berita "<strong>${query}</strong>" tidak ditemukan.</p>`;
        }
        return;
      }

      const filtered = posts.filter(post => {
        const title = post.title.rendered.toLowerCase();
        const raw = post.excerpt?.rendered || post.content?.rendered || '';
        const text = raw.replace(/(<([^>]+)>)/gi, '').toLowerCase();
        return title.includes(queryLower) || text.includes(queryLower);
      });

      if (!hasRendered && filtered.length) container.innerHTML = '';

      if (filtered.length) {
        container.insertAdjacentHTML(
          'beforeend',
          filtered.map(renderItem).join('')
        );

        filtered.forEach(post => enrich(post));
        hasRendered = true;

        if (!btn.isConnected) container.after(btn);
      } else if (!hasRendered && page === 1) {
        finished = true;
        btn.remove();
        container.innerHTML =
          `<p>Berita "<strong>${query}</strong>" tidak ditemukan.</p>`;
      }

      page++;
      btn.textContent = 'Load More';
    } catch {
      btn.textContent = 'Gagal memuat';
    }

    loading = false;
  }

  const btn = document.createElement('button');
  btn.className = 'load-more';
  btn.textContent = 'Load More';
  btn.addEventListener('click', loadMore);

  loadMore();
});
