document.addEventListener('DOMContentLoaded', function(){

    const inputSidebar =
        document.getElementById('input-sidebar');

    const btnSidebarSearch =
        document.getElementById('btn-sidebar-search');

    if(!inputSidebar || !btnSidebarSearch){
        return;
    }

    function runSearch(){

        const keyword =
            inputSidebar.value.trim();

        if(keyword !== ''){

            window.location.href =
                '/search?q=' +
                encodeURIComponent(keyword);

        }

    }

    /* CLICK BUTTON */

    btnSidebarSearch.addEventListener(
        'click',
        runSearch
    );

    /* ENTER KEY */

    inputSidebar.addEventListener(
        'keypress',
        function(e){

            if(e.key === 'Enter'){

                e.preventDefault();

                runSearch();

            }

        }
    );

});