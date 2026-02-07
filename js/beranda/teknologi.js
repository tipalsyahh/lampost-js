document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.teknologi');
  if (!container) return;

  function render(posts) {
    return posts.map(post => {

      const judul = post.title.rendered;

      const kategoriSlug =
        post._embedded?.['wp:term']?.[0]?.[0]?.slug || 'berita';

      const link = `halaman.html?${kategoriSlug}/${post.slug}`;

      return `
        <a href="${link}" class="item-hukum">
          <p><i class="bi bi-caret-right-fill"></i></p>
          <p>${judul}</p>
        </a>
      `;
    }).join('');
  }

  // 🔥 non-blocking fetch
  fetch('https://lampost.co/wp-json/wp/v2/categories?slug=teknologi')
    .then(res => {
      if (!res.ok) throw new Error('Gagal ambil kategori');
      return res.json();
    })
    .then(catData => {
      if (!catData.length) {
        container.insertAdjacentHTML(
          'beforeend',
          '<p>Kategori teknologi tidak ditemukan</p>'
        );
        return Promise.reject();
      }

      const categoryId = catData[0].id;

      return fetch(
        `https://lampost.co/wp-json/wp/v2/posts?categories=${categoryId}&per_page=5&orderby=date&order=desc&_embed`
      );
    })
    .then(res => {
      if (!res || !res.ok) throw new Error('Gagal ambil berita');
      return res.json();
    })
    .then(posts => {
      if (!posts || !posts.length) return;
      container.insertAdjacentHTML('beforeend', render(posts));
    })
    .catch(err => {
      if (err) {
        console.error(err);
        container.insertAdjacentHTML(
          'beforeend',
          '<p>Gagal memuat berita teknologi</p>'
        );
      }
    });

});