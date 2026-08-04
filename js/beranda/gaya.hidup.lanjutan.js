document.addEventListener('DOMContentLoaded', async () => {

  const container = document.querySelector('.prestasi-lanjutan');
  if (!container) return;

  const TERM_CACHE = {};

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

    const res = await fetch(

      `https://lampost.co/wp-json/wp/v2/posts?` +

      `categories=${categoryId}` +

      `&per_page=6` +

      `&offset=2` +

      `&orderby=date` +

      `&order=desc`

    );

    if (!res.ok) throw new Error();

    const posts = await res.json();
    if (!posts.length) return;

    const htmlArr = [];

    for (const post of posts) {

      const rawJudul = post.title.rendered;
      const judul = rawJudul.length > 50 ? rawJudul.slice(0, 50) + '...' : rawJudul;

      const link = new URL(post.link).pathname;

      const d = new Date(post.date);

      const tanggal =
        `${String(d.getDate()).padStart(2, '0')}/` +
        `${String(d.getMonth() + 1).padStart(2, '0')}/` +
        `${d.getFullYear()}`;

      let editor = 'Redaksi';

      const termLink =
        post._links?.['wp:term']?.[2]?.href;

      if (termLink) {

        if (TERM_CACHE[termLink]) {

          editor =
            TERM_CACHE[termLink];

        } else {

          try {

            const termRes =
              await fetch(termLink);

            if (termRes.ok) {

              const termData =
                await termRes.json();

              editor =
                termData?.[0]?.name ||
                editor;

              TERM_CACHE[termLink] =
                editor;
            }

          } catch { }

        }

      }

      htmlArr.push(`

        <a href="${link}" class="list-berita">

          <div class="konten">

            <p class="judul">
              ${judul}
            </p>

            <p class="meta">
              ${kategoriNama} ${tanggal}
            </p>

          </div>

        </a>

      `);

    }

    container.insertAdjacentHTML(
      'beforeend',
      htmlArr.join('')
    );

  } catch (err) {

    console.error(err);

    container.insertAdjacentHTML(
      'beforeend',
      '<p>Gagal memuat berita</p>'
    );

  }

});
