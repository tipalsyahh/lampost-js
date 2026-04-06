document.addEventListener('DOMContentLoaded', async () => {

  const wrap = document.querySelector('.lingkar-box');
  if (!wrap) return;

  const cache = {};

  async function getSlug(id) {
    if (!id) return 'berita';
    if (cache[id]) return cache[id];

    const res = await fetch(`https://lampost.co/wp-json/wp/v2/categories/${id}`);
    if (!res.ok) return 'berita';

    const data = await res.json();
    return (cache[id] = data.slug || 'berita');
  }

  try {

    const catRes = await fetch('https://lampost.co/wp-json/wp/v2/categories?slug=lampung');
    if (!catRes.ok) throw new Error('err');

    const catData = await catRes.json();
    if (!catData.length) {
      wrap.innerHTML = `<p>tidak ada kategori</p>`;
      return;
    }

    const catId = catData[0].id;

    const res = await fetch(`https://lampost.co/wp-json/wp/v2/posts?categories=${catId}&per_page=6&orderby=date&order=desc&_embed`);
    if (!res.ok) throw new Error('err');

    const posts = await res.json();

    let list = '';

    for (const post of posts) {

      const title = post.title.rendered;
      const slug = await getSlug(post.categories?.[0]);
      const link = `halaman.html?${slug}/${post.slug}`;

      const img = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';

      const time = new Date(post.date).toLocaleString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });

      list += `
        <a href="${link}" class="lingkar-item">
          <div class="lingkar-text">
            <h4>${title}</h4>
            <span>${time}</span>
          </div>
          <img src="${img}" alt="">
        </a>
      `;
    }

    wrap.innerHTML = `
      <div class="lingkar-wrapper">
        <div class="lingkar-bg"></div>
        <div class="lingkar-panel">
          <h3>Update Lampung Post</h3>
          <div class="lingkar-list">
            ${list}
          </div>
        </div>
      </div>
    `;

  } catch (e) {
    console.error(e);
    wrap.innerHTML = `<p>gagal memuat</p>`;
  }

});
