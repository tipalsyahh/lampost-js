document.addEventListener('DOMContentLoaded', () => {

  /* ===============================
     FUNGSI UMUM SEARCH
  =============================== */
  function bindSearch(container) {
    if (!container) return;

    const input = container.querySelector('.search-input');
    const btn = container.querySelector('.search-btn'); // boleh null

    function goSearch() {
      const q = input.value;

      if (!q || !q.trim()) {
        alert('Masukkan kata kunci pencarian');
        return;
      }

      window.location.href =
        `../search.html?q=${encodeURIComponent(q.trim())}`;
    }

    /* klik icon (kalau ada) */
    if (btn) {
      btn.addEventListener('click', goSearch);
    }

    /* ENTER */
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        goSearch();
      }
    });
  }

  /* ===============================
     SEARCH BERANDA
  =============================== */
  bindSearch(document.getElementById('searchBeranda'));

  /* ===============================
     SEARCH SIDEBAR
  =============================== */
  bindSearch(document.getElementById('searchSidebar'));

});