document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.ekonomi');
  if (!container) return;

  const PER_PAGE = 5;

  const API_BASE =
    'https://lampost.co/wp-json/wp/v2/posts?orderby=date&order=desc';

  const catCache = {};
  const mediaCache = {};
  const termCache = {};

  const FALLBACK_IMG = 'https://lampost.co/image/ai.jpeg';

  /* ===============================
     FORMAT TANGGAL
  =============================== */
  const formatTanggal = dateString =>
    new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

  /* ===============================
     AMBIL KATEGORI
  =============================== */
  async function getCategory(catId) {
    if (!catId) return { name: 'Berita', slug: 'berita' };
    if (catCache[catId]) return catCache[catId];

    const res = await fetch(
      `https://lampost.co/wp-json/wp/v2/categories/${catId}`
    );
    const data = await res.json();

    return (catCache[catId] = {
      name: data.name,
      slug: data.slug
    });
  }

  /* ===============================
     🔥 AMBIL GAMBAR HD
  =============================== */
  async function getMedia(mediaId) {
    if (!mediaId) return FALLBACK_IMG;
    if (mediaCache[mediaId]) return mediaCache[mediaId];

    try {
      const res = await fetch(
        `https://lampost.co/wp-json/wp/v2/media/${mediaId}`
      );

      if (res.ok) {
        const data = await res.json();

        // 🔥 PRIORITAS HD
        mediaCache[mediaId] =
          data?.media_details?.sizes?.full?.source_url ||   // paling HD
          data?.media_details?.sizes?.large?.source_url ||
          data?.media_details?.sizes?.medium_large?.source_url ||
          data?.source_url ||
          FALLBACK_IMG;
      }

    } catch (_) {}

    return mediaCache[mediaId] || FALLBACK_IMG;
  }

  /* ===============================
     AMBIL EDITOR
  =============================== */
  async function getEditor(post) {
    let editor = 'Redaksi';
    const termLink = post._links?.['wp:term']?.[2]?.href;
    if (!termLink) return editor;

    if (termCache[termLink]) return termCache[termLink];

    try {
      const res = await fetch(termLink);
      if (res.ok) {
        const data = await res.json();
        editor = data?.[0]?.name || editor;
        termCache[termLink] = editor;
      }
    } catch (_) {}

    return editor;
  }

  /* ===============================
     RENDER CEPAT
  =============================== */
  function renderFast(post) {
    const judul = post.title.rendered;
    const tanggal = formatTanggal(post.date);
    const id = `ekonomi-${post.id}`;

    const deskripsi =
      post.excerpt?.rendered
        ?.replace(/(<([^>]+)>)/gi, '')
        ?.slice(0, 120) + '...';

    return `
      <a href="#" class="item-info" id="${id}">
        <img src="${FALLBACK_IMG}" alt="${judul}" class="img-microweb-terbaru" loading="lazy">
        <div class="berita-detail">
          <p class="judul-ekonomi">${judul}</p>
          <p class="kategori">...</p>
          <div class="info-microweb">
            <p class="editor">Oleh ...</p>
            <p class="tanggal">${tanggal}</p>
          </div>
          <p class="deskripsi">${deskripsi}</p>
        </div>
      </a>
    `;
  }

  /* ===============================
     LENGKAPI DATA
  =============================== */
  async function enrich(post) {
    const el = document.getElementById(`ekonomi-${post.id}`);
    if (!el) return;

    const { name: kategori, slug } =
      await getCategory(post.categories?.[0]);

    const editor = await getEditor(post);
    const gambar = await getMedia(post.featured_media);

    const imgEl = el.querySelector('img');

    // 🔥 optimasi
    imgEl.setAttribute('decoding', 'async');

    // 🔥 fallback kalau error
    imgEl.onerror = () => {
      imgEl.src = FALLBACK_IMG;
    };

    imgEl.src = gambar;

    el.href = `/${slug}/${post.slug}`;
    el.querySelector('.kategori').textContent = kategori;
    el.querySelector('.editor').textContent = `Oleh ${editor}`;
  }

  /* ===============================
     INIT
  =============================== */
  async function init() {
    try {
      const catRes = await fetch(
        'https://lampost.co/wp-json/wp/v2/categories?slug=ekonomi-dan-bisnis'
      );

      const catData = await catRes.json();

      if (!catData[0]) {
        container.innerHTML = 'Kategori tidak ditemukan';
        return;
      }

      const ekonomiID = catData[0].id;

      const res = await fetch(
        `${API_BASE}&categories=${ekonomiID}&per_page=${PER_PAGE}`
      );

      if (!res.ok) throw new Error();

      const posts = await res.json();
      if (!posts.length) return;

      container.innerHTML = posts.map(renderFast).join('');

      posts.forEach(post => enrich(post));

    } catch (err) {
      console.error(err);
      container.innerHTML = 'Gagal memuat berita';
    }
  }

  init();

});