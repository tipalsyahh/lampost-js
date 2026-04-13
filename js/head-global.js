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

  function fixGoogleAutoAds() {

    const footer = document.querySelector("footer");
    if (!footer) return;

    const selectors = [
      ".goog-rentries",
      ".goog-rentry",
      ".google-anno-skip"
    ];

    document.querySelectorAll(selectors.join(",")).forEach(el => {

      if (!footer.contains(el)) {
        footer.parentNode.insertBefore(el, footer);
      }

    });

  }

  document.addEventListener("DOMContentLoaded", fixGoogleAutoAds);

  const observer = new MutationObserver(() => {
    fixGoogleAutoAds();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

})();