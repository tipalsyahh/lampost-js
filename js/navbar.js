document.addEventListener('DOMContentLoaded', () => {

  const mq = window.matchMedia('(max-width: 768px)');
  if (!mq.matches) return; // ⛔ STOP jika bukan mobile

  document.querySelectorAll('.navbar-sub ul li').forEach(li => {
    const sub = li.querySelector('.sub-menu');
    const link = li.querySelector('a');
    if (!sub || !link) return;

    function setPos() {
      const rect = link.getBoundingClientRect();
      sub.style.top = rect.bottom + 'px';
      sub.style.left = rect.left + 'px';
    }

    /* MOBILE EVENTS ONLY */
    li.addEventListener('touchstart', setPos);
    li.addEventListener('focusin', setPos);
  });

});

document.querySelectorAll('.navbar-sub ul li').forEach(item => {
    item.addEventListener('click', function(e) {

        if (window.innerWidth < 1024) {

            if (!this.classList.contains('active')) {
                e.preventDefault();

                document.querySelectorAll('.navbar-sub ul li')
                    .forEach(i => i.classList.remove('active'));

                this.classList.add('active');
            }
        }

    });
});
