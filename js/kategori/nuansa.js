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

  const mediaCache = {};
  const editorCache = {};

  const formatTanggal = dateString => {
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2, '0')}/` +
           `${String(d.getMonth() + 1).padStart(2, '0')}/` +
           `${d.getFullYear()}`;
  };

  // =====================
  // GET KATEGORI NUANSA SEKALI
  // =====================
  (async () => {
    try {
      const res = await fetch(
        'https://lampost.co/wp-json/wp/v2/categories?slug=nuansa'
      );
      const data = await res.json();
      kategoriId = data?.[0]?.id;
      loadPosts();
    } catch {
      container.innerHTML = '<p>Kategori tidak tersedia</p>';
    }
  })();

  // =====================
  // GAMBAR FULL HD
  // =====================
  async function getMedia(mediaId) {
    if (!mediaId) return 'image/ai.jpg';
    if (mediaCache[mediaId]) return mediaCache[mediaId];

    try {
      const res = await fetch(
        `https://lampost.co/wp-json/wp/v2/media/${mediaId}`
      );
      const data = await res.json();

      return (mediaCache[mediaId] =
        data.media_details?.sizes?.full?.source_url ||
        data.media_details?.sizes?.large?.source_url ||
        data.source_url ||
        'image/ai.jpg'
      );
    } catch {
      return 'image/ai.jpg';
    }
  }

  // =====================
  // EDITOR (ASLI)
  // =====================
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

  // =====================
  // LOAD POSTS
  // =====================
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

      posts.forEach(post => {

        const id = `post-${post.id}`;
        const judul = post.title.rendered;
        const slug = post.slug;
        const tanggal = formatTanggal(post.date);

        let deskripsi =
          post.excerpt?.rendered?.replace(/<[^>]+>/g, '').trim() || '';

        if (deskripsi.length > 150) {
          deskripsi = deskripsi.slice(0, 150) + '...';
        }

        htmlArr.push(`
          <a href="../halaman.html?nuansa/${slug}" class="item-info" id="${id}">
            <img src="image/ai.jpg" class="img-microweb" loading="lazy">
            <div class="berita-microweb">
              <p class="judul">${judul}</p>
              <p class="kategori">Nuansa</p>
              <div class="info-microweb">
                <p class="editor">By ...</p>
                <p class="tanggal">${tanggal}</p>
              </div>
              <p class="deskripsi">${deskripsi}</p>
            </div>
          </a>
        `);

        // ASYNC GAMBAR + EDITOR
        (async () => {
          const img = await getMedia(post.featured_media);
          const editor = await getEditor(post);

          const el = document.getElementById(id);
          if (!el) return;

          el.querySelector('img').src = img;
          el.querySelector('.editor').textContent = `By ${editor}`;
        })();

      });

      container.insertAdjacentHTML('beforeend', htmlArr.join(''));
      page++;

    } catch (e) {
      console.error(e);
    } finally {
      isLoading = false;
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = 'Load More';
    }
  }

  loadMoreBtn.addEventListener('click', loadPosts);

});