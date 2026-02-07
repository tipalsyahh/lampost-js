document.addEventListener('DOMContentLoaded', async () => {

  const container = document.querySelector('.sport');
  if (!container) return;

  const TERM_CACHE = {};
  const MEDIA_CACHE = {};

  try {
    // ===============================
    // AMBIL ID KATEGORI OLAHRAGA
    // ===============================
    const catRes = await fetch(
      'https://lampost.co/wp-json/wp/v2/categories?slug=olahraga'
    );
    if (!catRes.ok) throw new Error('Gagal ambil kategori');

    const catData = await catRes.json();
    if (!catData.length) {
      container.insertAdjacentHTML(
        'beforeend',
        '<p>Kategori olahraga tidak ditemukan</p>'
      );
      return;
    }

    const categoryId = catData[0].id;
    const kategoriSlug = 'olahraga';

    // ===============================
    // AMBIL POST (TANPA _embed)
    // ===============================
    const res = await fetch(
      `https://lampost.co/wp-json/wp/v2/posts?categories=${categoryId}&per_page=3&orderby=date&order=desc`
    );
    if (!res.ok) throw new Error('Gagal ambil berita');

    const posts = await res.json();
    if (!posts.length) return;

    const htmlArr = [];

    for (const post of posts) {

      const judul = post.title.rendered;

      const link = `halaman.html?${kategoriSlug}/${post.slug}`;

      const tanggal = new Date(post.date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      // ===============================
      // ✍️ EDITOR (LOGIKA SAMA PERSIS)
      // ===============================
      let editor = 'Redaksi';

      const termLink = post._links?.['wp:term']?.[2]?.href;
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
          } catch (_) {}
        }
      }

      // ===============================
      // 🖼️ GAMBAR
      // ===============================
      let gambar = 'image/ai.jpg';

      if (post.featured_media) {
        if (MEDIA_CACHE[post.featured_media]) {
          gambar = MEDIA_CACHE[post.featured_media];
        } else {
          try {
            const mediaRes = await fetch(
              `https://lampost.co/wp-json/wp/v2/media/${post.featured_media}`
            );
            if (mediaRes.ok) {
              const media = await mediaRes.json();
              gambar =
                media.media_details?.sizes?.medium?.source_url ||
                media.source_url ||
                gambar;

              MEDIA_CACHE[post.featured_media] = gambar;
            }
          } catch (_) {}
        }
      }

      htmlArr.push(`
        <a href="${link}" class="item-olahraga">
          <img src="${gambar}" alt="${judul}" class="img-olahraga" loading="lazy">
          <p class="judul">${judul}</p>
          <div class="meta">
            <span class="editor">By ${editor}</span>
            <span class="tanggal">${tanggal}</span>
          </div>
        </a>
      `);
    }

    container.insertAdjacentHTML('beforeend', htmlArr.join(''));

  } catch (err) {
    console.error(err);
    container.insertAdjacentHTML(
      'beforeend',
      '<p>Gagal memuat berita olahraga</p>'
    );
  }

});
