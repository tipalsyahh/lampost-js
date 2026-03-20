document.addEventListener("DOMContentLoaded", () => {

    const btn = document.getElementById("backToTop");

    btn.addEventListener("click", () => {

        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

    });

});

document.querySelectorAll('.navbar-sub ul li.has-sub').forEach(li => {
    const items = document.querySelectorAll('.navbar-sub ul li.has-sub');

    items.forEach(li => {
        const link = li.querySelector('a');
        const menu = li.querySelector('.sub-menu');

        link.addEventListener('click', function (e) {
            e.preventDefault();

            const isActive = menu.style.display === 'flex';

            document.querySelectorAll('.sub-menu').forEach(m => {
                m.style.display = 'none';
            });

            if (!isActive) {
                const rect = link.getBoundingClientRect();
                menu.style.top = rect.bottom + 'px';
                menu.style.left = rect.left + 'px';
                menu.style.display = 'flex';
            }
        });
    });

    document.addEventListener('click', function (e) {
        if (!e.target.closest('.navbar-sub')) {
            document.querySelectorAll('.sub-menu').forEach(m => {
                m.style.display = 'none';
            });
        }
    });
});
