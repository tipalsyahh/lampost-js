document.addEventListener('DOMContentLoaded', async () => {

  const container = document.querySelector('.hiburan');
  if (!container) return;

  const catCache = {};
  const mediaCache = {};

  async function getCategorySlug(catId) {
    if (!catId) return 'berita';
    if (catCache[catId]) return catCache[catId];

    const res = await fetch(
      `https://lampost.co/wp-json/wp/v2/categories/${catId}`
    );
    if (!res.ok) return 'berita';

    const data = await res.json();
    return (catCache[catId] = data.slug || 'berita');
  }

  async function getMedia(mediaId) {
    if (!mediaId) return 'image/ai.jpg';
    if (mediaCache[mediaId]) return mediaCache[mediaId];

    const res = await fetch(
      `https://lampost.co/wp-json/wp/v2/media/${mediaId}`
    );
    if (!res.ok) return 'image/ai.jpg';

    const data = await res.json();
    return (mediaCache[mediaId] =
      data.media_details?.sizes?.medium?.source_url ||
      data.source_url ||
      'image/ai.jpg'
    );
  }

  try {
    // ===============================
    // 1️⃣ AMBIL ID KATEGORI HIBURAN
    // ===============================
    const catRes = await fetch(
      'https://lampost.co/wp-json/wp/v2/categories?slug=hiburan'
    );
    if (!catRes.ok) throw new Error('Gagal ambil kategori');

    const catData = await catRes.json();
    if (!catData.length) {
      container.insertAdjacentHTML(
        'beforeend',
        '<p>Kategori hiburan tidak ditemukan</p>'
      );
      return;
    }

    const categoryId = catData[0].id;

    // ===============================
    // 2️⃣ AMBIL BERITA HIBURAN (TANPA EMBED)
    // ===============================
    const res = await fetch(
      `https://lampost.co/wp-json/wp/v2/posts?categories=${categoryId}&per_page=4&orderby=date&order=desc`
    );
    if (!res.ok) throw new Error('Gagal ambil berita');

    const posts = await res.json();
    let html = '';

    for (const post of posts) {

      /* 📝 JUDUL */
      const judul = post.title.rendered;

      /* 🏷️ KATEGORI SLUG */
      const kategoriSlug = await getCategorySlug(post.categories?.[0]);

      /* 🔗 LINK */
      const link = `halaman.html?${kategoriSlug}/${post.slug}`;

      /* 📅 TANGGAL */
      const tanggal = new Date(post.date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      /* ✍️ EDITOR (DISAMAKAN) */
      const editor = 'Redaksi';

      /* 🖼️ GAMBAR */
      const gambar = await getMedia(post.featured_media);

      html += `
        <a href="${link}" class="item-olahraga">
          <img src="${gambar}" alt="${judul}" class="img-olahraga" loading="lazy">
          <p class="judul">${judul}</p>
          <div class="meta">
            <span class="editor">By ${editor}</span>
            <span class="tanggal">${tanggal}</span>
          </div>
        </a>
      `;
    }

    // ===============================
    // 3️⃣ SISIPKAN KE DOM
    // ===============================
    container.insertAdjacentHTML('beforeend', html);

  } catch (err) {
    console.error(err);
    container.insertAdjacentHTML(
      'beforeend',
      '<p>Gagal memuat berita hiburan</p>'
    );
  }

});
