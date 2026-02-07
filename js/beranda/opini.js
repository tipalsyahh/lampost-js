document.addEventListener('DOMContentLoaded', async () => {

  const container = document.querySelector('.opini');
  if (!container) return;

  const catCache = {};

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

  try {
    // ===============================
    // 1️⃣ AMBIL ID KATEGORI OPINI
    // ===============================
    const catRes = await fetch(
      'https://lampost.co/wp-json/wp/v2/categories?slug=opini'
    );
    if (!catRes.ok) throw new Error('Gagal ambil kategori');

    const catData = await catRes.json();
    if (!catData.length) {
      container.insertAdjacentHTML(
        'beforeend',
        '<p>Kategori opini tidak ditemukan</p>'
      );
      return;
    }

    const categoryId = catData[0].id;

    // ===============================
    // 2️⃣ AMBIL BERITA OPINI (TANPA EMBED)
    // ===============================
    const res = await fetch(
      `https://lampost.co/wp-json/wp/v2/posts?categories=${categoryId}&per_page=5&orderby=date&order=desc`
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

      html += `
        <a href="${link}" class="item-hukum">
          <p><i class="bi bi-caret-right-fill"></i></p>
          <p>${judul}</p>
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
      '<p>Gagal memuat berita opini</p>'
    );
  }

});
