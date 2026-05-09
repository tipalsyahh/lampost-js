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
  let totalPages = MAX_PAGE;

  // =========================
  // CACHE
  // =========================
  const categoryCache = new Map();
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
  // FETCH SUPER CEPAT
  // =========================
  async function fastFetch(url) {

    const res = await fetch(url, {
      cache: 'force-cache',
      keepalive: true,
      priority: 'high',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error('Fetch Error');
    }

    return {
      data: await res.json(),
      headers: res.headers
    };
  }

  // =========================
  // HIDE BUTTON
  // =========================
  function hideLoadMore() {

    hasMore = false;

    loadMoreBtn.style.display = 'none';
  }

  // =========================
  // INIT CATEGORY
  // =========================
  async function initKategori() {

    try {

      const result = await fastFetch(
        `${API}/categories` +
        `?slug=${currentSlug}` +
        `&_fields=id,name,slug,parent`
      );

      const data = result.data;

      if (!data.length) {
        throw new Error();
      }

      let selectedCategory = null;

      // =========================
      // TANPA PARENT
      // =========================
      if (!parentSlug) {

        selectedCategory = data[0];

      } else {

        const parentIds = [
          ...new Set(
            data
              .map(cat => cat.parent)
              .filter(Boolean)
          )
        ];

        let parentMap = {};

        if (parentIds.length) {

          const parentResult =
            await fastFetch(
              `${API}/categories` +
              `?include=${parentIds.join(',')}` +
              `&_fields=id,slug`
            );

          parentResult.data.forEach(parent => {

            parentMap[parent.id] =
              parent.slug;
          });
        }

        for (const cat of data) {

          if (
            parentMap[cat.parent] ===
            parentSlug
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
      // LOAD POSTS
      // =========================
      loadPosts();

    } catch (err) {

      console.error(err);

      container.innerHTML =
        '<p>Kategori tidak tersedia</p>';

      hideLoadMore();
    }
  }

  // =========================
  // LOAD POSTS
  // =========================
  async function loadPosts() {

    if (
      isLoading ||
      !hasMore
    ) return;

    // =========================
    // STOP JIKA PAGE HABIS
    // =========================
    if (page > totalPages) {

      hideLoadMore();
      return;
    }

    isLoading = true;

    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Loading...';

    try {

      // =========================
      // FETCH POSTS
      // =========================
      const result = await fastFetch(

        `${API}/posts` +
        `?categories=${kategoriId}` +
        `&per_page=${PER_PAGE}` +
        `&page=${page}` +
        `&_embed` +
        `&_fields=id,date,slug,title,excerpt,categories,_links,_embedded`
      );

      const posts = result.data;

      // =========================
      // TOTAL PAGE
      // =========================
      totalPages = parseInt(
        result.headers.get('X-WP-TotalPages')
      ) || MAX_PAGE;

      // =========================
      // JIKA TIDAK ADA POST
      // =========================
      if (!posts.length) {

        hideLoadMore();
        return;
      }

      // =========================
      // FETCH CATEGORY SEKALI
      // =========================
      const categoryIds = [
        ...new Set(
          posts.flatMap(
            post => post.categories || []
          )
        )
      ];

      const uncachedCategoryIds =
        categoryIds.filter(
          id => !categoryCache.has(id)
        );

      // =========================
      // CATEGORY PARALLEL
      // =========================
      if (uncachedCategoryIds.length) {

        const categoryResult =
          await fastFetch(

            `${API}/categories` +
            `?include=${uncachedCategoryIds.join(',')}` +
            `&_fields=id,name,slug,parent`
          );

        categoryResult.data.forEach(cat => {

          categoryCache.set(
            cat.id,
            cat
          );
        });
      }

      // =========================
      // PARENT CATEGORY
      // =========================
      const parentIds = [
        ...new Set(
          [...categoryCache.values()]
            .map(cat => cat.parent)
            .filter(Boolean)
        )
      ];

      const uncachedParents =
        parentIds.filter(
          id => !categoryCache.has(id)
        );

      if (uncachedParents.length) {

        const parentResult =
          await fastFetch(

            `${API}/categories` +
            `?include=${uncachedParents.join(',')}` +
            `&_fields=id,name,slug,parent`
          );

        parentResult.data.forEach(parent => {

          categoryCache.set(
            parent.id,
            parent
          );
        });
      }

      // =========================
      // PRELOAD EDITOR
      // =========================
      const editorLinks = [
        ...new Set(
          posts
            .map(
              post =>
                post._links?.['wp:term']?.[2]?.href
            )
            .filter(Boolean)
        )
      ];

      // =========================
      // FETCH EDITOR PARALEL
      // =========================
      await Promise.all(

        editorLinks.map(async link => {

          if (editorCache.has(link)) return;

          try {

            const result =
              await fastFetch(link);

            editorCache.set(
              link,
              result.data?.[0]?.name ||
              'Redaksi'
            );

          } catch {

            editorCache.set(
              link,
              'Redaksi'
            );
          }
        })
      );

      // =========================
      // BUILD HTML SEKALI
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
        // GAMBAR
        // =========================
        let gambar =
          'https://lampost.co/image/ai.jpeg';

        const media =
          post._embedded?.['wp:featuredmedia']?.[0];

        if (media) {

          gambar =
            media?.media_details?.sizes?.medium?.source_url ||
            media?.media_details?.sizes?.medium_large?.source_url ||
            media?.source_url ||
            gambar;
        }

        // =========================
        // EDITOR
        // =========================
        const termLink =
          post._links?.['wp:term']?.[2]?.href;

        const editor =
          editorCache.get(termLink) ||
          'Redaksi';

        // =========================
        // DESKRIPSI
        // =========================
        let deskripsi =
          post.excerpt?.rendered
            ?.replace(/<[^>]+>/g, '')
            ?.trim() || '';

        if (deskripsi.length > 140) {

          deskripsi =
            deskripsi.slice(0, 140) + '...';
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
      // INSERT HTML SEKALI
      // =========================
      container.insertAdjacentHTML(
        'beforeend',
        html
      );

      page++;

      // =========================
      // HIDE BUTTON JIKA HABIS
      // =========================
      if (
        page > totalPages ||
        posts.length < PER_PAGE
      ) {

        hideLoadMore();

      } else {

        loadMoreBtn.style.display = 'flex';
      }

      // =========================
      // PRELOAD NEXT PAGE
      // =========================
      if (page <= totalPages) {

        requestIdleCallback(() => {

          fetch(
            `${API}/posts` +
            `?categories=${kategoriId}` +
            `&per_page=${PER_PAGE}` +
            `&page=${page}` +
            `&_embed` +
            `&_fields=id,date,slug,title,excerpt,categories,_links,_embedded`,
            {
              cache: 'force-cache'
            }
          ).catch(() => {});

        });
      }

    } catch (err) {

      console.error(err);

      hideLoadMore();

    } finally {

      isLoading = false;

      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = 'Load More';
    }
  }

  // =========================
  // BUTTON
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