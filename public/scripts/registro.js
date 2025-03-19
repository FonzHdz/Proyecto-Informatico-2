let currentIndex = 0;
const images = document.querySelectorAll('.carousel img');
const indicators = document.querySelectorAll('.carousel-indicators .indicator');

function updateCarousel() {
    images.forEach((img, index) => {
        img.style.transform = `translateX(-${100 * currentIndex}%)`;
    });
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentIndex);
    });
}

setInterval(() => {
    currentIndex = (currentIndex + 1) % images.length;
    updateCarousel();
}, 3000);

updateCarousel();