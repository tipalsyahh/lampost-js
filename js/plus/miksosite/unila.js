document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.data-microsite-unila');
  if (!container) return;

  const PER_PAGE = 2;

  function loadPosts() {

    const target =
      'https://lampost.co/microweb/universitaslampung/wp-json/wp/v2/posts' +
      `?per_page=${PER_PAGE}&orderby=date&order=desc&_embed`;

    const api = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(target);

    fetch(api)
      .then(res => res.ok ? res.json() : [])
      .then(posts => {

        let output = `<ul class="list-judul">`;

        posts.forEach(post => {

          let judul = post.title.rendered.replace(/<[^>]+>/g, '').trim();

          if (judul.length > 150) {
            judul = judul.substring(0, 150) + '...';
          }

          const slug = post.slug;

          const kategoriSlug =
            post._embedded?.['wp:term']?.[0]?.[0]?.slug || 'unila';

          const link = `microweb/berita.unila.html?${kategoriSlug}/${slug}`;

          output += `
            <li class="item-judul">
              <a href="${link}" class="link-judul">${judul}</a>
            </li>
          `;
        });

        output += `</ul>`;

        container.innerHTML = output;

      })
      .catch(() => {
        container.innerHTML = '<p>gagal memuat</p>';
      });
  }

  loadPosts();

});
