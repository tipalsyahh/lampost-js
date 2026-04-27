document.addEventListener("DOMContentLoaded", function () {

  const ads = document.querySelectorAll(".iklan-kategori");

  ads.forEach(async (el) => {

    const slot = el.dataset.slot;
    const folder = el.dataset.folder || "kategori";

    if (!slot) return;

    const img = el.querySelector("img");
    if (!img) return;

    const base = "/index/uploads/" + folder + "/" + slot;

    let status = "on";

    try {
      const resStatus = await fetch(base + ".status");
      status = (await resStatus.text()).trim();
    } catch {
      status = "on";
    }

    if (status === "off") {
      el.style.display = "none";
      return;
    }

    img.src = base + ".webp";

    img.onerror = function () {
      this.onerror = null;
      this.src = base + ".gif";

      this.onerror = function () {
        el.style.display = "none";
      };
    };

    try {
      const res = await fetch(base + ".txt");
      const link = await res.text();
      el.href = link.trim() || "#";
    } catch {
      el.href = "#";
    }

  });

});