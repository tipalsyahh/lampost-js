document.addEventListener("DOMContentLoaded", () => {

    const btn = document.getElementById("backToTop");

    btn.addEventListener("click", () => {

        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

    });

});

document.addEventListener('DOMContentLoaded', function () {

    const items = document.querySelectorAll('.navbar-sub ul li.has-sub');

    items.forEach(li => {
        const link = li.querySelector('a');
        const menu = li.querySelector('.sub-menu');

        link.addEventListener('pointerdown', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const isActive = li.classList.contains('active');

            document.querySelectorAll('.navbar-sub ul li.has-sub').forEach(el => {
                el.classList.remove('active');
                const m = el.querySelector('.sub-menu');
                if (m) m.classList.remove('open');
            });

            if (!isActive) {
                const rect = link.getBoundingClientRect();
                menu.style.top = rect.bottom + 'px';
                menu.style.left = rect.left + 'px';

                li.classList.add('active');
                menu.classList.add('open');
            }
        });
    });

    document.addEventListener('pointerdown', function (e) {
        if (!e.target.closest('.has-sub')) {
            document.querySelectorAll('.navbar-sub ul li.has-sub').forEach(el => {
                el.classList.remove('active');
                const m = el.querySelector('.sub-menu');
                if (m) m.classList.remove('open');
            });
        }
    });

});
