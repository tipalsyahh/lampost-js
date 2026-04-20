document.addEventListener('DOMContentLoaded', async () => {

  const container = document.querySelector('.prestasi-lanjutan');
  if (!container) return;

  const TERM_CACHE = {};
  const MEDIA_CACHE = {};

  try {

    const catRes = await fetch('https://lampost.co/wp-json/wp/v2/categories?slug=nasional');
    if (!catRes.ok) throw new Error();

    const catData = await catRes.json();
    if (!catData.length) {
      container.insertAdjacentHTML('beforeend', '<p>Kategori tidak ditemukan</p>');
      return;
    }

    const categoryId = catData[0].id;
    const kategoriNama = catData[0].name || 'Nasional';
    const kategoriSlug = catData[0].slug || 'nasional';

    // 🔥 FIX: ambil lebih banyak data lalu skip 2 pertama
    const res = await fetch(`https://lampost.co/wp-json/wp/v2/posts?categories=${categoryId}&per_page=5&orderby=date&order=desc`);
    if (!res.ok) throw new Error();

    let posts = await res.json();
    if (!posts.length) return;

    // 🔥 mulai dari data ke-3
    posts = posts.slice(2);

    const htmlArr = [];

    for (const post of posts) {

      const judul = post.title.rendered;
      const link = `/${kategoriSlug}/${post.slug}`;

      const d = new Date(post.date);
      const tanggal = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

      let editor = 'Redaksi';
      const termLink = post._links?.['wp:term']?.[2]?.href;

      if (termLink) {
        if (TERM_CACHE[termLink]) {
          editor = TERM_CACHE[termLink];
        } else {
          try {
            const termRes = await fetch(termLink);
            if (termRes.ok) {
              const termData = await termRes.json();
              editor = termData?.[0]?.name || editor;
              TERM_CACHE[termLink] = editor;
            }
          } catch { }
        }
      }

      // ❌ gambar dihapus
      // ❌ deskripsi dihapus

      htmlArr.push(`
      <a href="${link}" class="item-info">
        <div class="berita-unila">
        <p class="judul-unila">${judul}</p>
        <p class="kategori">${kategoriNama}</p>
        <div class="info-microweb">
        <p class="editor-kkn">By ${editor}</p>
        <p class="tanggal" id="tanggal-unila-berita">${tanggal}</p>
        </div>
      </div>
      </a>
      `);

    }

    container.insertAdjacentHTML('beforeend', htmlArr.join(''));

  } catch (err) {
    console.error(err);
    container.insertAdjacentHTML('beforeend', '<p>Gagal memuat berita</p>');
  }

});