document.addEventListener('DOMContentLoaded', async () => {

  const container = document.querySelector('.sport');
  if (!container) return;

  container.innerHTML = `
    <div class="slider-outer">
      <div class="slider"></div>
    </div>
    <div class="dots"></div>
  `;

  const slider = container.querySelector('.slider');
  const dotsContainer = container.querySelector('.dots');

  const MEDIA_CACHE = {};
  const TERM_CACHE = {};

  // ✅ ambil kategori + parent
  async function getCategory(catId) {
    if (!catId) return { name: 'Berita', slug: 'berita', parent: 0 };
    if (TERM_CACHE[catId]) return TERM_CACHE[catId];

    const res = await fetch(`https://lampost.co/wp-json/wp/v2/categories/${catId}`);
    const data = await res.json();

    return (TERM_CACHE[catId] = {
      name: data?.name || 'Berita',
      slug: data?.slug || 'berita',
      parent: data?.parent || 0
    });
  }

  // ✅ ambil parent + child
  async function getCategoryHierarchy(catId) {
    const current = await getCategory(catId);

    if (!current.parent || current.parent === 0) {
      return [current];
    }

    const parent = await getCategory(current.parent);

    return [parent, current];
  }

  try {

    const catRes = await fetch('https://lampost.co/wp-json/wp/v2/categories?slug=olahraga');
    if (!catRes.ok) return;
    const catData = await catRes.json();
    if (!catData.length) return;

    const categoryId = catData[0].id;

    const res = await fetch(`https://lampost.co/wp-json/wp/v2/posts?categories=${categoryId}&per_page=6&orderby=date&order=desc`);
    if (!res.ok) return;
    const posts = await res.json();
    if (!posts.length) return;

    const groups = [];
    for (let i = 0; i < posts.length; i += 2) {
      groups.push(posts.slice(i, i + 2));
    }

    for (let i = 0; i < groups.length; i++) {

      let cardsHTML = '';

      for (const post of groups[i]) {

        const judul = post.title.rendered;

        // ✅ ambil kategori hierarchy
        const kategoriHierarchy = await getCategoryHierarchy(post.categories?.[0]);
        const slugPath = kategoriHierarchy.map(c => c.slug).join('/');
        const kategoriName = kategoriHierarchy[kategoriHierarchy.length - 1].name;

        const link = `/${slugPath}/${post.slug}`;

        let gambar = 'https://lampost.co/image/ai.jpeg';
        let kategori = kategoriName;

        // ===== IMAGE =====
        if (post.featured_media) {
          if (MEDIA_CACHE[post.featured_media]) {
            gambar = MEDIA_CACHE[post.featured_media];
          } else {
            fetch(`https://lampost.co/wp-json/wp/v2/media/${post.featured_media}`)
              .then(res => res.json())
              .then(media => {
                const img =
                  media.media_details?.sizes?.medium?.source_url ||
                  media.source_url ||
                  gambar;

                MEDIA_CACHE[post.featured_media] = img;

                const imgEl = slider.querySelector(`[data-id="${post.id}"] img`);
                if (imgEl) imgEl.src = img;
              });
          }
        }

        cardsHTML += `
          <a href="${link}" class="card-slider" data-id="${post.id}">
            <img src="${gambar}" alt="${judul}">
            <div class="content">
              <span class="kategori">${kategori}</span>
              <p class="judul">${judul}</p>
            </div>
          </a>
        `;
      }

      slider.insertAdjacentHTML('beforeend', `
        <div class="slide">${cardsHTML}</div>
      `);

      dotsContainer.insertAdjacentHTML('beforeend', `<span class="dot ${i === 0 ? 'active' : ''}"></span>`);
    }

    const slides = slider.querySelectorAll('.slide');
    const dots = dotsContainer.querySelectorAll('.dot');

    let index = 0;

    function updateSlide(i) {
      index = i;
      slider.style.transform = `translateX(-${i * 100}%)`;
      dots.forEach(d => d.classList.remove('active'));
      dots[i].classList.add('active');
    }

    setInterval(() => {
      index = (index + 1) % slides.length;
      updateSlide(index);
    }, 3000);

  } catch (err) {
    container.innerHTML = '<p>Gagal memuat</p>';
  }

});