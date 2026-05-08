document.addEventListener('DOMContentLoaded', () => {

    const container = document.querySelector('.showcase');

    if (!container) return;

    // =========================
    // CONFIG
    // =========================
    const PER_PAGE = 20;

    const API_URL =
        `https://lampost.co/wp-json/wp/v2/posts?orderby=date&order=desc&per_page=${PER_PAGE}`;

    const FALLBACK_IMG =
        'https://lampost.co/image/ai.jpeg';

    const catCache = {};
    const mediaCache = {};

    // =========================
    // FORMAT TANGGAL
    // =========================
    const formatTanggal = dateString =>
        new Date(dateString).toLocaleDateString(
            'id-ID',
            {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            }
        );

    // =========================
    // GET CATEGORY
    // =========================
    async function getCategory(catId) {

        if (!catId) {

            return {
                id: 0,
                name: 'Berita',
                slug: 'berita',
                parent: 0
            };
        }

        if (catCache[catId]) {
            return catCache[catId];
        }

        const res =
            await fetch(
                `https://lampost.co/wp-json/wp/v2/categories/${catId}`
            );

        const data =
            await res.json();

        return (
            catCache[catId] = {
                id: data?.id || 0,
                name: data?.name || 'Berita',
                slug: data?.slug || 'berita',
                parent: data?.parent || 0
            }
        );
    }

    // =========================
    // CATEGORY HIERARCHY
    // =========================
    async function getCategoryHierarchy(catId) {

        const current =
            await getCategory(catId);

        if (
            !current.parent ||
            current.parent === 0
        ) {

            return [current];
        }

        const parent =
            await getCategory(current.parent);

        return [parent, current];
    }

    // =========================
    // GET MEDIA
    // =========================
    function getMedia(mediaId) {

        if (!mediaId) {
            return Promise.resolve(
                FALLBACK_IMG
            );
        }

        if (mediaCache[mediaId]) {

            return Promise.resolve(
                mediaCache[mediaId]
            );
        }

        return fetch(
            `https://lampost.co/wp-json/wp/v2/media/${mediaId}`
        )
            .then(res =>
                res.ok ? res.json() : null
            )
            .then(data => {

                const url =
                    data?.media_details?.sizes?.full?.source_url ||
                    data?.media_details?.sizes?.large?.source_url ||
                    data?.media_details?.sizes?.medium_large?.source_url ||
                    data?.source_url ||
                    FALLBACK_IMG;

                mediaCache[mediaId] = url;

                return url;
            })
            .catch(() => FALLBACK_IMG);
    }

    // =========================
    // SHUFFLE
    // =========================
    function shuffle(array) {

        return [...array].sort(
            () => 0.5 - Math.random()
        );
    }

    // =========================
    // RENDER FAST
    // =========================
    function renderFast(post) {

        const judul =
            post.title.rendered;

        const tanggal =
            formatTanggal(post.date);

        const id =
            `card-${post.id}`;

        const deskripsi =
            post.excerpt?.rendered
                ?.replace(/(<([^>]+)>)/gi, '')
                ?.slice(0, 100);

        return `
        <div
            class="news-card-big"
            id="${id}"
        >

            <div class="card-header">
                Loading...
            </div>

            <img
                src="${FALLBACK_IMG}"
                class="card-img"
            >

            <div class="card-body">

                <h3 class="card-title">
                    ${judul}
                </h3>

                <p class="card-desc">
                    ${deskripsi}...
                </p>

                <ul class="card-list">
                    <li>Memuat...</li>
                </ul>

                <div class="card-footer">

                    <span>
                        <img
                            src="image/logo.png"
                            class="icon-showcase"
                        >
                        Etalase
                    </span>

                    <span>
                        ${tanggal}
                    </span>

                </div>

            </div>

        </div>
        `;
    }

    // =========================
    // ENRICH CARD
    // =========================
    async function enrich(post) {

        const el =
            document.getElementById(
                `card-${post.id}`
            );

        if (!el) return;

        // =========================
        // CATEGORY
        // =========================
        const mainCatId =
            post.categories?.[0];

        const kategoriHierarchy =
            await getCategoryHierarchy(
                mainCatId
            );

        const category =
            kategoriHierarchy[
                kategoriHierarchy.length - 1
            ];

        const categoryName =
            category.name;

        const slugPath =
            kategoriHierarchy
                .map(c => c.slug)
                .join('/');

        // =========================
        // HEADER
        // =========================
        el.querySelector(
            '.card-header'
        ).textContent =
            categoryName;

        // =========================
        // IMAGE
        // =========================
        const imgEl =
            el.querySelector('.card-img');

        imgEl.loading = 'lazy';

        imgEl.decoding = 'async';

        imgEl.onerror = () => {

            imgEl.src =
                FALLBACK_IMG;
        };

        const gambar =
            await getMedia(
                post.featured_media
            );

        imgEl.src = gambar;

        // =========================
        // RELATED POSTS
        // =========================
        let relatedHTML = '';

        try {

            // ambil berita kategori sama
            const relatedRes =
                await fetch(
                    `https://lampost.co/wp-json/wp/v2/posts?categories=${mainCatId}&per_page=4`
                );

            const relatedPosts =
                await relatedRes.json();

            // buang post sendiri
            const filteredPosts =
                relatedPosts.filter(
                    r => r.id !== post.id
                );

            const relatedItems =
                await Promise.all(

                    filteredPosts
                        .slice(0, 3)
                        .map(async r => {

                            const rHierarchy =
                                await getCategoryHierarchy(
                                    r.categories?.[0]
                                );

                            const rSlugPath =
                                rHierarchy
                                    .map(c => c.slug)
                                    .join('/');

                            return `
                            <li>
                                <a
                                    href="/${rSlugPath}/${r.slug}"
                                    class="related-link"
                                >
                                    ${r.title.rendered}
                                </a>
                            </li>
                            `;
                        })
                );

            relatedHTML =
                relatedItems.join('');

            // fallback
            if (!relatedHTML) {

                relatedHTML =
                    '<li>Tidak ada berita terkait</li>';
            }

        } catch {

            relatedHTML =
                '<li>Gagal memuat berita</li>';
        }

        el.querySelector(
            '.card-list'
        ).innerHTML =
            relatedHTML;

        // =========================
        // STOP PROPAGATION
        // =========================
        el.querySelectorAll(
            '.related-link'
        ).forEach(link => {

            link.addEventListener(
                'click',
                e => {
                    e.stopPropagation();
                }
            );
        });

        // =========================
        // CLICK CARD
        // =========================
        el.addEventListener(
            'click',
            () => {

                window.location.href =
                    `/${slugPath}/${post.slug}`;
            }
        );
    }

    // =========================
    // INIT
    // =========================
    async function init() {

        try {

            const res =
                await fetch(API_URL);

            let posts =
                await res.json();

            posts =
                shuffle(posts);

            // =========================
            // AMBIL POST
            // DENGAN CATEGORY BERBEDA
            // =========================
            const usedCategories =
                new Set();

            const selectedPosts =
                [];

            for (const post of posts) {

                const catId =
                    post.categories?.[0];

                if (
                    !usedCategories.has(catId)
                ) {

                    usedCategories.add(
                        catId
                    );

                    selectedPosts.push(
                        post
                    );
                }

                if (
                    selectedPosts.length >= 4
                ) {
                    break;
                }
            }

            // fallback
            if (
                selectedPosts.length < 4
            ) {

                const remainPosts =
                    posts.filter(
                        p =>
                        !selectedPosts.some(
                            s => s.id === p.id
                        )
                    );

                selectedPosts.push(
                    ...remainPosts.slice(
                        0,
                        4 - selectedPosts.length
                    )
                );
            }

            // =========================
            // RENDER
            // =========================
            container.innerHTML =
                selectedPosts
                    .map(renderFast)
                    .join('');

            // =========================
            // ENRICH
            // =========================
            selectedPosts.forEach(
                post =>
                enrich(post)
            );

        } catch {

            container.innerHTML =
                'Gagal memuat berita';
        }
    }

    init();

});