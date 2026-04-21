(function() {
  const version = "1.0";

  document.querySelectorAll('link[rel="stylesheet"]').forEach(el => {
    // skip kalau sudah ada versi
    if (el.href.includes('?v=')) return;

    // skip kalau stylesheet sudah selesai load
    if (el.sheet) return;

    const newHref = el.href.split('?')[0] + '?v=' + version;
    el.href = newHref;
  });
})();