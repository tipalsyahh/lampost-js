document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.home');
  const loadMoreBtn = document.getElementById('loadMore');

  if (!container || !loadMoreBtn) return;

  // =========================
  // CONFIG
  // =========================
  const API = 'https://lampost.co/wp-json/wp/v2';
  const PER_PAGE = 6;
  const MAX_PAGE = 6;

  let page = 1;
  let isLoading = false;
  let hasMore = true;
  let kategoriId = null;

  // =========================
  // CACHE SUPER CEPAT
  // =========================
  const categoryCache = new Map();
  const mediaCache = new Map();
  const editorCache = new Map();

  // =========================
  // URL PATH
  // =========================
  const path = window.location.pathname
    .split('/')
    .filter(Boolean);

  const parentSlug =
    path.length > 2 ? path[1] : null;

  const currentSlug =
    path.length > 2 ? path[2] : path[1];

  // =========================
  // FORMAT TANGGAL
  // =========================
  const formatTanggal = dateString => {

    const d = new Date(dateString);

    return `${String(d.getDate()).padStart(2, '0')}/` +
           `${String(d.getMonth() + 1).padStart(2, '0')}/` +
           `${d.getFullYear()}`;
  };

  // =========================
  // FETCH CEPAT
  // =========================
  async function fastFetch(url) {

    const res = await fetch(url, {
      cache: 'force-cache',
      keepalive: true,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) throw new Error('Fetch Error');

    return res.json();
  }

  // =========================
  // AMBIL KATEGORI
  // =========================
  async function initKategori() {

    try {

      const data = await fastFetch(
        `${API}/categories?slug=${currentSlug}&per_page=20&_fields=id,name,slug,parent`
      );

      if (!data.length) throw new Error();

      let selectedCategory = null;

      // =========================
      // VALIDASI PARENT TANPA FETCH BERULANG
      // =========================
      if (!parentSlug) {

        selectedCategory = data[0];

      } else {

        const parentIds = [
          ...new Set(
            data
              .map(c => c.parent)
              .filter(Boolean)
          )
        ];

        // fetch semua parent sekaligus
        let parentsMap = {};

        if (parentIds.length) {

          const parents = await fastFetch(
            `${API}/categories?include=${parentIds.join(',')}&per_page=50&_fields=id,slug`
          );

          parents.forEach(p => {
            parentsMap[p.id] = p.slug;
          });
        }

        for (const cat of data) {

          if (
            parentsMap[cat.parent] === parentSlug
          ) {
            selectedCategory = cat;
            break;
          }
        }
      }

      if (!selectedCategory) {
        selectedCategory = data[0];
      }

      kategoriId = selectedCategory.id;

      // =========================
      // PRELOAD DATA AWAL
      // =========================
      loadPosts();

    } catch (err) {

      console.error(err);

      container.innerHTML =
        '<p>Kategori tidak tersedia</p>';

      loadMoreBtn.style.display = 'none';
    }
  }

  // =========================
  // LOAD POSTS SUPER CEPAT
  // =========================
  async function loadPosts() {

    if (
      isLoading ||
      !hasMore ||
      page > MAX_PAGE
    ) {
      loadMoreBtn.style.display = 'none';
      return;
    }

    isLoading = true;

    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Loading...';

    try {

      // =========================
      // SATU FETCH SAJA
      // _embed = category + media + author
      // =========================
      const posts = await fastFetch(
        `${API}/posts` +
        `?categories=${kategoriId}` +
        `&per_page=${PER_PAGE}` +
        `&page=${page}` +
        `&_embed` +
        `&_fields=id,date,slug,title,excerpt,categories,featured_media,_links,_embedded`
      );

      if (!posts.length) {

        hasMore = false;
        loadMoreBtn.style.display = 'none';

        return;
      }

      // =========================
      // AMBIL SEMUA CATEGORY ID
      // =========================
      const allCategoryIds = [
        ...new Set(
          posts.flatMap(post => post.categories || [])
        )
      ];

      // =========================
      // FETCH CATEGORY SEKALI
      // =========================
      const uncachedCategoryIds =
        allCategoryIds.filter(
          id => !categoryCache.has(id)
        );

      if (uncachedCategoryIds.length) {

        const categories = await fastFetch(
          `${API}/categories` +
          `?include=${uncachedCategoryIds.join(',')}` +
          `&per_page=100` +
          `&_fields=id,name,slug,parent`
        );

        categories.forEach(cat => {
          categoryCache.set(cat.id, cat);
        });
      }

      // =========================
      // PRELOAD PARENT CATEGORY
      // =========================
      const parentIds = [
        ...new Set(
          [...categoryCache.values()]
            .map(c => c.parent)
            .filter(Boolean)
        )
      ];

      const uncachedParents =
        parentIds.filter(
          id => !categoryCache.has(id)
        );

      if (uncachedParents.length) {

        const parents = await fastFetch(
          `${API}/categories` +
          `?include=${uncachedParents.join(',')}` +
          `&per_page=100` +
          `&_fields=id,name,slug,parent`
        );

        parents.forEach(cat => {
          categoryCache.set(cat.id, cat);
        });
      }

      // =========================
      // BUILD HTML SUPER CEPAT
      // =========================
      let html = '';

      for (const post of posts) {

        const judul =
          post.title?.rendered || '';

        const slug =
          post.slug || '';

        const tanggal =
          formatTanggal(post.date);

        // =========================
        // CATEGORY
        // =========================
        const catId =
          post.categories?.slice(-1)[0];

        const cat =
          categoryCache.get(catId) || {
            name: 'Opini',
            slug: 'opini',
            parent: 0
          };

        const parent =
          categoryCache.get(cat.parent);

        // =========================
        // GAMBAR DARI _EMBED
        // TANPA FETCH MEDIA LAGI
        // =========================
        let gambar =
          'https://lampost.co/image/ai.jpeg';

        const media =
          post._embedded?.['wp:featuredmedia']?.[0];

        if (media) {

          gambar =
            media?.media_details?.sizes?.medium?.source_url ||
            media?.media_details?.sizes?.full?.source_url ||
            media?.source_url ||
            gambar;
        }

        // =========================
        // EDITOR
        // =========================
        let editor = 'Redaksi';

        const editorData =
          post._embedded?.author?.[0];

        if (editorData?.name) {
          editor = editorData.name;
        }

        // =========================
        // DESKRIPSI
        // =========================
        let deskripsi =
          post.excerpt?.rendered
            ?.replace(/<[^>]+>/g, '')
            ?.trim() || '';

        if (deskripsi.length > 150) {
          deskripsi =
            deskripsi.slice(0, 150) + '...';
        }

        // =========================
        // LINK
        // =========================
        let link =
          `/${cat.slug}/${slug}`;

        if (parent?.slug) {

          link =
            `/${parent.slug}/${cat.slug}/${slug}`;
        }

        // =========================
        // HTML
        // =========================
        html += `
          <a href="${link}" class="item-info">

            <img
              src="${gambar}"
              alt="${judul}"
              class="img-microweb"
              loading="lazy"
              decoding="async"
              fetchpriority="low"
              onerror="this.onerror=null;this.src='https://lampost.co/image/ai.jpeg';"
            >

            <div class="berita-microweb">

              <p class="judul">
                ${judul}
              </p>

              <p class="kategori">
                ${cat.name}
              </p>

              <div class="info-microweb">

                <p class="editor">
                  By ${editor}
                </p>

                <p class="tanggal">
                  ${tanggal}
                </p>

              </div>

              <p class="deskripsi">
                ${deskripsi}
              </p>

            </div>

          </a>
        `;
      }

      // =========================
      // INSERT SEKALI
      // =========================
      container.insertAdjacentHTML(
        'beforeend',
        html
      );

      page++;

      // =========================
      // PRELOAD PAGE BERIKUTNYA
      // =========================
      if (page <= MAX_PAGE) {

        fetch(
          `${API}/posts` +
          `?categories=${kategoriId}` +
          `&per_page=${PER_PAGE}` +
          `&page=${page}` +
          `&_embed`,
          {
            cache: 'force-cache'
          }
        ).catch(() => {});
      }

    } catch (err) {

      console.error(err);

    } finally {

      isLoading = false;

      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = 'Load More';
    }
  }

  // =========================
  // BUTTON LOAD MORE
  // =========================
  loadMoreBtn.addEventListener(
    'click',
    loadPosts
  );

  // =========================
  // START
  // =========================
  initKategori();

});