document.addEventListener("DOMContentLoaded", function () {

  const ads = document.querySelectorAll(".iklan-parallax");

  ads.forEach(async (el) => {

    const slot = el.dataset.slot;
    const folder = el.dataset.folder || "detail-berita";

    if (!slot) return;

    const bg = el.querySelector(".parallax-bg");
    if (!bg) return;

    const base = "/index/uploads/" + folder + "/" + slot;

    // =========================
    // 🔥 CEK STATUS
    // =========================
    let status = "on";

    try {
      const res = await fetch(base + ".status?t=" + Date.now(), { cache: "no-store" });
      status = (await res.text()).trim();
    } catch {
      status = "on";
    }

    // OFF → sembunyikan seluruh iklan
    if (status === "off") {
      el.style.display = "none";
      return;
    }

    // =========================
    // 🔥 LOAD GAMBAR
    // =========================
    const testImage = (url) => {
      return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => resolve(null);
        img.src = url;
      });
    };

    const webp = await testImage(base + ".webp");
    const gif  = await testImage(base + ".gif");

    const finalImg = webp || gif;

    if (!finalImg) {
      el.style.display = "none";
      return;
    }

    bg.style.backgroundImage = "url(" + finalImg + ")";

    // =========================
    // 🔥 AMBIL LINK
    // =========================
    try {
      const res = await fetch(base + ".txt?t=" + Date.now(), { cache: "no-store" });
      const link = await res.text();
      el.href = link.trim() || "#";
    } catch {
      el.href = "#";
    }

  });

  // =========================
  // 🔥 PARALLAX EFFECT
  // =========================
  window.addEventListener("scroll", function () {

    document.querySelectorAll(".iklan-parallax").forEach((el) => {

      const bg = el.querySelector(".parallax-bg");
      if (!bg) return;

      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.top < windowHeight && rect.bottom > 0) {

        let speed = 0.3;
        let move = rect.top * speed;

        bg.style.transform = "translateY(" + move + "px)";
      }

    });

  });

});