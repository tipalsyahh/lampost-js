(function() {
  const version = Date.now();

  document.querySelectorAll('link[rel="stylesheet"]').forEach(el => {
    if (!el.href.includes('?v=')) {
      el.href = el.href.split('?')[0] + '?v=' + version;
    }
  });

  // ❌ HAPUS BAGIAN INI
  // document.querySelectorAll('script[src]')
})();