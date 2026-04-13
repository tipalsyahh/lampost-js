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

  addScript(
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3784200952034602",
    { crossorigin: "anonymous" }
  );

  addScript("https://www.googletagmanager.com/gtag/js?id=G-J2QD4LYXQH");

  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', 'G-J2QD4LYXQH');

  function removeAutoPlacedAds() {

    document.querySelectorAll(".google-auto-placed").forEach(el => {
      el.remove();
    });

    const isiBerita = document.querySelector(".isi-berita");
    if (isiBerita) {
      isiBerita.querySelectorAll(".google-auto-placed").forEach(el => el.remove());
    }

  }

  document.addEventListener("DOMContentLoaded", () => {

    removeAutoPlacedAds();

    const target = document.body;
    if (!target) return;

    const observer = new MutationObserver(() => {
      removeAutoPlacedAds();
    });

    observer.observe(target, {
      childList: true,
      subtree: true
    });

  });

})();