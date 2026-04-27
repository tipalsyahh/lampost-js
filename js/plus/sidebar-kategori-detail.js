document.addEventListener("DOMContentLoaded", function () {

  console.log("SIDEBAR KATEGORI DETAIL AKTIF");

  const ads = document.querySelectorAll(".sidebar-kategori-detail");

  if (!ads.length) {
    console.log("❌ tidak ada elemen sidebar-kategori-detail");
    return;
  }

  ads.forEach((el) => {

    const slot = el.dataset.slot;
    const folder = el.dataset.folder;

    if (!slot || !folder) {
      console.log("❌ slot/folder kosong:", el);
      el.style.display = "none";
      return;
    }

    const img = el.querySelector("img");
    if (!img) {
      console.log("❌ img tidak ditemukan:", el);
      el.style.display = "none";
      return;
    }

    const base = "/index/uploads/" + folder + "/" + slot;

    console.log("LOAD:", base);

    // =========================
    // 🔥 LOAD GAMBAR
    // =========================
    img.src = base + ".webp";

    img.onerror = function () {
      this.onerror = null;

      // fallback ke gif
      this.src = base + ".gif";

      this.onerror = function () {
        console.log("❌ gambar tidak ditemukan:", base);
        el.style.display = "none";
      };
    };

    // =========================
    // 🔥 AMBIL LINK
    // =========================
    fetch(base + ".txt")
      .then(res => res.text())
      .then(link => {
        el.href = link.trim() || "#";
      })
      .catch(() => {
        console.log("❌ link tidak ditemukan:", base);
        el.href = "#";
      });

  });

});