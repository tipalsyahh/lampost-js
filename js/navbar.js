document.addEventListener("DOMContentLoaded", () => {

    const btn = document.getElementById("backToTop");
    if (!btn) return;

    // styling awal
    btn.style.opacity = "0";
    btn.style.pointerEvents = "none";
    btn.style.transition = "opacity 0.3s ease";

    // 🔥 fungsi update tombol
    function toggleButton(scrollTop) {
        if (scrollTop > 200) {
            btn.style.opacity = "1";
            btn.style.pointerEvents = "auto";
        } else {
            btn.style.opacity = "0";
            btn.style.pointerEvents = "none";
        }
    }

    // 🔥 cek scroll window
    window.addEventListener("scroll", () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        toggleButton(scrollTop);
    });

    // 🔥 cek scroll di semua container (kalau ada)
    document.querySelectorAll('*').forEach(el => {
        const style = getComputedStyle(el);
        if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
            el.addEventListener("scroll", () => {
                toggleButton(el.scrollTop);
            });
        }
    });

    // 🔥 klik tombol
    btn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        // kalau pakai container scroll
        document.querySelectorAll('*').forEach(el => {
            if (el.scrollTop > 0) {
                el.scrollTo({ top: 0, behavior: "smooth" });
            }
        });
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

  const atas = document.querySelector('.jam-atas');
  if (!atas) return;

  function updateJam() {
    const now = new Date();

    const waktu = now.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Jakarta',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    atas.textContent = waktu;
  }

  updateJam();

  // sinkron biar detik pas (tidak delay)
  const delay = 1000 - new Date().getMilliseconds();
  setTimeout(() => {
    updateJam();
    setInterval(updateJam, 1000);
  }, delay);

});

let isDragging = false;

document.addEventListener('mousedown', () => isDragging = false);
document.addEventListener('mousemove', () => isDragging = true);

document.querySelectorAll('.post-item a').forEach(link => {
  link.addEventListener('click', e => {
    if (isDragging) e.preventDefault();
  });
});
