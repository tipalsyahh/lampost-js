document.addEventListener("DOMContentLoaded", function () {

  console.log("SIDEBAR KATEGORI DETAIL AKTIF");

  const ads = document.querySelectorAll(".sidebar-kategori-detail");

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

  if (!ads.length) {
    console.log("❌ tidak ada elemen sidebar-kategori-detail");
    return;
  }

  ads.forEach(async (el) => {

    const slot = el.dataset.slot;
    const folder = el.dataset.folder;

    if (!slot || !folder) {
      console.log("❌ slot/folder kosong:", el);
      el.style.display = "none";
      return;
    }

    const imgTag = el.querySelector("img");
    if (!imgTag) {
      console.log("❌ img tidak ditemukan:", el);
      el.style.display = "none";
      return;
    }

    const base = "/index/uploads/" + folder + "/" + slot;

    console.log("LOAD:", base);

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
      console.log("⛔ iklan OFF:", base);
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
    // 🔥 JIKA GAMBAR TIDAK ADA
    // =========================
    if (!finalImg) {
      console.log("❌ gambar tidak ditemukan:", base);
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
      console.log("❌ link tidak ditemukan:", base);
      el.href = "#";
    }

  });

});