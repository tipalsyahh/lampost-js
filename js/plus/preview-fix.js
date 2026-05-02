(function () {

  const params = new URLSearchParams(window.location.search);
  const postId = params.get('p');
  const isPreview = params.get('preview');

  if (!postId || !isPreview) return;

  console.log('🔥 Preview mode detected:', postId);

  const originalFetch = window.fetch;
  let previewPost = null;

  // =====================================
  // 1. AMBIL DATA POST DULU (BY ID)
  // =====================================
  fetch(`https://lampost.co/wp-json/wp/v2/posts/${postId}?_embed`)
    .then(r => r.json())
    .then(async post => {

      previewPost = post;

      let slug = post.slug;
      let parentSlug = '';
      let childSlug = '';

      // =====================================
      // 2. AMBIL KATEGORI (SAMA LOGIKA SCRIPT KAMU)
      // =====================================
      try {
        if (post.categories && post.categories.length) {

          const catRes = await fetch(`https://lampost.co/wp-json/wp/v2/categories/${post.categories[0]}`);
          const cat = await catRes.json();

          childSlug = cat.slug;

          if (cat.parent && cat.parent !== 0) {
            const parentRes = await fetch(`https://lampost.co/wp-json/wp/v2/categories/${cat.parent}`);
            const parent = await parentRes.json();
            parentSlug = parent.slug;
          }
        }
      } catch (e) {}

      // =====================================
      // 3. BENTUK CLEAN URL (SUPPORT SUB)
      // =====================================
      let cleanUrl = '/';

      if (parentSlug) cleanUrl += parentSlug + '/';
      if (childSlug) cleanUrl += childSlug + '/';

      cleanUrl += slug;

      // =====================================
      // 4. REPLACE URL TANPA RELOAD
      // =====================================
      history.replaceState(null, '', cleanUrl);

      console.log('🔥 URL diubah ke:', cleanUrl);

    });

  // =====================================
  // 5. OVERRIDE FETCH SLUG → ID
  // =====================================
  window.fetch = async function (url, options) {

    if (typeof url === 'string' && url.includes('/wp-json/wp/v2/posts?slug=')) {

      console.log('🔥 Override fetch ke ID');

      return originalFetch(`https://lampost.co/wp-json/wp/v2/posts/${postId}?_embed`, options);
    }

    return originalFetch(url, options);
  };

})();