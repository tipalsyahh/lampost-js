document.addEventListener("DOMContentLoaded", async () => {

  const track = document.querySelector('.video-track');
  const next = document.querySelector('.video-next');
  const prev = document.querySelector('.video-prev');

  if (!track) return;

  const RSS_URL = "https://lampost.co/youtube.php";

  try {

    const res = await fetch(RSS_URL);

    if (!res.ok) {
      console.error("RSS gagal:", res.status);
      return;
    }

    const text = await res.text();

    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");

    const entries = xml.getElementsByTagName("entry");

    if (!entries.length) {
      console.error("Tidak ada video ditemukan");
      return;
    }

    let output = "";

    Array.from(entries).forEach((entry, i) => {

      if (i >= 10) return;

      const title =
        entry.getElementsByTagName("title")[0]?.textContent || "";

      // 🔥 FIX UTAMA DI SINI
      const videoId =
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

    track.innerHTML = output;

    initSlider();

  } catch (err) {
    console.error("ERROR:", err);
  }

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