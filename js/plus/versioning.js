(async function () {
  if (sessionStorage.getItem("css-cleaned")) return;
  sessionStorage.setItem("css-cleaned", "1");

  const version = "1.0";

  // hanya update jika belum ada versi (tanpa ganggu yang sudah load)
  document.querySelectorAll('link[rel="stylesheet"]').forEach(el => {
    if (!el.href.includes('?v=')) {
      el.href = el.href.split('?')[0] + '?v=' + version;
    }
  });

  if ('caches' in window) {
    const keys = await caches.keys();
    for (const key of keys) {
      await caches.delete(key);
    }
  }

  location.reload();
})();