// Menu di động, đổ bóng header khi cuộn, năm ở chân trang.
const headerEl = document.getElementById('site-header');
const navEl = document.getElementById('site-nav');
const navToggle = document.getElementById('nav-toggle');

function setNav(open) {
  navEl.classList.toggle('is-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
}

navToggle.addEventListener('click', () => setNav(navToggle.getAttribute('aria-expanded') !== 'true'));
navEl.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });

const syncHeader = () => headerEl.classList.toggle('is-scrolled', window.scrollY > 8);
window.addEventListener('scroll', syncHeader, { passive: true });
syncHeader();

document.getElementById('year').textContent = new Date().getFullYear();
