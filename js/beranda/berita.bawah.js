document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.populer-mobile');
  if (!container) return;

  const PER_PAGE = 10;
  const MAX_PAGE = 10;

  let page = 1;
  let isLoading = false;
  let hasMore = true;

  // ❌ embed dibuang
  const API_BASE =
    'https://lampost.co/wp-json/wp/v2/posts?orderby=date&order=desc';

  const catCache = {};
  const mediaCache = {};
  const editorCache = {};

  let allowedCategoryIds = []; // 🔥 hanya olahraga & hiburan

  function formatTanggal(dateString) {
    const d = new Date(dateString);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }

  // ===============================
  // AMBIL ID KATEGORI (OLAHRAGA & HIBURAN)
  // ===============================
  async function loadAllowedCategories() {
    const slugs = ['olahraga', 'hiburan'];

    const res = await fetch(
      `https://lampost.co/wp-json/wp/v2/categories?slug=${slugs.join(',')}`
    );
    if (!res.ok) return;

    const data = await res.json();
    allowedCategoryIds = data.map(c => c.id);
  }

  // ===============================
  // KATEGORI
  // ===============================
  async function getCategory(catId) {
    if (!catId) return { name: 'Berita', slug: 'berita' };
    if (catCache[catId]) return catCache[catId];

    const res = await fetch(
      `https://lampost.co/wp-json/wp/v2/categories/${catId}`
    );
    const data = await res.json();

    return (catCache[catId] = {
      name: data.name,
      slug: data.slug
    });
  }

  // ===============================
  // GAMBAR
  // ===============================
  async function getMedia(mediaId) {
    if (!mediaId) return 'image/default.jpg';
    if (mediaCache[mediaId]) return mediaCache[mediaId];

    const res = await fetch(
      `https://lampost.co/wp-json/wp/v2/media/${mediaId}`
    );
    const data = await res.json();

    return (mediaCache[mediaId] =
      data.media_details?.sizes?.medium?.source_url ||
      data.source_url ||
      'image/default.jpg'
    );
  }

  // ===============================
  // ✍️ EDITOR (TETAP CARA LAMA)
  // ===============================
  async function getEditor(post) {
    let editor = 'Redaksi';

    const termLink = post._links?.['wp:term']?.[2]?.href;
    if (!termLink) return editor;

    if (editorCache[termLink]) return editorCache[termLink];

    try {
      const res = await fetch(termLink);
      if (res.ok) {
        const data = await res.json();
        editor = data?.[0]?.name || editor;
        editorCache[termLink] = editor;
      }
    } catch (_) {}

    return editor;
  }

  // ===============================
  // SENTINEL
  // ===============================
  const sentinel = document.createElement('div');
  sentinel.style.height = '1px';
  container.appendChild(sentinel);

  // ===============================
  // LOAD POSTS
  // ===============================
  async function loadPosts() {
    if (isLoading || !hasMore || page > MAX_PAGE) return;
    isLoading = true;

    try {
      const res = await fetch(
        `${API_BASE}&categories=${allowedCategoryIds.join(',')}&per_page=${PER_PAGE}&page=${page}`
      );
      if (!res.ok) return;

      let posts = await res.json();
      if (page === 1) posts.shift();
      if (!posts.length) {
        hasMore = false;
        return;
      }

      const htmlArr = [];

      await Promise.all(
        posts.map(async post => {

          const judul = post.title.rendered;
          const tanggal = formatTanggal(post.date);

          const { name: kategori, slug: kategoriSlug } =
            await getCategory(post.categories?.[0]);

          const gambar = await getMedia(post.featured_media);
          const editor = await getEditor(post);

          const link = `halaman.html?${kategoriSlug}/${post.slug}`;

          htmlArr.push(`
            <a href="${link}" class="item-berita">
              <img
                src="${gambar}"
                alt="${judul}"
                loading="lazy"
                decoding="async">

              <div class="info-berita">
                <p class="judul">${judul}</p>
                <p class="kategori">${kategori}</p>
                <div class="detail-info">
                  <p class="editor">By ${editor}</p>
                  <p class="tanggal">${tanggal}</p>
                </div>
              </div>
            </a>
          `);
        })
      );

      sentinel.insertAdjacentHTML('beforebegin', htmlArr.join(''));
      page++;

    } catch (e) {
      console.error(e);
    } finally {
      isLoading = false;
    }
  }

  // ===============================
  // OBSERVER
  // ===============================
  const observer = new IntersectionObserver(
    entries => {
      if (entries[0].isIntersecting) loadPosts();
    },
    { rootMargin: '300px' }
  );

  // ===============================
  // INIT
  // ===============================
  (async () => {
    await loadAllowedCategories();
    observer.observe(sentinel);
    loadPosts();
  })();

});