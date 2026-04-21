document.addEventListener('DOMContentLoaded', async () => {

  const container = document.querySelector('.data-microsite-bandarlampung');
  if (!container) return;

  const PER_PAGE = 2;

  async function loadPosts() {
    try {
      const base = 'https://lampost.co/wp-json/wp/v2';

      const catRes = await fetch(`${base}/categories?slug=bandar-lampung`);
      if (!catRes.ok) throw new Error('Gagal ambil kategori');

      const catData = await catRes.json();
      if (!catData.length) throw new Error('Kategori tidak ditemukan');

      const categoryId = catData[0].id;

      const postRes = await fetch(
        `${base}/posts?categories=${categoryId}&per_page=${PER_PAGE}&orderby=date&order=desc&_embed`
      );

      if (!postRes.ok) throw new Error('API gagal');

      const posts = await postRes.json();

      let output = `<ul class="list-judul">`;

      for (const post of posts) {

        let judul = post.title.rendered
          .replace(/<[^>]+>/g, '')
          .trim();

        if (judul.length > 150) {
          judul = judul.substring(0, 150);
          judul = judul.substring(0, judul.lastIndexOf(' ')) + '...';
        }

        const slug = post.slug;

        let parentSlug = '';
        let childSlug = '';

        const terms = post._embedded?.['wp:term']?.[0];

        if (terms && terms.length) {
          const cat = terms[0];
          childSlug = cat.slug;

          if (cat.parent && cat.parent !== 0) {
            try {
              const parentRes = await fetch(`${base}/categories/${cat.parent}`);
              if (parentRes.ok) {
                const parent = await parentRes.json();
                parentSlug = parent.slug;
              }
            } catch {}
          }
        }

        let link = '/';

        if (parentSlug) link += parentSlug + '/';
        if (childSlug) link += childSlug + '/';

        link += slug;

        output += `
          <li class="item-judul">
            <a href="${link}" class="link-judul">${judul}</a>
          </li>
        `;
      }

      output += `</ul>`;

      container.innerHTML = output;

    } catch (err) {
      console.error(err);
    }
  }

  loadPosts();

});