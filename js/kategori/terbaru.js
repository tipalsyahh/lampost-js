document.addEventListener('DOMContentLoaded', async () => {

  const container = document.querySelector('.terbaru');
  if (!container) return;

  /* ===============================
     CACHE
  =============================== */
  const catCache = {};
  const mediaCache = {};
  const editorCache = {};

  /* ===============================
     AMBIL KATEGORI
  =============================== */
  async function getCategory(catId) {
    if (!catId) return { name: 'Teknokrat', slug: 'teknokrat' };
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

  /* ===============================
     AMBIL GAMBAR
  =============================== */
  async function getMedia(mediaId) {
    if (!mediaId) return 'image/ai.jpg';
    if (mediaCache[mediaId]) return mediaCache[mediaId];

    const res = await fetch(
      `https://lampost.co/wp-json/wp/v2/media/${mediaId}`
    );
    const data = await res.json();

    return (mediaCache[mediaId] =
      data.media_details?.sizes?.medium?.source_url ||
      data.source_url ||
      'image/ai.jpg'
    );
  }

  /* ===============================
     ✍️ EDITOR (SAMA SEPERTI SCRIPT ACUAN)
  =============================== */
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

  try {
    /* ===============================
       AMBIL POST TERBARU
    =============================== */
    const res = await fetch(
      'https://lampost.co/wp-json/wp/v2/posts' +
      '?per_page=6&orderby=date&order=desc'
    );

    if (!res.ok) throw new Error('Gagal mengambil API');

    const posts = await res.json();
    let output = '';

    await Promise.all(
      posts.map(async post => {

        const judul = post.title.rendered;
        const slug = post.slug;

        const catId = post.categories?.[0];
        const { name: category, slug: categorySlug } =
          await getCategory(catId);

        const link = `../halaman.html?${categorySlug}/${slug}`;

        let deskripsi =
          post.excerpt?.rendered
            ?.replace(/<[^>]+>/g, '')
            ?.trim() || '';

        if (deskripsi.length > 150) {
          deskripsi = deskripsi.slice(0, 150) + '...';
        }

        const gambar = await getMedia(post.featured_media);
        const editor = await getEditor(post);

        const tanggal = new Date(post.date)
          .toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          });

        output += `
          <a href="${link}" class="item-microweb">
            <img
              src="${gambar}"
              alt="${judul}"
              class="img-terbaru-teknokrat"
              loading="lazy">

            <div class="berita-microweb">
              <p class="judul-terbaru">${judul}</p>
              <div class="info-microweb">
                <p class="editor">By ${editor}</p>
                <p class="tanggal">${tanggal}</p>
              </div>
            </div>
          </a>
        `;
      })
    );

    container.innerHTML =
      output || '<p>Konten tidak tersedia</p>';

  } catch (err) {
    console.error('API gagal dimuat:', err);
    container.innerHTML =
      '<p>Konten gagal dimuat</p>';
  }

});
