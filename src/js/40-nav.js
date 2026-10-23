// Menu di động, header (đổ bóng, ẩn khi cuộn xuống), năm ở chân trang.
const headerEl = document.getElementById('site-header');
const navEl = document.getElementById('site-nav');
const navToggle = document.getElementById('nav-toggle');
const HIDE_AFTER = 240; // chỉ ẩn header khi đã cuộn qua ngần này px
let lastY = window.scrollY;

function setNav(open) {
  navEl.classList.toggle('is-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
  if (open) headerEl.classList.remove('is-hidden');
}

navToggle.addEventListener('click', () => setNav(navToggle.getAttribute('aria-expanded') !== 'true'));
navEl.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });
headerEl.addEventListener('focusin', () => headerEl.classList.remove('is-hidden'));

function syncHeader() {
  const y = window.scrollY;
  const menuOpen = navToggle.getAttribute('aria-expanded') === 'true';
  headerEl.classList.toggle('is-scrolled', y > 8);

  if (y < lastY - 4 || y <= HIDE_AFTER || menuOpen) {
    headerEl.classList.remove('is-hidden');
  } else if (y > lastY + 4) {
    headerEl.classList.add('is-hidden');
  }
  if (Math.abs(y - lastY) > 4) lastY = y;
}
window.addEventListener('scroll', syncHeader, { passive: true });
syncHeader();

document.getElementById('year').textContent = new Date().getFullYear();
