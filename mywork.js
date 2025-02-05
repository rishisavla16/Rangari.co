let currentIndices = {};
let autoSlideIntervals = {};
// let touchStartX = 0;

document.addEventListener('DOMContentLoaded', initCarousels);

function initCarousels() {
  document.querySelectorAll('.carousel').forEach(carousel => {
    // carousel.addEventListener('touchstart', handleTouchStart, { passive: true });
    // carousel.addEventListener('touchend', handleTouchEnd, { passive: true });
  });
}

// function handleTouchStart(e) {
//   touchStartX = e.touches[0].clientX;
// }

// function handleTouchEnd(e) {
//   const touchEndX = e.changedTouches[0].clientX;
//   const deltaX = touchEndX - touchStartX;
//   const carousel = e.currentTarget.closest('.popup');
//   const cardId = carousel.id.split('-')[2];

//   if (Math.abs(deltaX) > 50) {
//     deltaX > 0 ? prevImage(cardId) : nextImage(cardId);
//   }
// }

function openCarousel(cardId) {
  const carouselInner = document.querySelector(`#carousel-popup-${cardId} .carousel-inner`);
  const images = carouselInner.querySelectorAll('img');

  // Clone first and last images for infinite loop
  const cloneFirst = images[0].cloneNode(true);
  const cloneLast = images[images.length - 1].cloneNode(true);
  carouselInner.prepend(cloneLast);
  carouselInner.appendChild(cloneFirst);

  currentIndices[cardId] = 1; // Start at first real image
  updateCarousel(cardId);

  const popup = document.getElementById(`carousel-popup-${cardId}`);
  popup.style.display = 'flex';
  setTimeout(() => popup.classList.add('active'), 30);
  startAutoSlide(cardId);
}

function closeCarousel(cardId) {
  const popup = document.getElementById(`carousel-popup-${cardId}`);
  const carouselInner = popup.querySelector('.carousel-inner');

  // Remove cloned images
  carouselInner.removeChild(carouselInner.firstElementChild);
  carouselInner.removeChild(carouselInner.lastElementChild);

  popup.classList.remove('active');
  setTimeout(() => (popup.style.display = 'none'), 500);
  stopAutoSlide(cardId);
}

function prevImage(cardId) {
  const carouselInner = document.querySelector(`#carousel-popup-${cardId} .carousel-inner`);
  const totalRealImages = carouselInner.children.length - 2;

  currentIndices[cardId]--;

  // After sliding to clone, reset to last real image
  if (currentIndices[cardId] < 1) {
    const handleTransitionEnd = () => {
      carouselInner.removeEventListener('transitionend', handleTransitionEnd);
      carouselInner.style.transition = 'none';
      currentIndices[cardId] = totalRealImages;
      updateCarousel(cardId);
      carouselInner.offsetHeight; // Force reflow
      carouselInner.style.transition = '';
    };
    carouselInner.addEventListener('transitionend', handleTransitionEnd);
  }

  updateCarousel(cardId);
  resetAutoSlide(cardId);
}

function nextImage(cardId) {
  const carouselInner = document.querySelector(`#carousel-popup-${cardId} .carousel-inner`);
  const totalRealImages = carouselInner.children.length - 2;

  currentIndices[cardId]++;

  // After sliding to clone, reset to first real image
  if (currentIndices[cardId] > totalRealImages) {
    const handleTransitionEnd = () => {
      carouselInner.removeEventListener('transitionend', handleTransitionEnd);
      carouselInner.style.transition = 'none';
      currentIndices[cardId] = 1;
      updateCarousel(cardId);
      carouselInner.offsetHeight; // Force reflow
      carouselInner.style.transition = '';
    };
    carouselInner.addEventListener('transitionend', handleTransitionEnd);
  }

  updateCarousel(cardId);
  resetAutoSlide(cardId);
}

function updateCarousel(cardId) {
  const carouselInner = document.querySelector(`#carousel-popup-${cardId} .carousel-inner`);
  const totalRealImages = carouselInner.children.length - 2;
  const offset = -currentIndices[cardId] * 100;
  carouselInner.style.transform = `translateX(${offset}%)`;

  // Update indicator
  const indicator = document.querySelector(`#carousel-popup-${cardId} .carousel-indicator`);
  if (indicator) {
    const realIndex = currentIndices[cardId] > totalRealImages ? 1 : currentIndices[cardId] < 1 ? totalRealImages : currentIndices[cardId];
    indicator.textContent = `${realIndex}/${totalRealImages}`;
  }
}

function startAutoSlide(cardId) {
  stopAutoSlide(cardId);
  autoSlideIntervals[cardId] = setInterval(() => nextImage(cardId), 5000);
}

function stopAutoSlide(cardId) {
  if (autoSlideIntervals[cardId]) clearInterval(autoSlideIntervals[cardId]);
}

function resetAutoSlide(cardId) {
  stopAutoSlide(cardId);
  startAutoSlide(cardId);
}