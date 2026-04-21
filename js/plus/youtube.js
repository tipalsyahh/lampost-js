document.addEventListener("DOMContentLoaded", async () => {

  const track = document.querySelector('.video-track');
  const next = document.querySelector('.video-next');
  const prev = document.querySelector('.video-prev');

  if (!track) return;

  const CHANNEL_ID = "UC3APNnaEmws76U7c6HC-DZg";
  const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

  try {
    const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`);
    const data = await res.json();

    const items = data.items;

    let output = "";

    items.forEach((item, i) => {
      if (i >= 10) return;

      const title = item.title;

      let videoId = "";

      if (item.link.includes("watch?v=")) {
        videoId = item.link.split("v=")[1];
      } else if (item.link.includes("shorts/")) {
        videoId = item.link.split("shorts/")[1];
      }

      if (videoId.includes("&")) {
        videoId = videoId.split("&")[0];
      }

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
    console.error(err);
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