(function () {

  const params = new URLSearchParams(window.location.search);
  const postId = params.get('p');
  const isPreview = params.get('preview');

  if (!postId || !isPreview) return;

  console.log('🔥 Preview mode detected:', postId);

  const originalFetch = window.fetch;
  const originalReplaceState = history.replaceState;

  // =====================================
  // 🚫 BLOCK replaceState dari script utama
  // =====================================
  history.replaceState = function () {
    console.log('🚫 replaceState diblok saat preview');
  };

  // =====================================
  // 🔥 OVERRIDE FETCH (slug → ID + preview)
  // =====================================
  window.fetch = function (url, options) {

    if (typeof url === 'string' && url.includes('/wp-json/wp/v2/posts?slug=')) {

      const match = url.match(/slug=([^&]+)/);
      const slug = match ? match[1] : '';

      // kalau slug preview-xxx → ambil ID
      if (slug.startsWith('preview-')) {

        const id = slug.replace('preview-', '');

        console.log('🔥 Preview slug → ID:', id);

        return originalFetch(`https://lampost.co/wp-json/wp/v2/posts/${id}?_embed&preview=true`, options)
          .then(r => r.json())
          .then(data => [data])
          .then(arr => new Response(JSON.stringify(arr), {
            headers: { 'Content-Type': 'application/json' }
          }));
      }

      // slug normal tapi masih preview → tetap pakai ID awal
      console.log('🔥 Override slug → ID preview');

      return originalFetch(`https://lampost.co/wp-json/wp/v2/posts/${postId}?_embed&preview=true`, options)
        .then(r => r.json())
        .then(data => [data])
        .then(arr => new Response(JSON.stringify(arr), {
          headers: { 'Content-Type': 'application/json' }
        }));
    }

    return originalFetch(url, options);
  };

  // =====================================
  // 🔥 AMBIL DATA POST UNTUK CLEAN URL
  // =====================================
  originalFetch(`https://lampost.co/wp-json/wp/v2/posts/${postId}?_embed&preview=true`)
    .then(r => r.json())
    .then(async post => {

      let slug = post.slug || ('preview-' + postId);

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

      let cleanUrl = '/';

      if (parentSlug) cleanUrl += parentSlug + '/';
      if (childSlug) cleanUrl += childSlug + '/';

      cleanUrl += slug;

      // =====================================
      // ✅ SET URL FINAL
      // =====================================
      originalReplaceState.call(history, null, '', cleanUrl);

      console.log('🔥 URL updated:', cleanUrl);

      // =====================================
      // ✅ RESTORE replaceState
      // =====================================
      history.replaceState = originalReplaceState;

    })
    .catch(err => {
      console.error('Preview fetch error:', err);
      history.replaceState = originalReplaceState;
    });

})();