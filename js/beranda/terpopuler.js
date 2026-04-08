document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.home');
  const loadMoreBtn = document.getElementById('loadMore');
  if (!container || !loadMoreBtn) return;

  const PER_PAGE = 10;
  const MAX_PAGE = 6;

  let page = 1;
  let isLoading = false;
  let hasMore = true;

  const categoryCache = {};

  const formatTanggal = d => {
    d = new Date(d);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  };

  const getTrendingScore = post => {
    const now = new Date();
    const postDate = new Date(post.date);
    const hoursDiff = (now - postDate) / (1000 * 60 * 60);
    const freshness = Math.max(0, 100 - hoursDiff);
    const comments = post.comment_count || 0;
    return freshness + (comments * 5);
  };

  async function getCategorySlug(catIds) {
    if (!catIds || !catIds.length) return 'post';
    const id = catIds[0];
    if (categoryCache[id]) return categoryCache[id];
    try {
      const res = await fetch(`https://lampost.co/wp-json/wp/v2/categories/${id}`);
      const data = await res.json();
      return categoryCache[id] = data.slug || 'post';
    } catch {
      return 'post';
    }
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
        `https://lampost.co/wp-json/wp/v2/posts?per_page=${PER_PAGE}&page=${page}&_embed&orderby=date&order=desc`
      );

      if (!res.ok) {
        hasMore = false;
        loadMoreBtn.style.display = 'none';
        return;
      }

      let posts = await res.json();

      if (!posts.length) {
        hasMore = false;
        loadMoreBtn.style.display = 'none';
        return;
      }

      posts.sort((a,b) => getTrendingScore(b) - getTrendingScore(a));
      posts = posts.slice(0,6);

      const htmlArr = [];

      posts.forEach(post => {

        const id = `p-${post.id}`;

        htmlArr.push(`
          <a href="#" class="item-info" id="${id}">
            <img src="${post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'image/ai.jpg'}" class="img-microweb" loading="lazy">
            <div class="berita-microweb">
              <p class="judul">${post.title.rendered}</p>
              <p class="kategori">Terpopuler</p>
              <div class="info-microweb">
                <p class="editor">By ${post._embedded?.author?.[0]?.name || 'Redaksi'}</p>
                <p class="tanggal">${formatTanggal(post.date)}</p>
              </div>
              <p class="deskripsi">${(post.excerpt?.rendered || '').replace(/<[^>]+>/g,'').slice(0,150)}...</p>
            </div>
          </a>
        `);

        (async () => {
          const slugKategori = await getCategorySlug(post.categories);
          const el = document.getElementById(id);
          if (!el) return;
          el.href = `halaman.html?${slugKategori}/${post.slug}`;
        })();

      });

      container.insertAdjacentHTML('beforeend', htmlArr.join(''));
      page++;

    } catch {}

    isLoading = false;
    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = 'Load More';
  }

  loadMoreBtn.addEventListener('click', loadPosts);

  loadPosts();

});