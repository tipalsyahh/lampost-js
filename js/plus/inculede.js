document.addEventListener("DOMContentLoaded", () => {
    document.body.insertAdjacentHTML("afterbegin", SIDEBAR);
});

const searchBtn = document.getElementById('search-baru');
const searchModal = document.getElementById('searchModal');
const closeSearchModal = document.getElementById('closeSearchModal');
const searchOverlay = document.querySelector('.search-modal-overlay');
const searchInput = document.querySelector('.search-modal-form input');

/* =========================================
OPEN
========================================= */

searchBtn.addEventListener('click', function(e){

    e.preventDefault();

    searchModal.classList.add('active');

    document.body.style.overflow = 'hidden';

    setTimeout(() => {

        searchInput.focus();

    }, 300);

});

/* =========================================
CLOSE FUNCTION
========================================= */

function closeSearch(){

    searchModal.classList.remove('active');

    document.body.style.overflow = '';

}

/* =========================================
BUTTON CLOSE
========================================= */

closeSearchModal.addEventListener('click', closeSearch);

/* =========================================
OVERLAY CLOSE
========================================= */

searchOverlay.addEventListener('click', closeSearch);

/* =========================================
ESC CLOSE
========================================= */

document.addEventListener('keydown', function(e){

    if(e.key === 'Escape'){

        closeSearch();

    }

});