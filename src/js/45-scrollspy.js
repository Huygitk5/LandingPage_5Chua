// Tô sáng mục menu và cột chương của chương đang xem
// (chương nào đã cuộn qua 40% chiều cao màn hình thì tính là đang xem).
const railEl = document.getElementById('chapter-rail');
const spyLinks = [...navEl.querySelectorAll('a[href^="#"]'), ...(railEl ? railEl.querySelectorAll('a[href^="#"]') : [])];
const spySections = [...new Set(spyLinks.map((a) => a.getAttribute('href').slice(1)))]
  .map((id) => document.getElementById(id))
  .filter(Boolean);
let spyQueued = false;

function syncSpy() {
  spyQueued = false;
  const line = window.innerHeight * 0.4;
  let currentId = null;
  for (const section of spySections) {
    if (section.getBoundingClientRect().top <= line) currentId = section.id;
  }
  for (const a of spyLinks) {
    const active = a.getAttribute('href') === `#${currentId}`;
    a.classList.toggle('is-active', active);
    if (active) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  }
  if (railEl) railEl.classList.toggle('is-visible', currentId !== null);
}

window.addEventListener('scroll', () => {
  if (spyQueued) return;
  spyQueued = true;
  requestAnimationFrame(syncSpy);
}, { passive: true });
syncSpy();
