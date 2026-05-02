document.addEventListener("DOMContentLoaded", function () {

    const popup = document.getElementById("popupIklan");
    const closeBtn = document.getElementById("popupClose");

    setTimeout(() => {
        popup.classList.add("active");
    }, 9000);

    closeBtn.addEventListener("click", () => {
        popup.classList.remove("active");
    });

    popup.addEventListener("click", (e) => {
        if (e.target === popup) {
            popup.classList.remove("active");
        }
    });

});