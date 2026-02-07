document.addEventListener('DOMContentLoaded', async () => {

  const container = document.querySelector('.akademik');
  if (!container) return;

  try {
    // ===============================
    // 1️⃣ AMBIL ID KATEGORI AKADEMIK
    // ===============================
    const catRes = await fetch(
      'https://lampost.co/microweb/stiab/wp-json/wp/v2/categories?slug=akademik'
    );
    if (!catRes.ok) throw new Error('Gagal ambil kategori');

    const catData = await catRes.json();
    if (!catData.length) {
      container.insertAdjacentHTML(
        'beforeend',
        '<p>Kategori tidak ditemukan</p>'
      );
      return;
    }

    const categoryId = catData[0].id;

    // ===============================
    // 2️⃣ AMBIL BERITA AKADEMIK
    // ===============================
    const res = await fetch(
      `https://lampost.co/microweb/stiab/wp-json/wp/v2/posts?categories=${categoryId}&per_page=5&orderby=date&order=desc&_embed`
    );
    if (!res.ok) throw new Error('Gagal ambil berita');

    const posts = await res.json();

    let html = '';

    // 🔥 MULAI DARI DATA KE-2
    posts.slice(1).forEach(post => {

      /* 📝 JUDUL */
      const judul = post.title.rendered;

      /* 🏷️ KATEGORI SLUG */
      const kategoriSlug =
        post._embedded?.['wp:term']?.[0]?.[0]?.slug || 'berita';

      /* 🔗 LINK */
      const link = `berita.stiab.html?${kategoriSlug}/${post.slug}`;

      html += `
        <a href="${link}" class="item-hukum">
          <p><i class="bi bi-caret-right-fill"></i></p>
          <p>${judul}</p>
        </a>
      `;
    });

    // ===============================
    // 3️⃣ SISIPKAN KE DOM
    // ===============================
    container.insertAdjacentHTML('beforeend', html);

  } catch (err) {
    console.error(err);
    container.insertAdjacentHTML(
      'beforeend',
      '<p>Gagal memuat berita akademik</p>'
    );
  }

});
