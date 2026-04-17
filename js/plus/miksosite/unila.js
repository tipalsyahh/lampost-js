document.addEventListener('DOMContentLoaded', async () => {

  const container = document.querySelector('.data-microsite-unila');
  if (!container) return;

  const PER_PAGE = 2;

  async function loadPosts() {
    try {
      const api =
        'https://lampost.co/microweb/universitaslampung/wp-json/wp/v2/posts' +
        `?per_page=${PER_PAGE}&orderby=date&order=desc&_embed`;

      const res = await fetch(api);
      if (!res.ok) throw new Error('API gagal');

      const posts = await res.json();

      let output = `<ul class="list-judul">`;

      posts.forEach(post => {

        let judul = post.title.rendered
          .replace(/<[^>]+>/g, '') // bersihin tag HTML
          .trim();

        if (judul.length > 150) {
          judul = judul.substring(0, 150) + '...';
        }

        const slug = post.slug;

        const kategoriSlug =
          post._embedded?.['wp:term']?.[0]?.[0]?.slug || 'uin';

        const link = `microweb/berita.unila.html?${kategoriSlug}/${slug}`;

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