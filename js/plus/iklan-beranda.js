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
    const folder = el.dataset.folder || "iklan-beranda";

    if (!slot) return;

    const imgTag = el.querySelector("img");
    if (!imgTag) return;

    const base = "/index/uploads/" + folder + "/" + slot;

    // =========================
    // 🔥 CEK STATUS IKLAN
    // =========================
    let status = "on";

    try {
      const resStatus = await fetch(base + ".status");
      status = (await resStatus.text()).trim();
    } catch {
      status = "on"; // default tetap aktif kalau file tidak ada
    }

    // jika OFF → sembunyikan langsung
    if (status === "off") {
      el.style.display = "none";
      return;
    }

    // =========================
    // LOAD GAMBAR
    // =========================
    const webp = await testImage(base + ".webp");
    const gif  = await testImage(base + ".gif");

    const finalImg = webp || gif;

    // kalau tidak ada gambar → sembunyikan
    if (!finalImg) {
      el.style.display = "none";
      return;
    }

    imgTag.src = finalImg;

    // =========================
    // AMBIL LINK
    // =========================
    try {
      const res = await fetch(base + ".txt");
      const link = await res.text();
      el.href = link.trim() || "#";
    } catch {
      el.href = "#";
    }

    // =========================
    // 🔥 KHUSUS POPUP
    // =========================
    if (el.classList.contains("iklan-popup")) {
      document.getElementById("popup-ads").style.display = "block";
    }

  });

  // =========================
  // CLOSE POPUP
  // =========================
  const closeBtn = document.getElementById("close-popup");
  if (closeBtn) {
    closeBtn.onclick = function () {
      document.getElementById("popup-ads").style.display = "none";
    };
  }

});