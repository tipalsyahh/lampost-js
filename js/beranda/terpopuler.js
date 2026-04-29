document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.terpopuler');
  if (!container) return;

  const PER_PAGE = 10;

  // ======================
  // GET GAMBAR DEFAULT
  // ======================
  function getDefaultImage() {
    return 'https://lampost.co/image/ai.jpeg';
  }

  // ======================
  // LOAD DARI populer.php
  // ======================
  async function loadPosts() {

    try {

      const res = await fetch('/index/server/populer.php');
      let posts = await res.json();

      if (!Array.isArray(posts) || !posts.length) {
        container.innerHTML = '<p>Data tidak tersedia</p>';
        return;
      }

      posts = posts.slice(0, PER_PAGE);

      const htmlArr = [];

      posts.forEach((post, index) => {

        const id = `alink-${index}`;
        const judul = post.title;
        const url = post.url;
        const views = post.views;

        htmlArr.push(`
          <a href="${url}" class="alink-item" id="${id}" target="_blank">
            <img src="${getDefaultImage()}" class="alink-img" loading="lazy">
            <div class="alink-content">
              <p class="alink-title">${judul}</p>
              <p class="alink-category">${views} views</p>
            </div>
          </a>
        `);

      });

      container.innerHTML = htmlArr.join('');

    } catch (e) {
      console.error(e);
      container.innerHTML = '<p>Gagal memuat data</p>';
    }
  }

  loadPosts();

});