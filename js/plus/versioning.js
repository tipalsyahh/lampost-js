(function() {
  const version = Date.now();

  document.querySelectorAll('link[rel="stylesheet"]').forEach(el => {
    if (!el.href.includes('?v=')) {
      el.href = el.href.split('?')[0] + '?v=' + version;
    }
  });

  document.querySelectorAll('script[src]').forEach(el => {
    if (!el.src.includes('?v=')) {
      el.src = el.src.split('?')[0] + '?v=' + version;
    }
  });
})();