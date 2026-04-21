(function() {
  const version = "1.0"; // ganti manual kalau update

  document.querySelectorAll('link[rel="stylesheet"]').forEach(el => {
    if (!el.href.includes('?v=')) {
      el.href = el.href.split('?')[0] + '?v=' + version;
    }
  });
})();