document.addEventListener('DOMContentLoaded', async () => {

  const container = document.querySelector('.prestasi-lanjutan');
  if (!container) return;

  const TERM_CACHE = {};

  try {
    // ===============================
    // 1️⃣ AMBIL ID KATEGORI NASIONAL
    // ===============================
    const catRes = await fetch(
      'https://lampost.co/wp-json/wp/v2/categories?slug=nasional'
    );
    if (!catRes.ok) throw new Error('Gagal ambil kategori');

    const catData = await catRes.json();
    if (!catData.length) {
      container.insertAdjacentHTML(
        'beforeend',
        '<p>Kategori tidak ditemukan</p>'
      );
      return;
    }

    const categoryId = catData[0].id;
    const kategoriNama = catData[0].name || 'Nasional';
    const kategoriSlug = catData[0].slug || 'nasional';

    // ===============================
    // 2️⃣ AMBIL POST (TANPA _embed)
    // ===============================
    const res = await fetch(
      `https://lampost.co/wp-json/wp/v2/posts?categories=${categoryId}&offset=2&per_page=6&orderby=date&order=desc`
    );
    if (!res.ok) throw new Error('Gagal ambil berita');

    const posts = await res.json();
    if (!posts.length) return;

    const htmlArr = [];

    for (const post of posts) {

      const judul = post.title.rendered;
      const link = `halaman.html?${kategoriSlug}/${post.slug}`;

      // ===============================
      // ✍️ EDITOR (TANPA EMBED)
      // ===============================
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
          } catch (_) {}
        }
      }

      // ===============================
      // 📅 TANGGAL
      // ===============================
      const d = new Date(post.date);
      const tanggal =
        `${String(d.getDate()).padStart(2, '0')}/` +
        `${String(d.getMonth() + 1).padStart(2, '0')}/` +
        `${d.getFullYear()}`;

      // ===============================
      // 📝 DESKRIPSI
      // ===============================
      let deskripsi =
        (post.excerpt?.rendered || '')
          .replace(/<[^>]+>/g, '')
          .trim();

      if (deskripsi.length > 150) {
        deskripsi = deskripsi.slice(0, 150) + '...';
      }

      htmlArr.push(`
        <a href="${link}" class="item-info">
          <div class="berita-unila">
            <p class="judul-unila-lanjutan">${judul}</p>
            <p class="kategori">${kategoriNama}</p>
            <div class="info-microweb">
              <p class="editor-kkn">By ${editor}</p>
              <p class="tanggal">${tanggal}</p>
            </div>
            <p class="deskripsi-unila-lanjutan">${deskripsi}</p>
          </div>
        </a>
      `);
    }

    // ===============================
    // 3️⃣ MASUKKAN KE DOM
    // ===============================
    container.insertAdjacentHTML('beforeend', htmlArr.join(''));

  } catch (err) {
    console.error(err);
    container.insertAdjacentHTML(
      'beforeend',
      '<p>Gagal memuat berita</p>'
    );
  }

});