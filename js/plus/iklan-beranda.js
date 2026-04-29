document.addEventListener("DOMContentLoaded", function () {

  const ads = document.querySelectorAll(".iklan-beranda, .iklan-header, .iklan-popup");

  const cacheBust = () => "?t=" + Date.now();

  const testImage = (url) => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => resolve(null);
      img.src = url + cacheBust(); // 🔥 ANTI CACHE
    });
  };

  ads.forEach(async (el) => {

    const slot = el.dataset.slot;
    const folder = el.dataset.folder || "iklan-beranda";

    if (!slot) return;

    const imgTag = el.querySelector("img");
    if (!imgTag) return;

    const base = "/index/uploads/" + folder + "/" + slot;

    // =========================
    // 🔥 CEK STATUS (ANTI CACHE)
    // =========================
    let status = "on";

    try {
      const resStatus = await fetch(base + ".status" + cacheBust(), {
        cache: "no-store"
      });
      status = (await resStatus.text()).trim();
    } catch {
      status = "on";
    }

    // =========================
    // 🔥 JIKA OFF
    // =========================
    if (status === "off") {

      if (el.classList.contains("iklan-popup")) {
        const parent = el.closest(".popup-overlay");
        if (parent) parent.style.display = "none";
      } else {
        el.style.display = "none";
      }

      return;
    }

    // =========================
    // 🔥 LOAD GAMBAR (ANTI CACHE)
    // =========================
    const webp = await testImage(base + ".webp");
    const gif  = await testImage(base + ".gif");

    const finalImg = webp || gif;

    // =========================
    // 🔥 JIKA GAMBAR TIDAK ADA
    // =========================
    if (!finalImg) {

      if (el.classList.contains("iklan-popup")) {
        const parent = el.closest(".popup-overlay");
        if (parent) parent.style.display = "none";
      } else {
        el.style.display = "none";
      }

      return;
    }

    // 🔥 SET GAMBAR TANPA CACHE
    imgTag.src = finalImg + cacheBust();

    // =========================
    // 🔥 AMBIL LINK (ANTI CACHE)
    // =========================
    try {
      const res = await fetch(base + ".txt" + cacheBust(), {
        cache: "no-store"
      });
      const link = await res.text();
      el.href = link.trim() || "#";
    } catch {
      el.href = "#";
    }

    // =========================
    // 🔥 KHUSUS POPUP → TAMPILKAN
    // =========================
    if (el.classList.contains("iklan-popup")) {
      const parent = el.closest(".popup-overlay");
      if (parent) parent.style.display = "flex";
    }

  });

  // =========================
  // 🔥 CLOSE POPUP
  // =========================
  const closeBtn = document.getElementById("popupClose");

  if (closeBtn) {
    closeBtn.onclick = function () {
      const popup = document.getElementById("popupIklan");
      if (popup) popup.style.display = "none";
    };
  }

});