document.addEventListener(
'DOMContentLoaded',
() => {

  /* ===============================
     FUNGSI UMUM SEARCH
  =============================== */

  function bindSearch(container) {

    if (!container) return;

    const input =

      container.querySelector(
        '.search-input'
      );

    const btn =

      container.querySelector(
        '.search-btn'
      );

    // =============================
    // GO SEARCH
    // =============================

    function goSearch() {

      const q =
        input.value.trim();

      // ===========================
      // EMPTY
      // ===========================

      if (!q) {

        alert(
          'Masukkan kata kunci pencarian'
        );

        return;
      }

      // ===========================
      // ROOT SEARCH
      // ===========================

      window.location.href =

        '/search?q=' +

        encodeURIComponent(q);
    }

    // =============================
    // CLICK
    // =============================

    if (btn) {

      btn.addEventListener(
        'click',
        goSearch
      );
    }

    // =============================
    // ENTER
    // =============================

    input.addEventListener(
      'keydown',
      e => {

        if (e.key === 'Enter') {

          e.preventDefault();

          goSearch();
        }
      }
    );
  }

  /* ===============================
     SEARCH BERANDA
  =============================== */

  bindSearch(
    document.getElementById(
      'searchBeranda'
    )
  );

  /* ===============================
     SEARCH SIDEBAR
  =============================== */

  bindSearch(
    document.getElementById(
      'searchSidebar'
    )
  );

});