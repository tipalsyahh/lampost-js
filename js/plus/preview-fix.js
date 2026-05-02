(function () {

  const params = new URLSearchParams(window.location.search);
  const postId = params.get('p');
  const isPreview = params.get('preview');

  if (!postId || !isPreview) return;

  console.log('🔥 Preview mode detected:', postId);

  // =====================================
  // OVERRIDE FETCH (WAJIB PALING AWAL)
  // =====================================
  const originalFetch = window.fetch;

  window.fetch = function (url, options) {

    if (typeof url === 'string' && url.includes('/wp-json/wp/v2/posts?slug=')) {

      console.log('🔥 Override fetch ke ID');

      return originalFetch(`https://lampost.co/wp-json/wp/v2/posts/${postId}?_embed`, options)
        .then(r => r.json())
        .then(data => [data]) // 🔥 ubah object jadi array
        .then(arr => new Response(JSON.stringify(arr), {
          headers: { 'Content-Type': 'application/json' }
        }));
    }

    return originalFetch(url, options);
  };

  // =====================================
  // AMBIL DATA UNTUK URL CLEAN
  // =====================================
  originalFetch(`https://lampost.co/wp-json/wp/v2/posts/${postId}?_embed`)
    .then(r => r.json())
    .then(async post => {

      let slug = post.slug || ('preview-' + post.id); // 🔥 FIX undefined

      let parentSlug = '';
      let childSlug = '';

      try {
        if (post.categories?.length) {

          const catRes = await originalFetch(`https://lampost.co/wp-json/wp/v2/categories/${post.categories[0]}`);
          const cat = await catRes.json();

          childSlug = cat.slug;

          if (cat.parent && cat.parent !== 0) {
            const parentRes = await originalFetch(`https://lampost.co/wp-json/wp/v2/categories/${cat.parent}`);
            const parent = await parentRes.json();
            parentSlug = parent.slug;
          }
        }
      } catch (e) {
        console.warn('Kategori gagal diambil');
      }

      // =====================================
      // BENTUK URL
      // =====================================
      let cleanUrl = '/';

      if (parentSlug) cleanUrl += parentSlug + '/';
      if (childSlug) cleanUrl += childSlug + '/';

      cleanUrl += slug;

      // =====================================
      // UPDATE URL TANPA RELOAD
      // =====================================
      history.replaceState(null, '', cleanUrl);

      console.log('🔥 URL updated:', cleanUrl);

    });

})();