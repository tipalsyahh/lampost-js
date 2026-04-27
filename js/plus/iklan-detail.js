document.addEventListener("DOMContentLoaded", function () {

  const ads = document.querySelectorAll(".iklan-detail,.iklan-parallax");

  ads.forEach(async (el) => {

    const slot = el.dataset.slot;
    const folder = el.dataset.folder || "detail-berita";

    if (!slot) return;

    const imgTag = el.querySelector("img");
    if (!imgTag) return;

    const base = "/index/uploads/" + folder + "/" + slot;

    // =========================
    // 🔥 CEK STATUS
    // =========================
    let status = "on";

    try {
      const resStatus = await fetch(base + ".status");
      status = (await resStatus.text()).trim();
    } catch {
      status = "on";
    }

    // 🔥 jika OFF → sembunyikan
    if (status === "off") {
      el.style.display = "none";
      return;
    }

    // =========================
    // 🔥 LOAD WEBP
    // =========================
    imgTag.src = base + ".webp";

    // =========================
    // 🔥 FALLBACK GIF
    // =========================
    imgTag.onerror = function () {
      this.onerror = null;
      this.src = base + ".gif";
    };

    // =========================
    // 🔥 AMBIL LINK
    // =========================
    try {
      const res = await fetch(base + ".txt");
      const link = await res.text();
      el.href = link.trim() || "#";
    } catch {
      el.href = "#";
    }

  });

});