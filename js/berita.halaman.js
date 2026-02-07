document.addEventListener('DOMContentLoaded', async () => {

  const container = document.querySelector('.home');
  if (!container) return;

  const headerWrap = document.createElement('div');
  headerWrap.innerHTML = `
    <h2 class="judul-lainnya">BERITA LAINNYA</h2>
    <div class="line-accent"></div>
  `;
  container.before(headerWrap);

  const loadMoreBtn = document.createElement('button');
  loadMoreBtn.id = 'loadMore';
  loadMoreBtn.className = 'load-more';
  loadMoreBtn.textContent = 'Load More';
  loadMoreBtn.style.display = 'none';
  loadMoreBtn.style.margin = '20px auto';
  loadMoreBtn.style.display = 'block';

  container.after(loadMoreBtn);

  const titleEl = document.querySelector('.judul-lainnya');
  const lineAccent = document.querySelector('.line-accent');

  titleEl.style.display = 'none';
  lineAccent.style.display = 'none';
  loadMoreBtn.style.display = 'none';

  const PER_PAGE = 10;
  let page = 1;
  let isLoading = false;
  let hasMore = true;

  const mediaCache = {};
  const editorCache = {};

  const query = decodeURIComponent(
    window.location.search.replace('?', '')
  );
  const [kategoriSlug, currentSlug] = query.split('/');
  if (!kategoriSlug) return;

  let kategoriId = null;
  let kategoriNama = kategoriSlug;

  try {
    const catRes = await fetch(
      `https://lampost.co/wp-json/wp/v2/categories?slug=${kategoriSlug}`
    );
    const catData = await catRes.json();
    if (!catData.length) return;

    kategoriId = catData[0].id;
    kategoriNama = catData[0].name;
  } catch {
    return;
  }

  async function getMedia(mediaId) {
    if (!mediaId) return 'image/ai.jpg';
    if (mediaCache[mediaId]) return mediaCache[mediaId];

    try {
      const res = await fetch(
        `https://lampost.co/wp-json/wp/v2/media/${mediaId}`
      );
      if (!res.ok) throw 0;

      const data = await res.json();
      return (mediaCache[mediaId] =
        data.media_details?.sizes?.medium?.source_url ||
        data.source_url ||
        'image/ai.jpg'
      );
    } catch {
      return 'image/ai.jpg';
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
    if (isLoading || !hasMore) return;
    isLoading = true;

    try {
      const api =
        'https://lampost.co/wp-json/wp/v2/posts' +
        `?categories=${kategoriId}` +
        `&per_page=${PER_PAGE}` +
        `&page=${page}` +
        `&orderby=date&order=desc`;

      const res = await fetch(api);

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

      let output = '';

      posts.forEach(post => {
        if (currentSlug && post.slug === currentSlug) return;

        const id = `post-${post.id}`;
        const judul = post.title.rendered;
        const slug = post.slug;

        let deskripsi =
          post.excerpt?.rendered
            ?.replace(/<[^>]+>/g, '')
            ?.trim() || '';

        if (deskripsi.length > 150)
          deskripsi = deskripsi.slice(0, 150) + '...';

        const d = new Date(post.date);
        const tanggal =
          `${String(d.getDate()).padStart(2, '0')}/` +
          `${String(d.getMonth() + 1).padStart(2, '0')}/` +
          `${d.getFullYear()}`;

        output += `
          <a href="halaman.html?${kategoriSlug}/${slug}"
             class="item-info"
             id="${id}">
            <img
              src="image/ai.jpg"
              data-media="${post.featured_media}"
              class="img-microweb"
              loading="lazy">
            <div class="berita-microweb">
              <p class="judul">${judul}</p>
              <p class="kategori">${kategoriNama}</p>
              <div class="info-microweb">
                <p class="editor">By Redaksi</p>
                <p class="tanggal">${tanggal}</p>
              </div>
              <p class="deskripsi">${deskripsi}</p>
            </div>
          </a>
        `;
      });

      container.insertAdjacentHTML('beforeend', output);

      titleEl.style.display = 'block';
      lineAccent.style.display = 'block';
      loadMoreBtn.style.display = 'block';

      posts.forEach(post => {
        const el = document.getElementById(`post-${post.id}`);
        if (!el) return;

        const img = el.querySelector('.img-microweb');
        const editorEl = el.querySelector('.editor');

        getMedia(post.featured_media).then(src => {
          img.src = src;
        });

        getEditor(post).then(name => {
          editorEl.textContent = 'By ' + name;
        });
      });

      page++;

    } finally {
      isLoading = false;
    }
  }

  loadPosts();
  loadMoreBtn.addEventListener('click', loadPosts);

});
