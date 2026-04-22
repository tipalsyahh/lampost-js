document.addEventListener('DOMContentLoaded', async () => {

  const container = document.querySelector('.data-microsite-gmp');
  if (!container) return;

  const PER_PAGE = 2;

  async function loadPosts() {
    try {
      const api =
        'https://lampost.co/microweb/gmp/wp-json/wp/v2/posts' +
        `?per_page=${PER_PAGE}&orderby=date&order=desc&_embed`;

      const res = await fetch(api);
      if (!res.ok) throw new Error('API gagal');

      const posts = await res.json();

      let output = `<ul class="list-judul">`;

      posts.forEach(post => {

        let judul = post.title.rendered
          .replace(/<[^>]+>/g, '')
          .trim();

        if (judul.length > 150) {
          judul = judul.substring(0, 150) + '...';
        }

        const slug = post.slug;

        const d = new Date(post.date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');

        const BASE = 'https://lampost.co/microweb/gmp';

        const link = `${BASE}/${year}/${month}/${day}/${slug}/`;

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