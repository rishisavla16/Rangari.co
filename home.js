document.addEventListener("DOMContentLoaded", () => {
    const carouselInner = document.querySelector('.carousel-inner');
    const carouselItems = document.querySelectorAll('.carousel-item');
    const prevBtn = document.querySelector('.carousel-button.prev');
    const nextBtn = document.querySelector('.carousel-button.next');
    let currentIndex = 0;
    let isAnimating = false;
    let isPaused = false;
    let autoSlide;
    const totalItems = carouselItems.length;

    // Create progress bar container
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    document.querySelector('.carousel').appendChild(progressContainer);

    // Function to reset progress bar
    function resetProgressBar() {
        progressContainer.innerHTML = '';
        const newProgress = document.createElement('div');
        newProgress.className = 'progress-bar';
        progressContainer.appendChild(newProgress);
        
        // Only animate if not paused
        if (!isPaused) {
            newProgress.style.animation = 'progress 5s linear';
        }
    }

    // Function to update carousel position
    function updateCarousel() {
        carouselInner.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    // Common animation handler
    function handleSlideTransition(newIndex) {
        if (isAnimating) return;
        isAnimating = true;

        carouselInner.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        currentIndex = newIndex;
        updateCarousel();

        // Reset progress bar immediately on slide change
        resetProgressBar();

        // Restart auto-slide interval
        clearInterval(autoSlide);
        autoSlide = setInterval(nextSlide, 5000);

        setTimeout(() => {
            // Handle infinite loop reset
            if (currentIndex === totalItems - 1) {
                carouselInner.style.transition = 'none';
                currentIndex = 0;
                updateCarousel();
                setTimeout(() => {
                    carouselInner.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                }, 50);
            }
            isAnimating = false;
        }, 600);
    }

    // Navigation functions
    function nextSlide() {
        handleSlideTransition((currentIndex + 1) % totalItems);
    }

    function prevSlide() {
        handleSlideTransition((currentIndex - 1 + totalItems) % totalItems);
    }

    // Auto-slide control
    function startAutoSlide() {
        autoSlide = setInterval(nextSlide, 5000);
        if (!isPaused) resetProgressBar();
    }

    function pauseAutoSlide() {
        clearInterval(autoSlide);
        const progress = document.querySelector('.progress-bar');
        if (progress) progress.style.animationPlayState = 'paused';
    }

    // Click handlers
    carouselInner.addEventListener('click', () => {
        isPaused = !isPaused;
        if (isPaused) {
            pauseAutoSlide();
        } else {
            startAutoSlide();
            const progress = document.querySelector('.progress-bar');
            if (progress) progress.style.animationPlayState = 'running';
        }
    });

    // Previous and Next button handlers
    prevBtn.addEventListener('click', () => {
        prevSlide();
        clearInterval(autoSlide); // Clear the existing interval
        autoSlide = setInterval(nextSlide, 5000); // Restart the interval
    });

    nextBtn.addEventListener('click', () => {
        nextSlide();
        clearInterval(autoSlide); // Clear the existing interval
        autoSlide = setInterval(nextSlide, 5000); // Restart the interval
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
    });

    // Initial setup
    resetProgressBar();
    startAutoSlide();
    setTimeout(() => {
        carouselInner.style.opacity = '1';
    }, 100);
});