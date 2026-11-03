// Đường bay của ong: nối nút lục giác của chương đầu và chương cuối, vẽ dần theo nhịp cuộn.
// Không có JS thì --progress mặc định 1 (CSS) nên đường hiện đầy đủ.
const storyEl = document.getElementById('story');
const pathEl = document.getElementById('flight-path');
const pathNodes = storyEl ? [...storyEl.querySelectorAll('.chapter-node')] : [];
let pathQueued = false;

function syncPath() {
  pathQueued = false;
  if (reducedMotion.matches) {
    pathEl.style.setProperty('--progress', '1');
    return;
  }
  const rect = pathEl.getBoundingClientRect();
  const line = window.innerHeight * 0.6;
  const progress = rect.height > 0 ? Math.min(1, Math.max(0, (line - rect.top) / rect.height)) : 1;
  pathEl.style.setProperty('--progress', progress.toFixed(4));
}

function layoutPath() {
  const base = storyEl.getBoundingClientRect().top;
  const centerOf = (node) => {
    const r = node.getBoundingClientRect();
    return r.top + r.height / 2 - base;
  };
  const top = centerOf(pathNodes[0]);
  pathEl.style.top = `${top}px`;
  pathEl.style.height = `${centerOf(pathNodes[pathNodes.length - 1]) - top}px`;
  syncPath();
}

if (pathEl && pathNodes.length > 1) {
  window.addEventListener('scroll', () => {
    if (pathQueued) return;
    pathQueued = true;
    requestAnimationFrame(syncPath);
  }, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(layoutPath).observe(storyEl);
  else window.addEventListener('resize', layoutPath);
  if (document.fonts) document.fonts.ready.then(layoutPath);
  layoutPath();
}
