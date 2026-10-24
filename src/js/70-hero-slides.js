// Ảnh ở hero tự chuyển sau mỗi 2 giây. Dừng khi rê chuột, khi tab bị ẩn, hoặc khi người dùng bật "giảm chuyển động".
const slidesEl = document.getElementById('hero-slides');
const slideImgs = [...slidesEl.querySelectorAll('.hero-slide')];
const SLIDE_MS = 2000;
let slideIndex = 0;
let slideTimer = null;

const slideDots = slideImgs.map(() => el('span', { class: 'hero-dot' }));
slidesEl.append(el('div', { class: 'hero-dots', 'aria-hidden': 'true' }, slideDots));

function showSlide(index) {
  slideIndex = (index + slideImgs.length) % slideImgs.length;
  slideImgs.forEach((img, i) => img.classList.toggle('is-active', i === slideIndex));
  slideDots.forEach((dot, i) => dot.classList.toggle('is-active', i === slideIndex));
}

function startSlides() {
  if (slideTimer) return;
  slideTimer = setInterval(() => { if (!document.hidden) showSlide(slideIndex + 1); }, SLIDE_MS);
}

function stopSlides() {
  clearInterval(slideTimer);
  slideTimer = null;
}

showSlide(0);
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  startSlides();
  slidesEl.addEventListener('pointerenter', stopSlides);
  slidesEl.addEventListener('pointerleave', startSlides);
}
