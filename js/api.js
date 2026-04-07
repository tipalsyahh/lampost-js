document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.info');
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

  const loadMoreWrapper = document.createElement('center');
  loadMoreWrapper.innerHTML =
    '<button id="loadMore" class="load-more">LOAD MORE</button>';
  container.after(loadMoreWrapper);

  const loadMoreBtn = document.getElementById('loadMore');

  function formatTanggal(dateString) {
    const d = new Date(dateString);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
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
    if (isLoading || !hasMore || page > MAX_PAGE) {
      loadMoreBtn.style.display = 'none';
      return;
    }

    isLoading = true;
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Loading...';

    try {
      const res = await fetch(
        `${API_BASE}&per_page=${PER_PAGE}&page=${page}`
      );
      if (!res.ok) throw new Error();

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

          const { name: kategori, slug: kategoriSlug } =
            await getCategory(post.categories?.[0]);

          const gambar = await getMedia(post.featured_media);
          const editor = await getEditor(post);

          const link = `halaman.html?${kategoriSlug}/${post.slug}`;

          htmlArr.push(`
            <a href="${link}" class="item-berita">
              <img src="${gambar}" alt="${judul}">
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

      container.insertAdjacentHTML('beforeend', htmlArr.join(''));
      page++;

    } catch (e) {
      console.error(e);
    } finally {
      isLoading = false;
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = 'LOAD MORE';
    }
  }

  loadMoreBtn.addEventListener('click', loadPosts);
  loadPosts();

});
