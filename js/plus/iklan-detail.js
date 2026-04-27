document.addEventListener("DOMContentLoaded", function () {

  const ads = document.querySelectorAll(".iklan-detail");

  ads.forEach((el) => {
    const slot = el.dataset.slot;
    const folder = el.dataset.folder || "detail-berita";

    if (!slot) return;

    const imgTag = el.querySelector("img");
    if (!imgTag) return;

    const base = "/index/uploads/" + folder + "/" + slot;

    // 🔥 langsung load
    imgTag.src = base + ".webp";

    // 🔥 fallback ke gif
    imgTag.onerror = function () {
      this.onerror = null;
      this.src = base + ".gif";
    };

    // 🔥 ambil link
    fetch(base + ".txt")
      .then(res => res.text())
      .then(link => {
        el.href = link.trim() || "#";
      })
      .catch(() => {
        el.href = "#";
      });

  });

});