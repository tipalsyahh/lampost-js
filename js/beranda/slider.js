document.addEventListener('DOMContentLoaded', () => {

    const heroLeft = document.querySelector('.hero-left');
    const top1 = document.querySelector('.top-1');
    const top2 = document.querySelector('.top-2');
    const bottom1 = document.querySelector('.bottom-1');

    if (!heroLeft || !top1 || !top2 || !bottom1) return;

    function formatTanggal(dateString) {
        const d = new Date(dateString);
        const bulan = d.toLocaleString('en-US', { month: 'short' });
        return `${bulan} ${d.getDate()}`;
    }

    function killBorder(el) {
        el.style.width = '100%';
        el.style.boxSizing = 'border-box';
        el.style.outline = 'none';
        el.style.border = 'none';
        el.style.boxShadow = 'none';
        el.style.webkitTapHighlightColor = 'transparent';
    }

    function renderFast(el, post) {

        const judul = post.title.rendered;
        const tanggal = formatTanggal(post.date);

        // 🔥 ambil data langsung dari _embed
        const img =
            post._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
            'https://lampost.co/image/ai.jpeg';

        const kategori =
            post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Berita';

        const kategoriSlug =
            post._embedded?.['wp:term']?.[0]?.[0]?.slug || 'berita';

        const editor =
            post._embedded?.author?.[0]?.name || 'Redaksi';

        const link = `/${kategoriSlug}/${post.slug}`;

        el.innerHTML = `
            <a href="${link}" class="hero-link">
                <img src="${img}" alt="${judul}" loading="lazy" decoding="async">
                <div class="hero-content">
                    <p class="hero-category">${kategori}</p>
                    <h2 class="card-text">${judul}</h2>
                    <div class="detail-info">
                        <p class="editor-slider">By ${editor}</p>
                        <p class="tanggal-slider">${tanggal}</p>
                    </div>
                </div>
            </a>
        `;

        killBorder(el.querySelector('.hero-link'));
    }

    async function init() {
        try {

            // 🔥 langsung ambil post + embed
            const res = await fetch(
                `https://lampost.co/wp-json/wp/v2/posts` +
                `?tags=headline&_embed&per_page=4&orderby=date&order=desc`
            );

            if (!res.ok) throw new Error('Gagal ambil data');

            const posts = await res.json();
            if (posts.length < 4) return;

            renderFast(heroLeft, posts[0]);
            renderFast(top1, posts[1]);
            renderFast(top2, posts[2]);
            renderFast(bottom1, posts[3]);

        } catch (err) {
            console.error(err);
        }
    }

    init();

});