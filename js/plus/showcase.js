document.addEventListener('DOMContentLoaded', () => {

    const container = document.querySelector('.showcase');
    if (!container) return;

    const PER_PAGE = 8;

    const API_URL = `https://lampost.co/wp-json/wp/v2/posts?orderby=date&order=desc&per_page=${PER_PAGE}`;

    const catCache = {};
    const mediaCache = {};

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

    // ✅ TAMBAHAN: ambil parent + child
    async function getCategoryHierarchy(catId) {
        const current = await getCategory(catId);

        if (!current.parent || current.parent === 0) {
            return [current];
        }

        const parent = await getCategory(current.parent);

        return [parent, current];
    }

    function getMedia(mediaId) {
        if (!mediaId) return 'image/default.jpg';
        if (mediaCache[mediaId]) return mediaCache[mediaId];

        return fetch(`https://lampost.co/wp-json/wp/v2/media/${mediaId}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                const url =
                    data?.media_details?.sizes?.medium?.source_url ||
                    data?.source_url ||
                    'image/default.jpg';

                mediaCache[mediaId] = url;
                return url;
            })
            .catch(() => 'image/default.jpg');
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

        <img src="image/default.jpg" class="card-img">

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

        const gambar = await getMedia(post.featured_media);

        el.querySelector('.card-header').textContent = kategoriName;
        el.querySelector('.card-img').src = gambar;

        let relatedHTML = '';

        try {
            const res = await fetch(API_URL);
            const related = await res.json();

            // ✅ ambil kategori masing-masing related post
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

        // ✅ link utama sudah pakai parent/child
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