document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.home');
  const loadMoreBtn = document.getElementById('loadMore');
  if (!container || !loadMoreBtn) return;

  const PER_PAGE = 6;
  const MAX_PAGE = 6;

  let page = 1;
  let isLoading = false;
  let hasMore = true;
  let kategoriId = null;

  const catCache = {};
  const mediaCache = {};
  const editorCache = {};

  // 🔥 ambil path URL
  const path = window.location.pathname.split('/').filter(Boolean);

  // contoh:
  // /kategori/olahraga/bola
  const parentSlug = path.length > 2 ? path[1] : null; // olahraga
  const currentSlug = path.length > 2 ? path[2] : path[1]; // bola atau olahraga

  const formatTanggal = dateString => {
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2, '0')}/` +
           `${String(d.getMonth() + 1).padStart(2, '0')}/` +
           `${d.getFullYear()}`;
  };

  // 🔥 ambil kategori + validasi parent
  (async () => {
    try {

      const res = await fetch(
        `https://lampost.co/wp-json/wp/v2/categories?slug=${currentSlug}`
      );

      if (!res.ok) throw new Error();

      const data = await res.json();
      if (!data.length) throw new Error();

      let selectedCategory = null;

      for (const cat of data) {

        // jika tidak ada parent (kategori utama)
        if (!parentSlug) {
          selectedCategory = cat;
          break;
        }

        // cek parent
        if (cat.parent) {

          const parentRes = await fetch(
            `https://lampost.co/wp-json/wp/v2/categories/${cat.parent}`
          );

          const parentData = await parentRes.json();

          if (parentData.slug === parentSlug) {
            selectedCategory = cat;
            break;
          }
        }
      }

      // fallback jika tidak ketemu
      if (!selectedCategory) {
        selectedCategory = data[0];
      }

      kategoriId = selectedCategory.id;
      loadPosts();

    } catch {
      container.innerHTML = '<p>Kategori tidak tersedia</p>';
      loadMoreBtn.style.display = 'none';
    }
  })();

  async function getCategory(catId) {
    if (!catId) return { name: 'Opini', slug: 'opini', parent: 0 };
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

  async function getMedia(mediaId) {
    const fallback = 'https://lampost.co/image/ai.jpeg';

    if (!mediaId) return fallback;
    if (mediaCache[mediaId]) return mediaCache[mediaId];

    try {
      const res = await fetch(
        `https://lampost.co/wp-json/wp/v2/media/${mediaId}`
      );

      if (!res.ok) return fallback;

      const data = await res.json();

      const img =
        data?.media_details?.sizes?.medium?.source_url ||
        data?.media_details?.sizes?.full?.source_url ||
        data?.source_url ||
        fallback;

      return (mediaCache[mediaId] = img);

    } catch {
      return fallback;
    }
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
    } catch {}

    return editor;
  }

  async function loadPosts() {
    if (isLoading || !hasMore || page > MAX_PAGE) {
      loadMoreBtn.style.display = 'none';
      return;
    }

    isLoading = true;
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Loading...';

    try {
      const res = await fetch(
        `https://lampost.co/wp-json/wp/v2/posts` +
        `?categories=${kategoriId}&per_page=${PER_PAGE}&page=${page}` +
        `&orderby=date&order=desc`
      );

      if (!res.ok) {
        hasMore = false;
        loadMoreBtn.style.display = 'none';
        return;
      }

      const posts = await res.json();
      if (!posts.length) {
        hasMore = false;
        loadMoreBtn.style.display = 'none';
        return;
      }

      const htmlArr = [];

      await Promise.all(
        posts.map(async post => {

          const judul = post.title.rendered;
          const slug = post.slug;
          const tanggal = formatTanggal(post.date);

          const catId = post.categories?.slice(-1)[0];
          const cat = await getCategory(catId);
          const parent = await getParentCategory(cat.parent);

          const gambar = await getMedia(post.featured_media);
          const editor = await getEditor(post);

          let deskripsi =
            post.excerpt?.rendered
              ?.replace(/<[^>]+>/g, '')
              ?.trim() || '';

          if (deskripsi.length > 150) {
            deskripsi = deskripsi.slice(0, 150) + '...';
          }

          // 🔥 build URL post
          let link = `/${cat.slug}/${slug}`;
          if (parent && parent.slug) {
            link = `/${parent.slug}/${cat.slug}/${slug}`;
          }

          htmlArr.push(`
            <a href="${link}" class="item-info">
              <img 
                src="${gambar}" 
                alt="${judul}" 
                class="img-microweb" 
                loading="lazy"
                onerror="this.onerror=null;this.src='https://lampost.co/image/ai.jpeg';"
              >
              <div class="berita-microweb">
                <p class="judul">${judul}</p>
                <p class="kategori">${cat.name}</p>
                <div class="info-microweb">
                  <p class="editor">By ${editor}</p>
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
    } finally {
      isLoading = false;
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = 'Load More';
    }
  }

  loadMoreBtn.addEventListener('click', loadPosts);

});