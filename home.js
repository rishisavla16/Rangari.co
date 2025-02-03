document.addEventListener("DOMContentLoaded", function () {
    const carouselInner = document.querySelector('.carousel-inner');
    const carouselItems = document.querySelectorAll('.carousel-item');
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');
    let currentIndex = 0;
    const totalItems = carouselItems.length;

    function moveToNextSlide() {
        currentIndex = (currentIndex + 1) % totalItems; // Increment index
        updateCarousel();
    }

    function moveToPrevSlide() {
        currentIndex = (currentIndex - 1 + totalItems) % totalItems; // Decrement index
        updateCarousel();
    }

    function updateCarousel() {
        const offset = -currentIndex * 100;
        carouselInner.style.transform = `translateX(${offset}%)`;

        // If we're at the duplicated first image, reset without animation
        if (currentIndex === totalItems - 1) {
            setTimeout(() => {
                carouselInner.style.transition = 'none'; // Disable transition
                carouselInner.style.transform = 'translateX(0%)'; // Reset to the first image
                setTimeout(() => {
                    carouselInner.style.transition = 'transform 0.5s ease-in-out'; // Re-enable transition
                }, 50); // Small delay to allow the reset to take effect
            }, 500); // Wait for the slide animation to finish
        }
    }

    // Add event listeners to the buttons
    prevButton.addEventListener('click', moveToPrevSlide);
    nextButton.addEventListener('click', moveToNextSlide);

    // Auto-slide every 3 seconds
    setInterval(moveToNextSlide, 5000);
});