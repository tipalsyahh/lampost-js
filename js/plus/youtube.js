document.addEventListener("DOMContentLoaded", async () => {

  const track = document.querySelector('.video-track');
  const next = document.querySelector('.video-next');
  const prev = document.querySelector('.video-prev');

  if (!track) return;

  const RSS_URL = "https://lampost.co/youtube.php";

  // 🔥 FORMAT TANGGAL YOUTUBE
  function formatTanggal(text) {
    if (!text) return "";

    const now = new Date();

    const match = text.match(/(\d+)\s+(minute|hour|day|week|month|year)/);

    if (!match) return text;

    const value = parseInt(match[1]);
    const unit = match[2];

    if (unit === "minute") now.setMinutes(now.getMinutes() - value);
    if (unit === "hour") now.setHours(now.getHours() - value);
    if (unit === "day") now.setDate(now.getDate() - value);
    if (unit === "week") now.setDate(now.getDate() - (value * 7));
    if (unit === "month") now.setMonth(now.getMonth() - value);
    if (unit === "year") now.setFullYear(now.getFullYear() - value);

    return now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  async function loadVideos(retry = 0) {
    try {

      const res = await fetch(RSS_URL + "?t=" + Date.now(), {
        cache: "no-store"
      });

      if (!res.ok) {
        throw new Error("RSS gagal: " + res.status);
      }

      const text = await res.text();

      if (!text || text.length < 50) {
        throw new Error("XML kosong");
      }

      const parser = new DOMParser();
      const xml = parser.parseFromString(text, "text/xml");

      if (xml.querySelector("parsererror")) {
        throw new Error("XML rusak / tidak valid");
      }

      let entries = xml.querySelectorAll("entry");

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

        const videoId =
          entry.querySelector("yt\\:videoId")?.textContent ||
          entry.getElementsByTagName("yt:videoId")[0]?.textContent;

        // 🔥 AMBIL TANGGAL
        const published =
          entry.querySelector("published")?.textContent || "";

        const tanggal = formatTanggal(published);

        if (!videoId) return;

        output += `
          <a href="https://lampost.co/play?v=${videoId}" class="video-card">
            <img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg">
            <div class="play-center">▶</div>

            <div class="overlay">
              <h3>${title}</h3>
              <span class="video-date">${tanggal}</span>
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