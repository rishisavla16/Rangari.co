let currentIndices = {}; // Track current index for each carousel
let autoSlideIntervals = {}; // Track auto-slide intervals for each carousel

function openCarousel(cardId) {
  currentIndices[cardId] = 0; // Initialize current index for this carousel
  updateCarousel(cardId);
  document.getElementById(`carousel-popup-${cardId}`).style.display = 'flex';
  startAutoSlide(cardId); // Start auto-slide for this carousel
}

function closeCarousel(cardId) {
  stopAutoSlide(cardId); // Stop auto-slide for this carousel
  document.getElementById(`carousel-popup-${cardId}`).style.display = 'none';
}

function prevImage(cardId) {
  const carouselInner = document.querySelector(`#carousel-popup-${cardId} .carousel-inner`);
  const totalImages = carouselInner.children.length;
  currentIndices[cardId] = (currentIndices[cardId] - 1 + totalImages) % totalImages;
  updateCarousel(cardId);
}

function nextImage(cardId) {
  const carouselInner = document.querySelector(`#carousel-popup-${cardId} .carousel-inner`);
  const totalImages = carouselInner.children.length;
  currentIndices[cardId] = (currentIndices[cardId] + 1) % totalImages;
  updateCarousel(cardId);
}

function updateCarousel(cardId) {
  const carouselInner = document.querySelector(`#carousel-popup-${cardId} .carousel-inner`);
  const offset = -currentIndices[cardId] * 100; // Calculate the offset based on the current index
  carouselInner.style.transform = `translateX(${offset}%)`; // Move the carousel
}

function startAutoSlide(cardId) {
  autoSlideIntervals[cardId] = setInterval(() => {
    nextImage(cardId); // Move to the next image every 5 seconds
  }, 5000); // 5000 milliseconds = 5 seconds
}

function stopAutoSlide(cardId) {
  clearInterval(autoSlideIntervals[cardId]); // Stop the auto-slide for this carousel
}