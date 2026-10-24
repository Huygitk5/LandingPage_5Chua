// Tô sáng mục menu của section đang xem (section nào đã cuộn qua 40% chiều cao màn hình thì tính là đang xem).
const spyLinks = [...navEl.querySelectorAll('a[href^="#"]')];
const spySections = spyLinks.map((a) => document.getElementById(a.getAttribute('href').slice(1)));
let spyQueued = false;

function syncSpy() {
  spyQueued = false;
  const line = window.innerHeight * 0.4;
  let current = -1;
  spySections.forEach((section, i) => {
    if (section && section.getBoundingClientRect().top <= line) current = i;
  });
  spyLinks.forEach((a, i) => {
    a.classList.toggle('is-active', i === current);
    if (i === current) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  });
}

window.addEventListener('scroll', () => {
  if (spyQueued) return;
  spyQueued = true;
  requestAnimationFrame(syncSpy);
}, { passive: true });
syncSpy();
