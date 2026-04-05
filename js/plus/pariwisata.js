document.addEventListener('DOMContentLoaded', async () => {

  const container = document.querySelector('.pariwisata');
  if (!container) return;

  const catCache = {};

  async function getCategoryName(catId) {
    if (!catId) return 'Berita';
    if (catCache[catId]) return catCache[catId];

    const res = await fetch(`https://lampost.co/wp-json/wp/v2/categories/${catId}`);
    if (!res.ok) return 'Berita';

    const data = await res.json();
    return (catCache[catId] = data.name || 'Berita');
  }

  try {
    const catRes = await fetch('https://lampost.co/wp-json/wp/v2/categories?slug=breaking-news');
    if (!catRes.ok) throw new Error();

    const catData = await catRes.json();
    if (!catData.length) {
      container.innerHTML = '<p>Data tidak ditemukan</p>';
      return;
    }

    const categoryId = catData[0].id;

    const res = await fetch(`https://lampost.co/wp-json/wp/v2/posts?categories=${categoryId}&per_page=8&_embed`);
    if (!res.ok) throw new Error();

    const posts = await res.json();
    let html = '';

    for (const post of posts) {

      const judul = post.title.rendered;
      const kategori = await getCategoryName(post.categories?.[0]);
      const slug = post.slug;

      const gambar = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://via.placeholder.com/300x200';

      const link = `halaman.html?${slug}/${post.slug}`;

      html += `
<a href="${link}" class="post-item">
  <div class="post-thumb">
    <img src="${gambar}" alt="">
  </div>
  <div class="post-content">
    <div class="post-category">${kategori}</div>
    <div class="post-title">${judul}</div>
  </div>
</a>
      `;
    }

    container.innerHTML = html;

  } catch (err) {
    container.innerHTML = '<p>Gagal memuat data</p>';
  }

});