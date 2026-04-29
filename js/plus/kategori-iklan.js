document.addEventListener("DOMContentLoaded", function () {

  const ads = document.querySelectorAll(".iklan-kategori");

  const cacheBust = () => "?t=" + Date.now();

  const testImage = (url) => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => resolve(null);
      img.src = url + cacheBust(); // 🔥 anti cache
      img.decoding = "async";
      img.loading = "eager";
    });
  };

  ads.forEach(async (el) => {

    const slot = el.dataset.slot;
    const folder = el.dataset.folder || "kategori";

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
      el.style.display = "none";
      return;
    }

    // =========================
    // 🔥 LOAD GAMBAR (WEBP → GIF)
    // =========================
    const webp = await testImage(base + ".webp");
    const gif  = await testImage(base + ".gif");

    const finalImg = webp || gif;

    // =========================
    // 🔥 JIKA TIDAK ADA GAMBAR
    // =========================
    if (!finalImg) {
      el.style.display = "none";
      return;
    }

    // =========================
    // 🔥 SET GAMBAR (ANTI CACHE + RESET)
    // =========================
    const newSrc = finalImg + cacheBust();

    imgTag.removeAttribute("src");

    setTimeout(() => {
      imgTag.src = newSrc;
    }, 10);

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

  });

});