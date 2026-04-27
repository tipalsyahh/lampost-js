document.addEventListener("DOMContentLoaded", function () {

  const ads = document.querySelectorAll(".iklan-beranda, .iklan-header, .iklan-popup");

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
    const folder = el.dataset.folder;

    // 🔥 WAJIB ADA (biar tidak global)
    if (!slot || !folder) {
      el.style.display = "none";
      return;
    }

    const imgTag = el.querySelector("img");
    if (!imgTag) return;

    const base = "/index/uploads/" + folder + "/" + slot;

    // =========================
    // 🔥 CEK OFF PER SLOT
    // =========================
    try {
      const res = await fetch(base + ".off", { method: "HEAD" });

      if (res.ok) {
        // slot ini saja yang mati
        el.style.display = "none";
        return;
      }

    } catch (e) {
      // kalau error, lanjut normal
    }

    // =========================
    // 🔥 LOAD GAMBAR
    // =========================
    const webp = await testImage(base + ".webp");
    const gif  = await testImage(base + ".gif");

    const finalImg = webp || gif;

    if (!finalImg) {
      el.style.display = "none";
      return;
    }

    imgTag.src = finalImg;

    // =========================
    // 🔥 LOAD LINK
    // =========================
    try {
      const res = await fetch(base + ".txt");
      const link = await res.text();
      el.href = link.trim() || "#";
    } catch {
      el.href = "#";
    }

    // =========================
    // 🔥 POPUP KHUSUS
    // =========================
    if (el.classList.contains("iklan-popup")) {
      const popup = document.getElementById("popup-ads");
      if (popup) popup.style.display = "block";
    }

  });

  // tombol close popup
  const closeBtn = document.getElementById("close-popup");
  if (closeBtn) {
    closeBtn.onclick = function () {
      document.getElementById("popup-ads").style.display = "none";
    };
  }

});