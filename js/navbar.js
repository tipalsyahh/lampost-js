document.addEventListener("DOMContentLoaded", () => {

    const btn = document.getElementById("backToTop");

    if (!btn) return;

    function toggleButton() {
        if (window.pageYOffset > 200) {
            btn.classList.add("show");
        } else {
            btn.classList.remove("show");
        }
    }

    window.addEventListener("scroll", toggleButton);

    toggleButton(); // 🔥 penting (biar langsung cek posisi awal)

    btn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
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
