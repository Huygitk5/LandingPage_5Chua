// Hiện dần khi cuộn tới và số đếm lên. Tắt khi người dùng bật "giảm chuyển động".
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canObserve = 'IntersectionObserver' in window;

function setupReveal() {
  const targets = [...document.querySelectorAll('[data-reveal]')];
  for (const group of document.querySelectorAll('[data-stagger]')) {
    [...group.children].forEach((child, i) => {
      child.dataset.delay = i;
      targets.push(child);
    });
  }
  if (reduceMotion || !canObserve) return; // không thêm .reveal thì nội dung hiện sẵn

  for (const node of targets) {
    node.classList.add('reveal');
    node.style.transitionDelay = `${(Number(node.dataset.delay) || 0) * 90}ms`;
  }

  // Hiện xong thì gỡ lớp .reveal để hover và các hiệu ứng khác của phần tử hoạt động bình thường.
  const finish = (node) => {
    node.classList.remove('reveal', 'is-visible');
    node.style.transitionDelay = '';
  };

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const node = entry.target;
      io.unobserve(node);
      node.classList.add('is-visible');
      node.addEventListener('transitionend', (e) => {
        if (e.propertyName === 'opacity') finish(node);
      }, { once: true });
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  targets.forEach((node) => io.observe(node));
}

function renderCount(node, value) {
  node.textContent = `${Math.round(value)}${node.dataset.suffix || ''}`;
}

function animateCount(node, target) {
  const start = performance.now();
  const duration = 1200;
  const tick = (now) => {
    const t = Math.min((now - start) / duration, 1);
    renderCount(node, target * (1 - (1 - t) ** 3)); // ease-out
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function setupCounters() {
  const nodes = [...document.querySelectorAll('[data-count]')];
  const targetOf = (node) => (node.dataset.count === 'products' ? PRODUCTS.length : Number(node.dataset.count));

  for (const node of nodes) renderCount(node, targetOf(node)); // giá trị cuối cùng
  if (reduceMotion || !canObserve) return;

  for (const node of nodes) renderCount(node, 0);
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      io.unobserve(entry.target);
      animateCount(entry.target, targetOf(entry.target));
    }
  }, { threshold: 0.6 });
  nodes.forEach((node) => io.observe(node));
}

setupReveal();
setupCounters();
