// ======================================
// 🔥 FORCE SEO TAG URL
// ======================================
(function () {

  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');

  if (q) {
    const slug = decodeURIComponent(q)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    const newUrl = `/tag/${slug}/`;

    if (window.location.pathname !== newUrl) {
      window.location.replace(newUrl);
    }
  }

})();

document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.home');
  const loadMoreBtn = document.getElementById('loadMore');
  const judulTag = document.getElementById('judulTag');

  if (!container || !loadMoreBtn) return;

  console.log('===== DEBUG TAG SYSTEM =====');

  const PER_PAGE = 6;

  let page = 1;
  let isLoading = false;
  let hasMore = true;
  let tagId = null;
  let tagName = '';

  const catCache = {};
  const mediaCache = {};
  const editorCache = {};

  // ===============================
  // FORMAT TANGGAL
  // ===============================
  const formatTanggal = dateString => {
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2, '0')}/` +
           `${String(d.getMonth() + 1).padStart(2, '0')}/` +
           `${d.getFullYear()}`;
  };

  // ===============================
  // 🔥 PARSING URL TAG
  // ===============================
  const fullUrl = window.location.href;
  const pathname = window.location.pathname;

  console.log('URL:', fullUrl);

  const path = pathname.split('/').filter(Boolean);
  console.log('PATH:', path);

  if (path[0] === 'tag' && path[1]) {

    let rawTag = path[1];

    console.log('RAW TAG:', rawTag);

    tagName = decodeURIComponent(rawTag)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    console.log('FINAL SLUG:', tagName);

    const cleanUrl = `/tag/${tagName}/`;
    if (window.location.pathname !== cleanUrl) {
      history.replaceState(null, '', cleanUrl);
    }
  }

  if (!tagName) {
    console.error('❌ TAG KOSONG');
    container.innerHTML = '<p>Tag tidak ditemukan (slug kosong)</p>';
    loadMoreBtn.style.display = 'none';
    return;
  }

  const displayName = tagName.replace(/-/g, ' ');
  document.title = `${displayName} - Lampost`;

  if (judulTag) {
    judulTag.innerText = displayName;
  }

  // ===============================
  // 🔥 AMBIL TAG ID (DEBUG MODE)
  // ===============================
  (async () => {
    try {

      let data = [];

      console.log('--- FETCH SLUG ---');

      let res = await fetch(
        `https://lampost.co/wp-json/wp/v2/tags?slug=${tagName}`
      );

      console.log('STATUS SLUG:', res.status);

      if (res.ok) {
        data = await res.json();
      }

      console.log('RESULT SLUG:', data);

      // ===============================
      // FALLBACK SEARCH
      // ===============================
      if (!data.length) {

        console.warn('⚠️ SLUG TIDAK KETEMU → SEARCH');

        const name = tagName.replace(/-/g, ' ');

        res = await fetch(
          `https://lampost.co/wp-json/wp/v2/tags?search=${encodeURIComponent(name)}`
        );

        console.log('STATUS SEARCH:', res.status);

        if (res.ok) {
          const result = await res.json();

          console.log('RESULT SEARCH:', result);

          // filter paling mendekati
          data = result.filter(tag =>
            tag.slug === tagName ||
            tag.slug.replace(/-/g, '') === tagName.replace(/-/g, '')
          );

          if (!data.length) data = result;
        }
      }

      // ===============================
      // FINAL VALIDASI
      // ===============================
      if (!data.length) {

        console.error('❌ TAG TIDAK DITEMUKAN');

        container.innerHTML = `
          <div style="color:red">
            <h3>DEBUG ERROR</h3>
            <p>Tag tidak ditemukan</p>
            <p>Slug: ${tagName}</p>
          </div>
        `;

        loadMoreBtn.style.display = 'none';
        return;
      }

      tagId = data[0].id;

      console.log('✅ TAG FOUND:', data[0]);

      loadPosts();

    } catch (err) {
      console.error('❌ FETCH ERROR:', err);

      container.innerHTML = '<p>Error ambil tag</p>';
      loadMoreBtn.style.display = 'none';
    }
  })();

  // ===============================
  // CATEGORY
  // ===============================
  async function getCategory(catId) {
    if (!catId) return { name: 'Berita', slug: 'berita', parent: 0 };
    if (catCache[catId]) return catCache[catId];

    const res = await fetch(
      `https://lampost.co/wp-json/wp/v2/categories/${catId}`
    );
    const data = await res.json();

    return (catCache[catId] = {
      name: data.name,
      slug: data.slug,
      parent: data.parent
    });
  }

  async function getParentCategory(parentId) {
    if (!parentId) return null;
    if (catCache[parentId]) return catCache[parentId];

    try {
      const res = await fetch(
        `https://lampost.co/wp-json/wp/v2/categories/${parentId}`
      );
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

  // ===============================
  // MEDIA
  // ===============================
  async function getMedia(mediaId) {
    if (!mediaId) return 'image/ai.jpg';
    if (mediaCache[mediaId]) return mediaCache[mediaId];

    const res = await fetch(
      `https://lampost.co/wp-json/wp/v2/media/${mediaId}`
    );
    const data = await res.json();

    return (mediaCache[mediaId] =
      data.media_details?.sizes?.medium?.source_url ||
      data.source_url ||
      'image/ai.jpg'
    );
  }

  // ===============================
  // EDITOR
  // ===============================
  async function getEditor(post) {
    let editor = 'Redaksi';

    const termLink = post._links?.['wp:term']?.find(t =>
      !['category', 'post_tag'].includes(t.taxonomy)
    )?.href;

    if (!termLink) return editor;
    if (editorCache[termLink]) return editorCache[termLink];

    try {
      const res = await fetch(termLink);
      if (res.ok) {
        const data = await res.json();
        editor = data?.[0]?.name || editor;
        editorCache[termLink] = editor;
      }
    } catch {}

    return editor;
  }

  // ===============================
  // LOAD POSTS
  // ===============================
  async function loadPosts() {
    if (isLoading || !hasMore) {
      loadMoreBtn.style.display = 'none';
      return;
    }

    isLoading = true;
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Loading...';

    try {
      const res = await fetch(
        `https://lampost.co/wp-json/wp/v2/posts` +
        `?tags=${tagId}&per_page=${PER_PAGE}&page=${page}` +
        `&orderby=date&order=desc`
      );

      console.log('FETCH POSTS STATUS:', res.status);

      if (!res.ok) {
        hasMore = false;
        loadMoreBtn.style.display = 'none';
        return;
      }

      const posts = await res.json();

      console.log('POST COUNT:', posts.length);

      if (posts.length < PER_PAGE) {
        hasMore = false;
        loadMoreBtn.style.display = 'none';
      }

      const htmlArr = [];

      await Promise.all(
        posts.map(async post => {

          const judul = post.title.rendered;
          const slug = post.slug;
          const tanggal = formatTanggal(post.date);

          const cat = await getCategory(post.categories?.[0]);
          const parent = await getParentCategory(cat.parent);

          let link = `/${cat.slug}/${slug}/`;

          if (parent && parent.slug) {
            link = `/${parent.slug}/${cat.slug}/${slug}/`;
          }

          const gambar = await getMedia(post.featured_media);
          const editor = await getEditor(post);

          let deskripsi =
            post.excerpt?.rendered
              ?.replace(/<[^>]+>/g, '')
              ?.trim() || '';

          if (deskripsi.length > 150) {
            deskripsi = deskripsi.slice(0, 150) + '...';
          }

          htmlArr.push(`
            <a href="${link}" class="item-info">
              <img src="${gambar}" alt="${judul}" class="img-microweb">
              <div class="berita-microweb">
                <p class="judul">${judul}</p>
                <p class="kategori">${cat.name}</p>
                <div class="info-microweb">
                  <p class="editor">Oleh ${editor}</p>
                  <p class="tanggal">${tanggal}</p>
                </div>
                <p class="deskripsi">${deskripsi}</p>
              </div>
            </a>
          `);

        })
      );

      container.insertAdjacentHTML('beforeend', htmlArr.join(''));
      page++;

    } catch (err) {
      console.error(err);
      hasMore = false;
      loadMoreBtn.style.display = 'none';
    } finally {
      isLoading = false;
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = 'Load More';
    }
  }

  loadMoreBtn.addEventListener('click', loadPosts);

});