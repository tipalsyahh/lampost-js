(function () {

  if (window.__HEAD_GLOBAL_LOADED__) return;
  window.__HEAD_GLOBAL_LOADED__ = true;

  const addScript = (src, attrs = {}) => {
    if (document.querySelector(`script[src="${src}"]`)) return;

    const s = document.createElement('script');
    s.src = src;
    s.async = true;

    Object.keys(attrs).forEach(key => {
      s.setAttribute(key, attrs[key]);
    });

    document.head.appendChild(s);
  };

  const addMeta = (name, content) => {
    if (document.querySelector(`meta[name="${name}"]`)) return;

    const m = document.createElement('meta');
    m.name = name;
    m.content = content;
    document.head.appendChild(m);
  };

  addMeta("google-site-verification", "zlGM7NLYfk1kMXT-LlZ7VJX4voGpl-XrS8-7403l2yA");

  // 1. Matikan Auto Ads Otomatis via JS Config sebelum skrip AdSense dimuat
  window.adsbygoogle = window.adsbygoogle || [];
  window.adsbygoogle.push({
    google_ad_client: "ca-pub-3784200952034602",
    enable_page_level_ads: false // Mematikan Auto Ads (iklan melayang/agresif)
  });

  // 2. Muat Skrip AdSense
  addScript(
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3784200952034602",
    { crossorigin: "anonymous" }
  );

  // 3. Google Analytics / GTAG
  addScript("https://www.googletagmanager.com/gtag/js?id=G-J2QD4LYXQH");

  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', 'G-J2QD4LYXQH');

  // 4. Pembersihan Iklan Otomatis yang Terpasang Dinamis
  function removeAutoPlacedAds() {
    // Hapus iklan otomatis melayang / anchor / vignette
    document.querySelectorAll(".google-auto-placed, ins.adsbygoogle-noablate, .adsbygoogle-spacer").forEach(el => {
      el.remove();
    });

    // Menghapus dari area berita agar tidak merusak tata letak
    const isiBerita = document.querySelector(".isi-berita");
    if (isiBerita) {
      isiBerita.querySelectorAll(".google-auto-placed").forEach(el => el.remove());
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    removeAutoPlacedAds();

    // Gunakan MutationObserver yang dibatasi agar tidak memberatkan browser
    const target = document.body;
    if (!target) return;

    let timeout;
    const observer = new MutationObserver(() => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        removeAutoPlacedAds();
      }, 300); // Debounce 300ms agar JS tidak bekerja terlalu agresif/berulang-ulang
    });

    observer.observe(target, {
      childList: true,
      subtree: true
    });
  });

})();
