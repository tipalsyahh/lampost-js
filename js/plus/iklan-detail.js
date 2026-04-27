document.addEventListener("DOMContentLoaded", function () {

  const ads = document.querySelectorAll(".iklan-detail");

  const testImage = (url) => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  ads.forEach(async (el) => {
    const slot = el.dataset.slot;
    const folder = el.dataset.folder || "detail-berita";

    if (!slot) return;

    const imgTag = el.querySelector("img");
    if (!imgTag) return;

    const base = "/index/uploads/" + folder + "/" + slot;

    const webp = await testImage(base + ".webp");
    const gif  = await testImage(base + ".gif");

    const finalImg = webp || gif;

    if (!finalImg) {
      el.style.display = "none";
      return;
    }

    imgTag.src = finalImg;

    try {
      const res = await fetch(base + ".txt");
      const link = await res.text();
      el.href = link.trim() || "#";
    } catch {
      el.href = "#";
    }

  });

});