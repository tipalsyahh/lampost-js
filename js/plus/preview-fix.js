(function () {

  const params = new URLSearchParams(window.location.search);
  const postId = params.get('p');
  const isPreview = params.get('preview');

  if (!postId || !isPreview) return;

  console.log('🔥 Preview mode detected:', postId);

  // =====================================
  // BLOCK EXEC SCRIPT LAIN (SEMENTARA)
  // =====================================
  window.__PREVIEW_LOADING__ = true;

  // =====================================
  // AMBIL DATA POST
  // =====================================
  fetch(`https://lampost.co/wp-json/wp/v2/posts/${postId}?_embed`)
    .then(r => r.json())
    .then(async post => {

      let slug = post.slug;
      let parentSlug = '';
      let childSlug = '';

      try {
        if (post.categories?.length) {

          const catRes = await fetch(`https://lampost.co/wp-json/wp/v2/categories/${post.categories[0]}`);
          const cat = await catRes.json();

          childSlug = cat.slug;

          if (cat.parent) {
            const parentRes = await fetch(`https://lampost.co/wp-json/wp/v2/categories/${cat.parent}`);
            const parent = await parentRes.json();
            parentSlug = parent.slug;
          }
        }
      } catch (e) {}

      // =====================================
      // BENTUK URL
      // =====================================
      let cleanUrl = '/';

      if (parentSlug) cleanUrl += parentSlug + '/';
      if (childSlug) cleanUrl += childSlug + '/';

      cleanUrl += slug;

      // =====================================
      // UPDATE URL
      // =====================================
      history.replaceState(null, '', cleanUrl);

      console.log('🔥 URL updated:', cleanUrl);

      // =====================================
      // OVERRIDE FETCH
      // =====================================
      const originalFetch = window.fetch;

      window.fetch = function (url, options) {

        if (typeof url === 'string' && url.includes('/wp-json/wp/v2/posts?slug=')) {
          return originalFetch(`https://lampost.co/wp-json/wp/v2/posts/${postId}?_embed`, options);
        }

        return originalFetch(url, options);
      };

      // =====================================
      // LANJUTKAN SCRIPT UTAMA
      // =====================================
      window.__PREVIEW_LOADING__ = false;

      document.dispatchEvent(new Event('DOMContentLoaded'));

    });

})();