document.addEventListener('DOMContentLoaded', async () => {

  const container = document.querySelector('.terbaru');
  if (!container) return;

  const PER_PAGE = 5;

  try {
    const api =
      'https://lampost.co/microweb/universitaslampung/wp-json/wp/v2/posts' +
      `?per_page=${PER_PAGE}&orderby=date&order=desc&_embed`;

    const res = await fetch(api);
    if (!res.ok) throw new Error('Gagal ambil data');

    const posts = await res.json();
    if (!posts.length) return;

    let output = '';

    posts.forEach((post, i) => {

      const judul = post.title.rendered;
      const slug = post.slug;

      const kategori =
        post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Teknokrat';

      const kategoriSlug =
        post._embedded?.['wp:term']?.[0]?.[0]?.slug || 'teknokrat';

      const link = `berita.unila.html?${kategoriSlug}/${slug}`;

      let deskripsi =
        post.excerpt?.rendered?.replace(/<[^>]+>/g, '').trim() || '';

      if (deskripsi.length > 150) {
        deskripsi = deskripsi.slice(0, 150) + '...';
      }

      const gambar =
        post._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
        'image/ai.jpg';

      const d = new Date(post.date);
      const tanggal =
        `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

      const editor =
        post._embedded?.author?.[0]?.name || 'Redaksi';

      /* 🔥 ITEM PERTAMA (HEADLINE) */
      if (i === 0) {
        output += `
          <a href="${link}" class="item-info">
            <img src="${gambar}" alt="${judul}" class="img-microweb-terbaru" loading="lazy">
            <div class="berita-detail">
              <p class="judul">${judul}</p>
              <p class="kategori">${kategori}</p>
              <div class="info-microweb">
                <p class="editor">Oleh ${editor}</p>
                <p class="tanggal">${tanggal}</p>
              </div>
              <p class="deskripsi">${deskripsi}</p>
            </div>
          </a>
        `;
      } 
      /* ITEM KE-2 s/d KE-5 */
      else {
        output += `
          <a href="${link}" class="item-microweb">
            <img
              src="${gambar}"
              alt="${judul}"
              class="img-terbaru-detail"
              loading="lazy">

            <div class="berita-detail">
              <p class="judul-terbaru">${judul}</p>
              <div class="info-microweb">
                <p class="tanggal">${tanggal}</p>
              </div>
            </div>
          </a>
        `;
      }
    });

    container.insertAdjacentHTML('beforeend', output);

  } catch (err) {
    console.error(err);
  }

});
