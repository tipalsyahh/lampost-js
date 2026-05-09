document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.home');
  const loadMoreBtn = document.getElementById('loadMore');

  if (!container || !loadMoreBtn) return;

  const API = 'https://lampost.co/wp-json/wp/v2';
  const PER_PAGE = 10;
  const MAX_PAGE = 6;
  const FALLBACK_IMAGE = 'https://lampost.co/image/ai.jpeg';

  let page = 1;
  let totalPages = MAX_PAGE;
  let kategoriId = null;
  let isLoading = false;
  let hasMore = true;

  const categoryCache = new Map();
  const editorCache = new Map();
  const fetchCache = new Map();

  const path = location.pathname.split('/').filter(Boolean);

  const parentSlug = path.length > 2
    ? path[1]
    : null;

  const currentSlug = path.length > 2
    ? path[2]
    : path[1];

  const formatTanggal = date => {

    const d = new Date(date);

    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  async function fastFetch(url) {

    if (fetchCache.has(url)) {
      return fetchCache.get(url);
    }

    const promise = fetch(url, {
      cache: 'force-cache',
      keepalive: true,
      headers: {
        Accept: 'application/json'
      }
    })
    .then(async res => {

      if (!res.ok) {
        throw new Error('Fetch Error');
      }

      return {
        data: await res.json(),
        headers: res.headers
      };
    });

    fetchCache.set(url, promise);

    return promise;
  }

  function hideLoadMore() {

    hasMore = false;
    loadMoreBtn.style.display = 'none';
  }

  async function initKategori() {

    try {

      const result = await fastFetch(
        `${API}/categories?slug=${currentSlug}&_fields=id,slug,parent,name`
      );

      const data = result.data;

      if (!data.length) {
        throw new Error();
      }

      let selectedCategory = data[0];

      if (parentSlug) {

        const parentIds = [
          ...new Set(
            data.map(v => v.parent).filter(Boolean)
          )
        ];

        if (parentIds.length) {

          const parentResult = await fastFetch(
            `${API}/categories?include=${parentIds.join(',')}&_fields=id,slug`
          );

          const parentMap = {};

          parentResult.data.forEach(v => {
            parentMap[v.id] = v.slug;
          });

          const matched = data.find(v =>
            parentMap[v.parent] === parentSlug
          );

          if (matched) {
            selectedCategory = matched;
          }
        }
      }

      kategoriId = selectedCategory.id;

      loadPosts();

    } catch {

      container.innerHTML = '<p>Kategori tidak tersedia</p>';

      hideLoadMore();
    }
  }

  async function preloadCategories(posts) {

    const ids = [
      ...new Set(
        posts.flatMap(v => v.categories || [])
      )
    ];

    const uncached = ids.filter(id =>
      !categoryCache.has(id)
    );

    if (!uncached.length) return;

    const result = await fastFetch(
      `${API}/categories?include=${uncached.join(',')}&_fields=id,name,slug,parent`
    );

    result.data.forEach(cat => {
      categoryCache.set(cat.id, cat);
    });

    const parentIds = [
      ...new Set(
        result.data
          .map(v => v.parent)
          .filter(Boolean)
      )
    ];

    const uncachedParents = parentIds.filter(id =>
      !categoryCache.has(id)
    );

    if (!uncachedParents.length) return;

    const parentResult = await fastFetch(
      `${API}/categories?include=${uncachedParents.join(',')}&_fields=id,name,slug,parent`
    );

    parentResult.data.forEach(parent => {
      categoryCache.set(parent.id, parent);
    });
  }

  async function preloadEditors(posts) {

    const links = [
      ...new Set(
        posts
          .map(v => v._links?.['wp:term']?.[2]?.href)
          .filter(Boolean)
      )
    ];

    await Promise.all(

      links.map(async link => {

        if (editorCache.has(link)) return;

        try {

          const result = await fastFetch(link);

          editorCache.set(
            link,
            result.data?.[0]?.name || 'Redaksi'
          );

        } catch {

          editorCache.set(link, 'Redaksi');
        }
      })
    );
  }

  function buildPost(post) {

    const judul = post.title?.rendered || '';
    const slug = post.slug || '';
    const tanggal = formatTanggal(post.date);

    const catId = post.categories?.slice(-1)[0];

    const cat = categoryCache.get(catId) || {
      name: 'Opini',
      slug: 'opini',
      parent: 0
    };

    const parent = categoryCache.get(cat.parent);

    const media = post._embedded?.['wp:featuredmedia']?.[0];

    const gambar =
      media?.media_details?.sizes?.medium?.source_url ||
      media?.media_details?.sizes?.medium_large?.source_url ||
      media?.source_url ||
      FALLBACK_IMAGE;

    const termLink =
      post._links?.['wp:term']?.[2]?.href;

    const editor =
      editorCache.get(termLink) || 'Redaksi';

    let deskripsi =
      post.excerpt?.rendered
        ?.replace(/<[^>]+>/g, '')
        ?.trim() || '';

    if (deskripsi.length > 140) {
      deskripsi =
        deskripsi.slice(0, 140) + '...';
    }

    let link = `/${cat.slug}/${slug}`;

    if (parent?.slug) {
      link = `/${parent.slug}/${cat.slug}/${slug}`;
    }

    return `
      <a href="${link}" class="item-info">

        <img
          src="${gambar}"
          alt="${judul}"
          class="img-microweb"
          loading="lazy"
          decoding="async"
          fetchpriority="low"
          width="400"
          height="225"
          onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';"
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

  async function loadPosts() {

    if (isLoading || !hasMore) return;

    if (page > totalPages) {
      hideLoadMore();
      return;
    }

    isLoading = true;

    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Loading...';

    try {

      const result = await fastFetch(
        `${API}/posts?categories=${kategoriId}&per_page=${PER_PAGE}&page=${page}&_embed&_fields=id,date,slug,title,excerpt,categories,_links,_embedded`
      );

      const posts = result.data;

      totalPages =
        parseInt(
          result.headers.get('X-WP-TotalPages')
        ) || MAX_PAGE;

      if (!posts.length) {
        hideLoadMore();
        return;
      }

      await Promise.all([
        preloadCategories(posts),
        preloadEditors(posts)
      ]);

      const html = posts.map(buildPost).join('');

      container.insertAdjacentHTML(
        'beforeend',
        html
      );

      page++;

      if (
        page > totalPages ||
        posts.length < PER_PAGE
      ) {

        hideLoadMore();

      } else {

        loadMoreBtn.style.display = 'flex';
      }

      if (
        'requestIdleCallback' in window &&
        page <= totalPages
      ) {

        requestIdleCallback(() => {

          fetch(
            `${API}/posts?categories=${kategoriId}&per_page=${PER_PAGE}&page=${page}&_embed&_fields=id,date,slug,title,excerpt,categories,_links,_embedded`,
            {
              cache: 'force-cache'
            }
          ).catch(() => {});
        });
      }

    } catch {

      hideLoadMore();

    } finally {

      isLoading = false;

      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = 'Load More';
    }
  }

  loadMoreBtn.addEventListener(
    'click',
    loadPosts,
    {
      passive: true
    }
  );

  initKategori();

});