const items = document.querySelectorAll('.widget-item');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

let current = Math.floor(items.length / 2);

function getIndex(i) {
  return (i + items.length) % items.length;
}

function updateCarousel() {
  items.forEach(item => item.className = 'widget-item');

  items[getIndex(current)].classList.add('active');
  items[getIndex(current + 1)].classList.add('next');
  items[getIndex(current - 1)].classList.add('prev');
  items[getIndex(current + 2)].classList.add('next2');
  items[getIndex(current - 2)].classList.add('prev2');
}

nextBtn.onclick = () => {
  current++;
  updateCarousel();
};

prevBtn.onclick = () => {
  current--;
  updateCarousel();
};

updateCarousel();