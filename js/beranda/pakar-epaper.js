document.addEventListener('DOMContentLoaded', async () => {

    const container = document.querySelector('.kolom-pakar');
    if (!container) return;

    const TERM_CACHE = {};
    const MEDIA_CACHE = {};

    try {

        // ===========================
        // AMBIL KATEGORI BERDASARKAN SLUG
        // ===========================
        const catRes = await fetch(
            'https://lampost.co/epaper/wp-json/wp/v2/categories?slug=kolom-pakar'
        );

        if (!catRes.ok) throw new Error('Gagal mengambil kategori');

        const catData = await catRes.json();

        if (!catData.length) {
            container.insertAdjacentHTML(
                'beforeend',
                '<p>Kategori tidak ditemukan</p>'
            );
            return;
        }

        const categoryId = catData[0].id;
        const kategoriNama = catData[0].name || 'Nasional';
        const kategoriSlug = catData[0].slug || 'nasional';

        // ===========================
        // AMBIL POST
        // ===========================
        const res = await fetch(
            `https://lampost.co/epaper/wp-json/wp/v2/posts?categories=${categoryId}&per_page=10&orderby=date&order=desc`
        );

        if (!res.ok) throw new Error('Gagal mengambil post');

        const posts = await res.json();

        if (!posts.length) {
            container.insertAdjacentHTML(
                'beforeend',
                '<p>Belum ada berita</p>'
            );
            return;
        }

        const htmlArr = [];

        for (const post of posts) {

            const judul = post.title?.rendered || 'Tanpa Judul';

            // ===========================
            // LINK REDIRECT
            // ===========================
            const link = `https://lampost.co/epaper/${kategoriSlug}/${post.slug}/`;

            // ===========================
            // EDITOR
            // ===========================
            let editor = 'Redaksi';

            const termLink = post._links?.['wp:term']?.find(
                term => term.taxonomy === 'author'
            )?.href;

            if (termLink) {

                if (TERM_CACHE[termLink]) {

                    editor = TERM_CACHE[termLink];

                } else {

                    try {

                        const termRes = await fetch(termLink);

                        if (termRes.ok) {

                            const termData = await termRes.json();

                            editor = termData?.[0]?.name || editor;

                            TERM_CACHE[termLink] = editor;

                        }

                    } catch (e) {
                        console.warn('Gagal mengambil editor', e);
                    }

                }

            }

            // ===========================
            // GAMBAR
            // ===========================
            let gambar = 'https://lampost.co/image/ai.jpeg';

            if (post.featured_media) {

                if (MEDIA_CACHE[post.featured_media]) {

                    gambar = MEDIA_CACHE[post.featured_media];

                } else {

                    try {

                        const mediaRes = await fetch(
                            `https://lampost.co/epaper/wp-json/wp/v2/media/${post.featured_media}`
                        );

                        if (mediaRes.ok) {

                            const media = await mediaRes.json();

                            gambar =
                                media.media_details?.sizes?.large?.source_url ||
                                media.media_details?.sizes?.medium_large?.source_url ||
                                media.media_details?.sizes?.full?.source_url ||
                                media.source_url ||
                                gambar;

                            MEDIA_CACHE[post.featured_media] = gambar;

                        }

                    } catch (e) {
                        console.warn('Gagal mengambil gambar', e);
                    }

                }

            }

            // ===========================
            // HTML
            // ===========================
            htmlArr.push(`
                <a href="${link}" class="post-item" target="_blank" rel="noopener noreferrer">

                    <div class="post-content">

                        <div class="post-title">
                            ${judul}
                        </div>

                    </div>

                    <div class="post-thumb">

                        <img 
                            src="${gambar}" 
                            alt="${judul}" 
                            loading="lazy" 
                            decoding="async"
                        >

                    </div>

                </a>
            `);

        }

        container.insertAdjacentHTML(
            'beforeend',
            htmlArr.join('')
        );

    } catch (err) {

        console.error('ERROR:', err);

        container.insertAdjacentHTML(
            'beforeend',
            '<p>Gagal memuat berita</p>'
        );

    }

});