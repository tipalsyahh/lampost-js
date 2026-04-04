document.addEventListener('DOMContentLoaded', async () => {

    const container = document.querySelector('.internasional');
    if (!container) return;

    function stripHTML(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }

    try {

        const catRes = await fetch(
            'https://lampost.co/wp-json/wp/v2/categories?slug=internasional'
        );
        if (!catRes.ok) throw new Error();

        const catData = await catRes.json();
        if (!catData.length) return;

        const categoryId = catData[0].id;

        const res = await fetch(
            `https://lampost.co/wp-json/wp/v2/posts?categories=${categoryId}&per_page=3&orderby=date&order=desc&_embed`
        );
        if (!res.ok) throw new Error();

        const posts = await res.json();

        let html = '';

        posts.forEach(post => {

            const judul = post.title.rendered;

            const kategoriSlug =
                post._embedded?.['wp:term']?.[0]?.[0]?.slug || 'berita';

            const link = `halaman.html?${kategoriSlug}/${post.slug}`;

            const tanggal = new Date(post.date).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });

            const editor =
                post._embedded?.['wp:term']?.[2]?.[0]?.name || 'Redaksi';

            const gambar =
                post._embedded?.['wp:featuredmedia']?.[0]?.source_url
                || 'image/ai.jpg';

            const deskripsi = post.excerpt?.rendered
                ? stripHTML(post.excerpt.rendered).substring(0, 140) + '...'
                : '';

            html += `
        <a href="${link}" class="intl-card">
          <div class="intl-content">

            <span class="intl-category">Internasional ${tanggal}</span>
            <h3 class="intl-title">${judul}</h3>

            <p class="intl-desc">${deskripsi}</p>

          </div>
            <div class="intl-image">
                <img src="${gambar}" alt="${judul}" loading="lazy">
          </div>
        </a>
      `;
        });

        container.insertAdjacentHTML('beforeend', html);

    } catch (err) {
        console.error(err);
        container.insertAdjacentHTML(
            'beforeend',
            '<p>Gagal memuat berita internasional</p>'
        );
    }

});