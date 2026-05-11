document.addEventListener("DOMContentLoaded", () => {

  const track = document.querySelector('.video-track');
  const next = document.querySelector('.video-next');
  const prev = document.querySelector('.video-prev');

  if (!track) return;

  const RSS_URL = "https://lampost.co/youtube.php";

  // placeholder
  track.innerHTML = `
    <div class="video-card loading">Loading...</div>
    <div class="video-card loading">Loading...</div>
    <div class="video-card loading">Loading...</div>
  `;

  function formatTanggal(text) {

    if (!text) return "";

    const date = new Date(text);

    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  async function loadVideos(retry = 0) {

    try {

      const res = await fetch(RSS_URL, {
        cache: "no-store"
      });

      if (!res.ok) {
        throw new Error("RSS gagal");
      }

      const text = await res.text();

      if (!text || text.length < 50) {
        throw new Error("XML kosong");
      }

      const parser = new DOMParser();

      const xml = parser.parseFromString(text, "text/xml");

      if (xml.querySelector("parsererror")) {
        throw new Error("XML rusak");
      }

      let entries = xml.querySelectorAll("entry");

      if (!entries.length) {
        entries = xml.getElementsByTagName("entry");
      }

      if (!entries.length) {
        throw new Error("Tidak ada video");
      }

      let output = "";

      Array.from(entries).forEach((entry, i) => {

        if (i >= 10) return;

        const title =
          entry.querySelector("title")?.textContent?.trim() || "";

        const videoId =
          entry.querySelector("yt\\:videoId")?.textContent ||
          entry.getElementsByTagName("yt:videoId")[0]?.textContent;

        const published =
          entry.querySelector("published")?.textContent || "";

        const tanggal = formatTanggal(published);

        if (!videoId) return;

        const thumb =
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

        // 🔥 redirect seperti script lama
        const redirectUrl =
          `https://lampost.co/play?v=${videoId}`;

        output += `
          <a href="${redirectUrl}"
             class="video-card"
             target="_blank"
             rel="noopener noreferrer">

            <div class="thumb-wrap">

              <img
                src="${thumb}"
                alt="${title}"
                loading="lazy"
                decoding="async"
              >

              <div class="play-center">▶</div>

            </div>

            <div class="overlay">
              <h3>${title}</h3>
              <span>${tanggal}</span>
            </div>

          </a>
        `;
      });

      if (!output) {
        throw new Error("Video kosong");
      }

      track.innerHTML = output;

      requestAnimationFrame(() => {
        initSlider();
      });

    } catch (err) {

      console.error("ERROR:", err);

      if (retry < 2) {

        setTimeout(() => {
          loadVideos(retry + 1);
        }, 1000);

      } else {

        track.innerHTML = `
          <div class="video-error">
            Gagal memuat video
          </div>
        `;
      }
    }
  }

  loadVideos();

  function initSlider() {

    if (window.innerWidth <= 768) {
      track.style.transform = 'none';
      track.style.transition = 'none';
      return;
    }

    const cards = [...track.querySelectorAll('.video-card')];

    if (!cards.length) return;

    // hapus clone lama
    track.querySelectorAll('.clone').forEach(el => el.remove());

    const visible = 2;

    const gap = 15;

    const cardWidth = cards[0].offsetWidth + gap;

    let index = visible;

    let isAnimating = false;

    const firstClones = cards
      .slice(0, visible)
      .map(el => {
        const clone = el.cloneNode(true);
        clone.classList.add('clone');
        return clone;
      });

    const lastClones = cards
      .slice(-visible)
      .map(el => {
        const clone = el.cloneNode(true);
        clone.classList.add('clone');
        return clone;
      });

    lastClones.reverse().forEach(clone => {
      track.prepend(clone);
    });

    firstClones.forEach(clone => {
      track.appendChild(clone);
    });

    track.style.transition = 'none';

    track.style.transform =
      `translateX(-${cardWidth * index}px)`;

    function slideNext() {

      if (isAnimating) return;

      isAnimating = true;

      index++;

      track.style.transition = '0.4s ease';

      track.style.transform =
        `translateX(-${cardWidth * index}px)`;

      setTimeout(() => {

        if (index >= cards.length + visible) {

          track.style.transition = 'none';

          index = visible;

          track.style.transform =
            `translateX(-${cardWidth * index}px)`;
        }

        isAnimating = false;

      }, 400);
    }

    function slidePrev() {

      if (isAnimating) return;

      isAnimating = true;

      index--;

      track.style.transition = '0.4s ease';

      track.style.transform =
        `translateX(-${cardWidth * index}px)`;

      setTimeout(() => {

        if (index < visible) {

          track.style.transition = 'none';

          index = cards.length + visible - 1;

          track.style.transform =
            `translateX(-${cardWidth * index}px)`;
        }

        isAnimating = false;

      }, 400);
    }

    if (next) {
      next.onclick = slideNext;
    }

    if (prev) {
      prev.onclick = slidePrev;
    }

    // 🔥 redirect aman seperti script lama
    track.addEventListener('click', function(e) {

      const link = e.target.closest('.video-card');

      if (!link) return;

      e.preventDefault();

      const newTab = window.open(link.href, '_blank');

      if (newTab) {
        newTab.opener = null;
      }

    });

  }

});