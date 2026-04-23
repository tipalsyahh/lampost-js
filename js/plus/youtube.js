document.addEventListener("DOMContentLoaded", async () => {

  const track = document.querySelector('.video-track');
  const next = document.querySelector('.video-next');
  const prev = document.querySelector('.video-prev');

  if (!track) return;

  const RSS_URL = "https://lampost.co/youtube.php";

  async function loadVideos(retry = 0) {
    try {

      const res = await fetch(RSS_URL + "?t=" + Date.now()); // 🔥 anti cache

      if (!res.ok) {
        throw new Error("RSS gagal: " + res.status);
      }

      const text = await res.text();

      if (!text || text.length < 50) {
        throw new Error("XML kosong");
      }

      const parser = new DOMParser();
      const xml = parser.parseFromString(text, "text/xml");

      // 🔥 cek error XML
      if (xml.querySelector("parsererror")) {
        throw new Error("XML rusak / tidak valid");
      }

      // 🔥 FIX: pakai querySelectorAll
      let entries = xml.querySelectorAll("entry");

      // 🔥 fallback kalau gagal
      if (!entries.length) {
        entries = xml.getElementsByTagName("entry");
      }

      if (!entries.length) {
        throw new Error("Tidak ada video ditemukan");
      }

      let output = "";

      Array.from(entries).forEach((entry, i) => {

        if (i >= 10) return;

        const title =
          entry.querySelector("title")?.textContent || "";

        // 🔥 FIX UTAMA (namespace aman)
        const videoId =
          entry.querySelector("yt\\:videoId")?.textContent ||
          entry.getElementsByTagName("yt:videoId")[0]?.textContent;

        if (!videoId) return;

        output += `
          <a href="https://lampost.co/play?v=${videoId}" class="video-card">
            <img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg">
            <div class="play-center">▶</div>
            <div class="overlay">
              <h3>${title}</h3>
            </div>
          </a>
        `;
      });

      if (!output) {
        throw new Error("Video kosong setelah parsing");
      }

      track.innerHTML = output;

      initSlider();

    } catch (err) {

      console.error("ERROR:", err.message);

      // 🔥 retry max 2x (ini solusi biar tidak random kosong)
      if (retry < 2) {
        console.log("Retry ke:", retry + 1);
        setTimeout(() => loadVideos(retry + 1), 1000);
      }

    }
  }

  loadVideos();

  function initSlider() {
    if (window.innerWidth <= 768) {
      track.style.transform = 'none';
      return;
    }

    const cards = Array.from(track.children);
    if (!cards.length) return;

    const cardWidth = cards[0].offsetWidth + 15;
    const visible = 2;

    let index = visible;
    let isAnimating = false;

    const firstClones = cards.slice(0, visible).map(el => el.cloneNode(true));
    const lastClones = cards.slice(-visible).map(el => el.cloneNode(true));

    lastClones.reverse().forEach(clone => {
      track.insertBefore(clone, track.firstChild);
    });

    firstClones.forEach(clone => {
      track.appendChild(clone);
    });

    track.style.transform = `translateX(-${cardWidth * index}px)`;

    function slideNext() {
      if (isAnimating) return;
      isAnimating = true;

      index++;
      track.style.transition = '0.4s';
      track.style.transform = `translateX(-${cardWidth * index}px)`;

      setTimeout(() => {
        if (index >= cards.length + visible) {
          track.style.transition = 'none';
          index = visible;
          track.style.transform = `translateX(-${cardWidth * index}px)`;
        }
        isAnimating = false;
      }, 400);
    }

    function slidePrev() {
      if (isAnimating) return;
      isAnimating = true;

      index--;
      track.style.transition = '0.4s';
      track.style.transform = `translateX(-${cardWidth * index}px)`;

      setTimeout(() => {
        if (index < visible) {
          track.style.transition = 'none';
          index = cards.length + visible - 1;
          track.style.transform = `translateX(-${cardWidth * index}px)`;
        }
        isAnimating = false;
      }, 400);
    }

    next.onclick = slideNext;
    prev.onclick = slidePrev;

    track.addEventListener('click', function(e) {
      const link = e.target.closest('.video-card');
      if (!link) return;

      e.preventDefault();
      window.open(link.href, '_blank');
    });
  }

});