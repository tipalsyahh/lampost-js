document.addEventListener("DOMContentLoaded", () => {

    const btn = document.getElementById("backToTop");

    btn.addEventListener("click", () => {

        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

    });

});

document.addEventListener('DOMContentLoaded', () => {

const items = document.querySelectorAll('.navbar-sub ul li.has-sub');

items.forEach(li => {
    const link = li.querySelector('a');
    const menu = li.querySelector('.sub-menu');

    link.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const isOpen = menu.classList.contains('open');

        document.querySelectorAll('.sub-menu').forEach(m => {
            m.classList.remove('open');
            m.style.display = 'none';
        });

        if (!isOpen) {

            document.body.appendChild(menu);

            const rect = link.getBoundingClientRect();

            let left = rect.left;
            let top = rect.bottom;

            const menuWidth = 200;
            const screenWidth = window.innerWidth;

            if (left + menuWidth > screenWidth) {
                left = screenWidth - menuWidth - 10;
            }

            menu.style.position = 'fixed';
            menu.style.top = top + 'px';
            menu.style.left = left + 'px';

            menu.classList.add('open');
        }
    });
});

document.addEventListener('click', function (e) {
    if (!e.target.closest('.navbar-sub') && !e.target.closest('.sub-menu')) {
        document.querySelectorAll('.sub-menu').forEach(m => {
            m.classList.remove('open');
            m.style.display = 'none';
        });
    }
});

window.addEventListener('scroll', () => {
    document.querySelectorAll('.sub-menu').forEach(m => {
        m.classList.remove('open');
        m.style.display = 'none';
    });
});

window.addEventListener('resize', () => {
    document.querySelectorAll('.sub-menu').forEach(m => {
        m.classList.remove('open');
        m.style.display = 'none';
    });
});

});
