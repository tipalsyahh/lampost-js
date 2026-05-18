const cards = document.querySelectorAll('.card');
const detailImage = document.querySelector('.detail-image');
const detailTitle = document.querySelector('.detail-title');
const detailContent = document.querySelector('.detail-content');
const detailAction = document.querySelector('.detail-action');

/* ===============================
   FUNGSI RENDER DETAIL
================================ */
function renderDetail(card) {
    // image
    detailImage.innerHTML = `
        <img src="${card.dataset.image}" alt="${card.dataset.title}">
    `;

    // title
    detailTitle.textContent = card.dataset.title;

    // content (100 karakter saja)
    const text = card.dataset.content;
    detailContent.textContent =
        text.length > 100 ? text.substring(0, 400) + '...' : text;

    // button redirect
    detailAction.innerHTML = `
        <button class="detail-btn">
            Baca Selengkapnya <i class="bi bi-arrow-right"></i>
        </button>
    `;

    // redirect ke halaman statis
    const btn = detailAction.querySelector('.detail-btn');
    btn.addEventListener('click', () => {
        window.location.href = card.dataset.link;
    });
}

/* ===============================
   CLICK CARD
================================ */
cards.forEach(card => {
    card.addEventListener('click', () => {
        renderDetail(card);
    });
});

/* ===============================
   LOAD RANDOM CARD SAAT PAGE LOAD
================================ */
window.addEventListener('DOMContentLoaded', () => {
    const randomIndex = Math.floor(Math.random() * cards.length);
    renderDetail(cards[randomIndex]);
});

document.addEventListener('DOMContentLoaded', function () {
    const btnMenus = document.querySelectorAll('#btnMenu');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    function openSidebar() {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    btnMenus.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            openSidebar();
        });
    });

    overlay.addEventListener('click', closeSidebar);
});
document.querySelectorAll('.logo-img').forEach(el => {
  el.style.cursor = 'pointer';

  el.onclick = () => {
    window.location.href = '/index/index.html';
  };

  el.setAttribute('tabindex', '0');

  el.onkeypress = (e) => {
    if (e.key === 'Enter') {
      window.location.href = '/index/index.html';
    }
  };
});

/* ===============================
   MODE
================================ */

const darkModeToggle =
document.getElementById(
    "darkModeToggle"
);

const toggleIcon =
document.getElementById(
    "toggleIcon"
);

const logoImage =
document.getElementById(
    "logoImage"
);

const body = document.body;

/* =========================================
LOGO
========================================= */

const lightLogo =
"https://lampost.co/index/image/lampost300.png (1).webp";

const darkLogo =
"https://lampost.co/index/image/mode-dart.png (1).webp";

/* =========================================
SET ICON + LOGO
========================================= */

function updateTheme(){

    // =====================================
    // DARK MODE
    // =====================================

    if(
        body.classList.contains(
            "dark-mode"
        )
    ){

        toggleIcon.className =
        "bi bi-moon-fill";

        if(logoImage){

            logoImage.src =
            darkLogo;
        }

    }

    // =====================================
    // LIGHT MODE
    // =====================================

    else{

        toggleIcon.className =
        "bi bi-sun-fill";

        if(logoImage){

            logoImage.src =
            lightLogo;
        }
    }
}

/* =========================================
LOAD THEME
========================================= */

const savedTheme =
localStorage.getItem(
    "theme"
);

if(savedTheme){

    body.classList.add(
        savedTheme
    );

}else{

    body.classList.add(
        "light-mode"
    );
}

/* =========================================
UPDATE
========================================= */

updateTheme();

/* =========================================
TOGGLE
========================================= */

darkModeToggle.onclick =
function(){

    // =====================================
    // TO LIGHT
    // =====================================

    if(
        body.classList.contains(
            "dark-mode"
        )
    ){

        body.classList.remove(
            "dark-mode"
        );

        body.classList.add(
            "light-mode"
        );

        localStorage.setItem(

            "theme",

            "light-mode"
        );
    }

    // =====================================
    // TO DARK
    // =====================================

    else{

        body.classList.remove(
            "light-mode"
        );

        body.classList.add(
            "dark-mode"
        );

        localStorage.setItem(

            "theme",

            "dark-mode"
        );
    }

    // =====================================
    // UPDATE
    // =====================================

    updateTheme();
};
