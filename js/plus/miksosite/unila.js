document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.data-microsite-unila');
  if (!container) return;

  function loadPosts() {

    fetch('/.netlify/functions/unila')
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
