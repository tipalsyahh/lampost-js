(async function () {

  const params = new URLSearchParams(window.location.search);
  const postId = params.get('p');

  if (!postId) {
    document.body.innerHTML = 'ID tidak ditemukan';
    return;
  }

  try {

    const res = await fetch(`https://lampost.co/wp-json/wp/v2/posts/${postId}?_embed&preview=true`);
    const post = await res.json();

    console.log('🔥 PREVIEW DATA:', post);

    if (!post || !post.id) {
      document.body.innerHTML = 'Berita tidak ditemukan';
      return;
    }

    // =====================================
    // 🔥 TITLE DINAMIS
    // =====================================
    const cleanTitle = post.title?.rendered?.replace(/<[^>]*>?/gm, '') || '';
    document.title = 'Preview - ' + (cleanTitle || post.slug || post.id);

    // =====================================
    // 🔥 RENDER KE HTML
    // =====================================

    // JUDUL
    const judul = document.querySelector('.judul-berita');
    if (judul) judul.innerHTML = post.title.rendered;

    // ISI BERITA
    const isi = document.querySelector('.isi-berita');
    if (isi) isi.innerHTML = post.content.rendered || post.content.raw || '';

    // GAMBAR
    const img = document.querySelector('.gambar-berita');
    if (img) {
      if (post._embedded?.['wp:featuredmedia']?.[0]) {
        img.src = post._embedded['wp:featuredmedia'][0].source_url;
        img.style.display = 'block';
      } else {
        img.style.display = 'none';
      }
    }

    // =====================================
    // 🔥 TANGGAL & JAM
    // =====================================
    const date = new Date(post.date);

    const tanggal = document.getElementById('tanggal');
    const jam = document.getElementById('jam');

    if (tanggal) {
      tanggal.textContent = date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }

    if (jam) {
      jam.textContent = date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // =====================================
    // 🔥 EDITOR
    // =====================================
    const editor = document.getElementById('editor');
    if (editor) {
      editor.textContent = post._embedded?.author?.[0]?.name || 'Lampost';
    }

    // =====================================
    // 🔥 SHARE (OPSIONAL)
    // =====================================
    const url = window.location.href;

    const fb = document.getElementById('fbShare');
    const wa = document.getElementById('waShare');
    const tg = document.getElementById('tgShare');
    const x = document.getElementById('xShare');

    if (fb) fb.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    if (wa) wa.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(cleanTitle + ' ' + url)}`;
    if (tg) tg.href = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(cleanTitle)}`;
    if (x) x.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(cleanTitle)}&url=${encodeURIComponent(url)}`;

    // COPY LINK
    const copyBtn = document.getElementById('copyLink');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(url);
        alert('Link disalin!');
      });
    }

  } catch (err) {

    console.error(err);
    document.body.innerHTML = 'Gagal memuat preview';

  }

})();