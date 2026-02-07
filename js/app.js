document.addEventListener('DOMContentLoaded', () => {

  // ===============================
  // Helper loader script
  // ===============================
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.defer = true;
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  // ===============================
  // Fade-in Observer global
  // ===============================
  let fadeObserver;

  function initFadeObserver() {
    if (fadeObserver) return;
    fadeObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
  }

  function observeFadeIn(el) {
    if (!fadeObserver) initFadeObserver();
    el.classList.add('fade-in'); // pastikan semua elemen baru punya class fade-in
    fadeObserver.observe(el);
  }

  // Inisialisasi untuk semua elemen statis
  document.querySelectorAll('.fade-in').forEach(el => observeFadeIn(el));

  // ===============================
  // Load API dulu
  // ===============================
  loadScript('js/api.js')
    .then(() => loadBerandaScripts())
    .catch(err => console.error('API gagal dimuat', err));

  // ===============================
  // Load semua beranda scripts
  // ===============================
  function loadBerandaScripts() {

    const scripts = [
      { selector: '.hero-slider', src: 'js/beranda/slider.js' },
      { selector: '.berita-terbaru', src: 'js/beranda/terbaru.js' },
      { selector: '.populer', src: 'js/beranda/populer.js' },
      { selector: '.olahraga', src: 'js/beranda/olahraga.js' },
      { selector: '.ekonomi', src: 'js/beranda/ekonomi.js' },
      { selector: '.teknologi', src: 'js/beranda/teknologi.js' },
      { selector: '.hiburan', src: 'js/beranda/hiburan.js' },
      { selector: '.hukum', src: 'js/beranda/hukum.js' },
      { selector: '.humaniora', src: 'js/beranda/humaniora.js' },
      { selector: '.opini', src: 'js/beranda/opini.js' },
      { selector: '.prestasi-terbaru', src: 'js/beranda/gaya.hidup.utama.js' },
      { selector: '.prestasi-lanjutan', src: 'js/beranda/gaya.hidup.lanjutan.js' },
      { selector: '.tickerText', src: 'js/beranda/treding.js' }
    ];

    scripts.forEach(item => {
      if (document.querySelector(item.selector)) {
        loadScript(item.src)
          .then(() => {
            // ⚡ Trigger animasi fade-in untuk konten yang di-load oleh script
            document.querySelectorAll(item.selector).forEach(el => observeFadeIn(el));
          })
          .catch(() => console.warn(item.src, 'gagal dimuat'));
      }
    });

    // berita bawah → lazy load saat scroll 90% body
    lazyLoadBody('js/beranda/berita.bawah.js');
  }

  // ===============================
  // Lazy load saat scroll BODY
  // ===============================
  function lazyLoadBody(src) {
    let loaded = false;

    function checkScroll() {
      if (loaded) return;

      const scrollY = window.scrollY || window.pageYOffset;
      const vh = window.innerHeight;
      const bodyHeight = document.body.scrollHeight;

      if (scrollY + vh >= bodyHeight * 0.9) {
        loaded = true;
        loadScript(src)
          .then(() => {
            // ⚡ Trigger animasi fade-in untuk berita bawah yang baru dimuat
            const newEls = document.querySelectorAll('.berita-bawah, .fade-in-new');
            newEls.forEach(el => observeFadeIn(el));
          })
          .catch(() => console.warn(src, 'gagal dimuat'));
        window.removeEventListener('scroll', checkScroll);
      }
    }

    window.addEventListener('scroll', checkScroll);
    checkScroll();
  }

});
