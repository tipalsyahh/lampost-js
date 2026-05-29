document.addEventListener("DOMContentLoaded", function () {

    const popup = document.getElementById("popupIklan");
    const closeBtn = document.getElementById("popupClose");

    // Popup tidak ada (status OFF)
    if (!popup) return;

    setTimeout(() => {
        popup.classList.add("active");
    }, 6000);

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            popup.classList.remove("active");
        });
    }

    popup.addEventListener("click", (e) => {
        if (e.target === popup) {
            popup.classList.remove("active");
        }
    });

});