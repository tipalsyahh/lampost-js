document.addEventListener("DOMContentLoaded", function () {

    const ads = document.querySelectorAll(".iklan-beranda, .iklan-header");

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
        const folder = el.dataset.folder || "iklan-beranda"; // 🔥 default beranda

        if (!slot) return;

        const imgTag = el.querySelector("img");
        if (!imgTag) return;

        const base = "/index/uploads/" + folder + "/" + slot;

        const webp = await testImage(base + ".webp");
        const gif = await testImage(base + ".gif");

        const finalImg = webp || gif;

        // 🔥 kalau tidak ada gambar → sembunyikan
        if (!finalImg) {
            el.style.display = "none";
            return;
        }

        imgTag.src = finalImg;

        try {
            const res = await fetch(base + ".txt");
            const link = await res.text();
            el.href = link.trim() || "#";
        } catch {
            el.href = "#";
        }

    });

});