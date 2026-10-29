(function () {

  if (window.__HEAD_GLOBAL_LOADED__) return;
  window.__HEAD_GLOBAL_LOADED__ = true;

  const isBlocked = (url) => {
    if (!url) return false;
    return url.includes('widgets.mgid.com') || url.includes('submitform.online');
  };

  const observerBlockedScripts = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.tagName === 'SCRIPT' && node.src && isBlocked(node.src)) {
          node.remove();
        }
      });
    });
  });

  observerBlockedScripts.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  const addScript = (src, attrs = {}) => {
    if (isBlocked(src)) return;
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

  window.adsbygoogle = window.adsbygoogle || [];
  window.adsbygoogle.push({
    google_ad_client: "ca-pub-3784200952034602",
    enable_page_level_ads: false
  });

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

  function cleanBlockedAds() {
    document.querySelectorAll('[id*="mgid"], [class*="mgid"], div[data-mgid], iframe[src*="submitform.online"], a[href*="submitform.online"]').forEach(el => {
      el.remove();
    });

    document.querySelectorAll(".google-auto-placed, ins.adsbygoogle-noablate, .adsbygoogle-spacer").forEach(el => {
      el.remove();
    });

    const isiBerita = document.querySelector(".isi-berita");
    if (isiBerita) {
      isiBerita.querySelectorAll(".google-auto-placed").forEach(el => el.remove());
    }
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
