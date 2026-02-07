document.addEventListener('DOMContentLoaded', () => {

  const ticker = document.getElementById('tickerText');
  const track = document.querySelector('.ticker-content');
  if (!ticker || !track) return;

  const API =
    'https://lampost.co/wp-json/wp/v2/posts' +
    '?orderby=date&order=desc&per_page=15' +
    '&_fields=title,slug,categories';

  const catCache = {};
  let posts = [];
  let index = 0;

  async function getCategory(catId) {
    if (!catId) return { slug: 'berita' };
    if (catCache[catId]) return catCache[catId];

    const res = await fetch(
      `https://lampost.co/wp-json/wp/v2/categories/${catId}`
    );
    const data = await res.json();

    return (catCache[catId] = { slug: data.slug });
  }

  async function animateNext() {
    if (!posts.length) return;

    const post = posts[index];
    const judul = post.title.rendered;
    const slug = post.slug;

    const { slug: kategoriSlug } =
      await getCategory(post.categories?.[0]);

    ticker.textContent = judul;
    ticker.href = `halaman.html?${kategoriSlug}/${slug}`;

    /* reset posisi (KANAN) */
    ticker.style.transition = 'none';
    ticker.style.transform =
      `translateX(${track.offsetWidth}px)`;

    /* force repaint */
    ticker.offsetHeight;

    /* hitung durasi */
    const speed = 90; // px / detik
    const distance =
      track.offsetWidth + ticker.offsetWidth;
    const duration = distance / speed;

    /* animasi jalan */
    ticker.style.transition =
      `transform ${duration}s linear`;
    ticker.style.transform =
      `translateX(-${ticker.offsetWidth}px)`;

    /* lanjut berita berikutnya */
    setTimeout(() => {
      index = (index + 1) % posts.length;
      animateNext();
    }, duration * 1000 + 300);
  }

  async function init() {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error();

      posts = await res.json();
      if (!posts.length) {
        ticker.textContent = 'Tidak ada berita trending';
        return;
      }

      animateNext();

    } catch (err) {
      console.error(err);
      ticker.textContent = 'Gagal memuat trending';
    }
  }

  init();

});