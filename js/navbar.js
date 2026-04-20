document.addEventListener("DOMContentLoaded", () => {

    const btn = document.getElementById("backToTop");

    btn.addEventListener("click", () => {

        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

    });

});

document.addEventListener("DOMContentLoaded", function () {
    const menus = document.querySelectorAll(".menu-sidebar");

    menus.forEach(menu => {
        const link = menu.querySelector("a");
        const dropdown = menu.querySelector(".dropdown-sidebar");

        link.addEventListener("click", function (e) {
            e.preventDefault();

            document.querySelectorAll(".menu-sidebar").forEach(m => {
                if (m !== menu) {
                    m.classList.remove("active");
                    const d = m.querySelector(".dropdown-sidebar");
                    if (d) d.style.display = "none";
                }
            });

            menu.classList.toggle("active");

            dropdown.style.display =
                dropdown.style.display === "block" ? "none" : "block";
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {

  const el = document.querySelector('.jam');
  if (!el) return;

  function updateJam() {
    const now = new Date();

    const waktu = now.toLocaleTimeString('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    el.textContent = waktu + ' WIB';
  }

  /* jalankan pertama */
  updateJam();

  /* sinkron biar tidak delay */
  function startClock() {
    const now = new Date();
    const delay = 1000 - now.getMilliseconds();

    setTimeout(() => {
      updateJam();
      setInterval(updateJam, 1000);
    }, delay);
  }

  startClock();

});
