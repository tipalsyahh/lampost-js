document.addEventListener('DOMContentLoaded', async () => {

  const container = document.querySelector('.card-berita');
  const detailBox = document.querySelector('.card-detail');

  if (!container || !detailBox) return;

  const detailImage = detailBox.querySelector('.detail-image');
  const detailTitle = detailBox.querySelector('.detail-title');
  const detailContent = detailBox.querySelector('.detail-content');
  const detailAction = detailBox.querySelector('.detail-action');

  try {
    const catRes = await fetch(
      'https://lampost.co/epaper/wp-json/wp/v2/categories?slug=e-paper'
    );
    if (!catRes.ok) throw new Error('API ditolak');

    const catData = await catRes.json();
    if (!catData.length) throw new Error('Kategori kosong');

    const categoryId = catData[0].id;

    const res = await fetch(
      `https://lampost.co/epaper/wp-json/wp/v2/posts?categories=${categoryId}&per_page=3&_embed`
    );
    if (!res.ok) throw new Error('Post gagal');

    const posts = await res.json();
    if (!posts.length) throw new Error('Post kosong');

    renderFromAPI(posts);
    return;

  } catch (err) {
    console.warn('API epaper gagal, fallback ke RSS');
  }

  try {
    const rssRes = await fetch('https://lampost.co/epaper/feed/');
    if (!rssRes.ok) throw new Error('RSS gagal');

    const rssText = await rssRes.text();
    const xml = new DOMParser().parseFromString(rssText, 'text/xml');
    const items = [...xml.querySelectorAll('item')].slice(0, 3);

    if (!items.length) throw new Error('RSS kosong');

    renderFromRSS(items);

  } catch (err) {
    console.error('RSS juga gagal');

    container.innerHTML =
      '<p style="opacity:.7">E-paper tidak dapat dimuat saat ini</p>';
  }

  function renderFromAPI(posts) {
    container.innerHTML = posts.map(post => {
      const img =
        post._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
        'image/default.jpg';

      const text = post.excerpt?.rendered
        ?.replace(/<[^>]*>/g, '')
        ?.trim() || '';

      const kategoriSlug =
        post._embedded?.['wp:term']?.[0]?.[0]?.slug || 'berita';

      return `
        <div class="card"
          data-kategori="${kategoriSlug}"
          data-slug="${post.slug}"
          data-title="${post.title.rendered}"
          data-content="${text}"
          data-image="${img}">
          <img src="${img}" loading="lazy">
          <p>${post.title.rendered}</p>
        </div>
      `;
    }).join('');

    initDetail(posts.map(p => ({
      kategori: p._embedded?.['wp:term']?.[0]?.[0]?.slug || 'berita',
      slug: p.slug,
      title: p.title.rendered,
      content: p.excerpt?.rendered?.replace(/<[^>]*>/g, '') || '',
      image: p._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'image/default.jpg'
    })));
  }

  function renderFromRSS(items) {
    const posts = items.map(item => {
      const title = item.querySelector('title')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '#';
      const desc = item.querySelector('description')?.textContent || '';

      const imgMatch = desc.match(/<img[^>]+src="([^">]+)"/);
      const image = imgMatch ? imgMatch[1] : 'image/default.jpg';

      const content = desc.replace(/<[^>]*>/g, '').trim();

      return { title, link, image, content };
    });

    container.innerHTML = posts.map((p, i) => `
      <div class="card"
        data-index="${i}"
        data-title="${p.title}"
        data-content="${p.content}"
        data-image="${p.image}"
        data-link="${p.link}">
        <img src="${p.image}" loading="lazy">
        <p>${p.title}</p>
      </div>
    `).join('');

    initDetail(posts, true);
  }

  function initDetail(posts, isRSS = false) {
    const random = posts[Math.floor(Math.random() * posts.length)];

    detailImage.innerHTML = `<img src="${random.image}">`;
    detailTitle.textContent = random.title;
    detailContent.textContent = random.content;

    detailAction.innerHTML = `
      <a href="${isRSS ? random.link : `koran.html?${random.kategori}/${random.slug}`}"
         class="detail-btn">
        Baca Selengkapnya
      </a>
    `;

    container.addEventListener('click', e => {
      const card = e.target.closest('.card');
      if (!card) return;

      detailImage.innerHTML = `<img src="${card.dataset.image}">`;
      detailTitle.textContent = card.dataset.title;
      detailContent.textContent = card.dataset.content;

      detailAction.innerHTML = `
        <a href="${
          isRSS
            ? card.dataset.link
            : `koran.html?${card.dataset.kategori}/${card.dataset.slug}`
        }" class="detail-btn">
          Baca Selengkapnya
        </a>
      `;
    });
  }

});
