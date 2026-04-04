document.addEventListener('DOMContentLoaded', async () => {

  const container = document.querySelector('.data-microsite-bandarlampung');
  if (!container) return;

  const PER_PAGE = 2;

  async function loadPosts() {
    try {
      const base = 'https://lampost.co/wp-json/wp/v2';

      // 1. ambil kategori ID dari slug
      const catRes = await fetch(`${base}/categories?slug=bandar-lampung`);
      if (!catRes.ok) throw new Error('Gagal ambil kategori');

      const catData = await catRes.json();
      if (!catData.length) throw new Error('Kategori tidak ditemukan');

      const categoryId = catData[0].id;

      // 2. ambil post berdasarkan kategori
      const postRes = await fetch(
        `${base}/posts?categories=${categoryId}&per_page=${PER_PAGE}&orderby=date&order=desc&_embed`
      );

      if (!postRes.ok) throw new Error('API gagal');

      const posts = await postRes.json();

      let output = `<ul class="list-judul">`;

      posts.forEach(post => {

        let judul = post.title.rendered
          .replace(/<[^>]+>/g, '')
          .trim();

        if (judul.length > 150) {
          judul = judul.substring(0, 150);
          judul = judul.substring(0, judul.lastIndexOf(' ')) + '...';
        }

        const slug = post.slug;

        const link = `halaman.html?bandar-lampung/${slug}`;

        output += `
          <li class="item-judul">
            <a href="${link}" class="link-judul">${judul}</a>
          </li>
        `;
      });

      output += `</ul>`;

      container.innerHTML = output;

    } catch (err) {
      console.error(err);
    }
  }

  loadPosts();

});