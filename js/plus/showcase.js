document.addEventListener('DOMContentLoaded', () => {

    const container = document.querySelector('.showcase');
    if (!container) return;

    const PER_PAGE = 8;

    const API_URL = `https://lampost.co/wp-json/wp/v2/posts?orderby=date&order=desc&per_page=${PER_PAGE}`;

    const catCache = {};
    const mediaCache = {};

    const FALLBACK_IMG = 'https://lampost.co/image/ai.jpeg';

    const formatTanggal = dateString =>
        new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

    async function getCategory(catId) {
        if (!catId) return { name: 'Berita', slug: 'berita', parent: 0 };
        if (catCache[catId]) return catCache[catId];

        const res = await fetch(`https://lampost.co/wp-json/wp/v2/categories/${catId}`);
        const data = await res.json();

        return (catCache[catId] = {
            name: data?.name || 'Berita',
            slug: data?.slug || 'berita',
            parent: data?.parent || 0
        });
    }

    async function getCategoryHierarchy(catId) {
        const current = await getCategory(catId);

        if (!current.parent || current.parent === 0) {
            return [current];
        }

        const parent = await getCategory(current.parent);

        return [parent, current];
    }

    // 🔥 convert ke webp
    function toWebp(url) {
        if (!url) return FALLBACK_IMG;
        if (url.includes('.webp')) return url;
        return url.replace(/\.(jpg|jpeg|png)/i, '.webp');
    }

    function getMedia(mediaId) {
        if (!mediaId) return Promise.resolve(FALLBACK_IMG);
        if (mediaCache[mediaId]) return Promise.resolve(mediaCache[mediaId]);

        return fetch(`https://lampost.co/wp-json/wp/v2/media/${mediaId}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {

                let url =
                    data?.media_details?.sizes?.large?.source_url || // HD
                    data?.media_details?.sizes?.full?.source_url ||
                    data?.media_details?.sizes?.medium_large?.source_url ||
                    data?.source_url ||
                    FALLBACK_IMG;

                url = toWebp(url);

                mediaCache[mediaId] = url;
                return url;
            })
            .catch(() => FALLBACK_IMG);
    }

    function shuffle(array) {
        return array.sort(() => 0.5 - Math.random());
    }

    function renderFast(post) {

        const judul = post.title.rendered;
        const tanggal = formatTanggal(post.date);
        const id = `card-${post.id}`;

        const deskripsi =
            post.excerpt?.rendered
                ?.replace(/(<([^>]+)>)/gi, '')
                ?.slice(0, 100);

        return `
      <div class="news-card-big" id="${id}">
        
        <div class="card-header">Populer</div>

        <!-- ⚠️ tetap pakai fallback awal -->
        <img src="${FALLBACK_IMG}" class="card-img">

        <div class="card-body">
          <h3 class="card-title">${judul}</h3>
          <p class="card-desc">${deskripsi}...</p>

          <ul class="card-list">
            <li>Memuat...</li>
          </ul>

          <div class="card-footer">
            <span><img src="image/logo.png" class="icon-showcase">Etalase</span>
            <span>${tanggal}</span>
          </div>
        </div>

      </div>
    `;
    }

    async function enrich(post) {

        const el = document.getElementById(`card-${post.id}`);
        if (!el) return;

        const kategoriHierarchy = await getCategoryHierarchy(post.categories?.[0]);

        const slugPath = kategoriHierarchy.map(c => c.slug).join('/');
        const kategoriName = kategoriHierarchy[kategoriHierarchy.length - 1].name;

        const imgEl = el.querySelector('.card-img');

        // 🔥 optimasi img
        imgEl.setAttribute('loading', 'lazy');
        imgEl.setAttribute('decoding', 'async');

        // 🔥 handle error fallback
        imgEl.onerror = () => {
            imgEl.src = FALLBACK_IMG;
        };

        // 🔥 ambil HD + webp
        const gambar = await getMedia(post.featured_media);

        // 🔥 swap gambar
        imgEl.src = gambar;

        el.querySelector('.card-header').textContent = kategoriName;

        let relatedHTML = '';

        try {
            const res = await fetch(API_URL);
            const related = await res.json();

            const relatedItems = await Promise.all(
                shuffle(related)
                    .filter(r => r.id !== post.id)
                    .slice(0, 3)
                    .map(async r => {

                        const rKategoriHierarchy = await getCategoryHierarchy(r.categories?.[0]);
                        const rSlugPath = rKategoriHierarchy.map(c => c.slug).join('/');

                        return `
            <li>
              <a href="/${rSlugPath}/${r.slug}" class="related-link">
                ${r.title.rendered}
              </a>
            </li>
          `;
                    })
            );

            relatedHTML = relatedItems.join('');

        } catch {}

        el.querySelector('.card-list').innerHTML = relatedHTML;

        el.querySelectorAll('.related-link').forEach(link => {
            link.addEventListener('click', e => {
                e.stopPropagation();
            });
        });

        el.addEventListener('click', () => {
            window.location.href = `/${slugPath}/${post.slug}`;
        });
    }

    async function init() {
        try {

            const res = await fetch(API_URL);
            let posts = await res.json();

            posts = shuffle(posts).slice(0, 4);

            container.innerHTML = posts.map(renderFast).join('');

            posts.forEach(post => enrich(post));

        } catch {
            container.innerHTML = 'Gagal memuat berita';
        }
    }

    init();

});