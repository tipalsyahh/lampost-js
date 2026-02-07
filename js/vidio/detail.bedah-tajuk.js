document.addEventListener('DOMContentLoaded', async () => {

  const berita = document.getElementById('berita');
  if (!berita) return;

  const query = window.location.search.substring(1);
  const [kategoriSlug, slug] = query.split('/');

  if (!slug) {
    berita.innerHTML = '<p>Berita tidak ditemukan</p>';
    return;
  }

  try {
    const res = await fetch(
      `https://lampost.co/wp-json/wp/v2/posts?slug=${slug}&_embed`
    );
    if (!res.ok) throw new Error('Gagal ambil berita');

    const posts = await res.json();
    if (!posts.length) throw new Error('Berita tidak ada');

    const post = posts[0];

    /* =========================
       JUDUL
    ========================= */
    document.querySelector('.judul-berita').innerHTML =
      post.title.rendered;

    /* =========================
       EDITOR (SAMA DENGAN HOME)
    ========================= */
    const editor =
      post._embedded?.['wp:term']?.[2]?.[0]?.name ||
      post._embedded?.author?.[0]?.name ||
      'Redaksi';

    document.getElementById('editor').innerText = editor;

    /* =========================
       TANGGAL
    ========================= */
    document.getElementById('tanggal').innerText =
      new Date(post.date).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

    /* =========================
       KATEGORI
    ========================= */
    const kategoriEl = document.getElementById('kategori');
    if (kategoriEl) {
      kategoriEl.innerText =
        post._embedded?.['wp:term']?.[0]?.[0]?.name ||
        kategoriSlug ||
        'Berita';
    }

    /* =========================
       KONTEN
    ========================= */
    const isi = document.querySelector('.isi-berita');
    isi.innerHTML = post.content.rendered || '';

    /* =========================
       VIDEO YOUTUBE (MANUAL MAP)
    ========================= */
    const videoIdMap = {
      'kpk-endus-aroma-korupsi-ada-bau-busuk-kuota-haji': 'HOterxKOtXE',
      'menteri-purbaya-masih-pakai-gaya-koboi-bagaimana-respon-prabowo': 'm5nnBanrkYo',
      'ruu-tni-kebangkitan-dwifungsi-abri-ancaman-demokrasi': 'vBwNCV0nS_4',
      'politik-nasi-goreng-jalan-konsolidasi-prabowo-megawati': 'AxsUHgzTWes',
      'ada-apa-dibalik-vonis-ringan-kasus-korupsi-timah': 'qxbIf6r6U84',
      'prabowo-wacanakan-akan-maafkan-koruptor-asal-uang-negara-kembali-apa-rakyat-indonesia-setuju': 'nMlvqLRkzjo',
      'hari-santri-nasional-i-kemandirian-pesantren-menuju-indonesia-maju-bedah-tajuk-lampung-post': 'yJ9-aAqINKU'
    };

    const videoId = videoIdMap[slug];

    if (videoId && videoId.length === 11) {

      const thumbDiv = document.createElement('div');
      thumbDiv.className = 'yt-thumbnail';
      thumbDiv.style.cssText = `
        background-image:url('https://i.ytimg.com/vi/${videoId}/hqdefault.jpg');
        width:100%;
        padding-top:56.25%;
        background-size:cover;
        background-position:center;
        position:relative;
        cursor:pointer;
        margin-bottom:1rem;
      `;

      const playIcon = document.createElement('div');
      playIcon.innerText = '▶';
      playIcon.style.cssText = `
        position:absolute;
        top:50%;
        left:50%;
        transform:translate(-50%,-50%);
        font-size:64px;
        color:white;
        text-shadow:0 0 10px rgba(0,0,0,.8);
      `;

      thumbDiv.appendChild(playIcon);

      thumbDiv.addEventListener('click', () => {
        thumbDiv.outerHTML = `
          <iframe
            width="100%"
            height="400"
            src="https://www.youtube.com/embed/${videoId}?autoplay=1"
            frameborder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        `;
      });

      isi.prepend(thumbDiv);
    }

    /* =========================
       RESPONSIVE IMAGE
    ========================= */
    isi.querySelectorAll('img').forEach(img => {
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
    });

  } catch (err) {
    console.error(err);
    berita.innerHTML = '<p>Gagal memuat berita</p>';
  }
});
