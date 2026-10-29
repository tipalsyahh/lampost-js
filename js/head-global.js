(function () {

  if (window.__HEAD_GLOBAL_LOADED__) return;
  window.__HEAD_GLOBAL_LOADED__ = true;

  // 1. Blokir Skrip MGID Otomatis (Mencegah pemuatan dari widgets.mgid.com)
  const observerMGID = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.tagName === 'SCRIPT' && node.src && node.src.includes('widgets.mgid.com')) {
          node.remove(); // Langsung hapus tag script MGID sebelum sempat dieksekusi
        }
      });
    });
  });

  observerMGID.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  const addScript = (src, attrs = {}) => {
    // Abaikan jika ada skrip yang mencoba memanggil MGID
    if (src.includes('widgets.mgid.com')) return;
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

  // Matikan Auto Ads Google yang agresif
  window.adsbygoogle = window.adsbygoogle || [];
  window.adsbygoogle.push({
    google_ad_client: "ca-pub-3784200952034602",
    enable_page_level_ads: false
  });

  // Load Google AdSense
  addScript(
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3784200952034602",
    { crossorigin: "anonymous" }
  );

  // Google Analytics / GTAG
  addScript("https://www.googletagmanager.com/gtag/js?id=G-J2QD4LYXQH");

  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', 'G-J2QD4LYXQH');

  // 2. Pembersihan Wadah/Container Iklan MGID & Auto Ads
  function cleanBlockedAds() {
    // Hapus wadah/container iklan MGID jika ada di HTML
    document.querySelectorAll('[id*="mgid"], [class*="mgid"], div[data-mgid]').forEach(el => {
      el.remove();
    });

    // Hapus iklan otomatis Google yang melayang
    document.querySelectorAll(".google-auto-placed, ins.adsbygoogle-noablate, .adsbygoogle-spacer").forEach(el => {
      el.remove();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    cleanBlockedAds();

    let timeout;
    const observer = new MutationObserver(() => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        cleanBlockedAds();
      }, 300);
    });

    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  });

})();
