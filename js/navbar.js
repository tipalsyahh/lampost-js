document.addEventListener("DOMContentLoaded", function () {

    const btn = document.getElementById("backToTop");

    if (!btn) {
        console.log("Tombol tidak ditemukan");
        return;
    }

    console.log("Tombol ketemu");

    btn.style.display = "none";

    window.onscroll = function () {
        if (document.documentElement.scrollTop > 200 || document.body.scrollTop > 200) {
            btn.style.display = "block";
        } else {
            btn.style.display = "none";
        }
    };

    btn.onclick = function () {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    };

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
