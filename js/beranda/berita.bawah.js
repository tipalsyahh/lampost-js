document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.populer-mobile');
  if (!container) return;

  const PER_PAGE = 10;
  const MAX_PAGE = 10;

  let page = 1;
  let isLoading = false;
  let hasMore = true;

  const API_BASE =
    'https://lampost.co/wp-json/wp/v2/posts?orderby=date&order=desc';

  const catCache = {};
  const mediaCache = {};
  const editorCache = {};

  let allowedCategoryIds = [];

  function formatTanggal(dateString) {
    const d = new Date(dateString);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  }

  async function loadAllowedCategories() {
    const slugs = ['olahraga', 'hiburan'];

    const res = await fetch(
      `https://lampost.co/wp-json/wp/v2/categories?slug=${slugs.join(',')}`
    );
    if (!res.ok) return;

    const data = await res.json();
    allowedCategoryIds = data.map(c => c.id);
  }

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

  async function getMedia(mediaId) {
    if (!mediaId) return 'https://lampost.co/image/ai.jpeg';
    if (mediaCache[mediaId]) return mediaCache[mediaId];

    const res = await fetch(
      `https://lampost.co/wp-json/wp/v2/media/${mediaId}`
    );
    const data = await res.json();

    return (mediaCache[mediaId] =
      data.media_details?.sizes?.medium?.source_url ||
      data.source_url ||
      'https://lampost.co/image/ai.jpeg'
    );
  }

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
        loadMoreBtn.style.display = 'none';
        return;
      }

      const htmlArr = [];

      await Promise.all(
        posts.map(async post => {

          const judul = post.title.rendered;
          const tanggal = formatTanggal(post.date);

          const [kategoriData, gambar, editor] = await Promise.all([
            getCategory(post.categories?.[0]),
            getMedia(post.featured_media),
            getEditor(post)
          ]);

          const link = `/${kategoriData.slug}/${post.slug}`;

          htmlArr.push(`
            <a href="${link}" class="item-berita">
              <img src="${gambar}" alt="${judul}" decoding="async">
              <div class="info-berita">
                <p class="judul">${judul}</p>
                <p class="kategori">${kategoriData.name}</p>
                <div class="detail-info">
                  <p class="editor">By ${editor}</p>
                  <p class="tanggal">${tanggal}</p>
                </div>
              </div>
            </a>
          `);
        })
      );

      container.insertAdjacentHTML('beforeend', htmlArr.join(''));
      page++;

      container.appendChild(center);

    } catch (e) {
      console.error(e);
    } finally {
      isLoading = false;
    }
  }

  const center = document.createElement('center');

  const loadMoreBtn = document.createElement('button');
  loadMoreBtn.className = 'load-more';
  loadMoreBtn.textContent = 'Load More';

  loadMoreBtn.addEventListener('click', loadPosts);

  center.appendChild(loadMoreBtn);
  container.appendChild(center);

  (async () => {
    await loadAllowedCategories();
    loadPosts();
  })();

});