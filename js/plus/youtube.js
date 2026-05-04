document.addEventListener("DOMContentLoaded", () => {

  const track = document.querySelector('.video-track');
  const next = document.querySelector('.video-next');
  const prev = document.querySelector('.video-prev');

  if (!track) return;

  const RSS_URL = "https://lampost.co/youtube.php";

  // 🔥 placeholder langsung tampil
  track.innerHTML = `
    <div class="video-card">Loading...</div>
    <div class="video-card">Loading...</div>
    <div class="video-card">Loading...</div>
  `;

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

      const res = await fetch(RSS_URL, {
        cache: "force-cache"
      });

      if (!res.ok) throw new Error("RSS gagal");

      const text = await res.text();

      if (!text || text.length < 50) throw new Error("XML kosong");

      const parser = new DOMParser();
      const xml = parser.parseFromString(text, "text/xml");

      if (xml.querySelector("parsererror")) {
        throw new Error("XML rusak");
      }

      let entries = xml.querySelectorAll("entry");
      if (!entries.length) entries = xml.getElementsByTagName("entry");
      if (!entries.length) throw new Error("Tidak ada video");

      let output = "";

      Array.from(entries).forEach((entry, i) => {
        if (i >= 10) return;

        const title =
          entry.querySelector("title")?.textContent || "";

        const videoId =
          entry.querySelector("yt\\:videoId")?.textContent ||
          entry.getElementsByTagName("yt:videoId")[0]?.textContent;

        const published =
          entry.querySelector("published")?.textContent || "";

        const tanggal = formatTanggal(published);

        if (!videoId) return;

        output += `
          <a href="https://lampost.co/play?v=${videoId}" class="video-card" target="_blank" rel="noopener">
            <img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" loading="lazy">
            <div class="play-center">▶</div>
            <div class="overlay">
              <h3>${title}</h3>
              <span>${tanggal}</span>
            </div>
          </a>
        `;
      });

      if (!output) throw new Error("Kosong");

      track.innerHTML = output;

      initSlider();

    } catch (err) {

      console.error("ERROR:", err.message);

      if (retry < 2) {
        setTimeout(() => loadVideos(retry + 1), 1000);
      } else {
        track.innerHTML = "<p>Gagal memuat video</p>";
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

    if (next) next.onclick = slideNext;
    if (prev) prev.onclick = slidePrev;

    track.addEventListener('click', function(e) {
      const link = e.target.closest('.video-card');
      if (!link) return;

      e.preventDefault();

      const newTab = window.open(link.href, '_blank');
      if (newTab) newTab.opener = null;
    });
  }

});