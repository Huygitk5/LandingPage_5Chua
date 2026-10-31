(function () {
'use strict';

/* 00-config.js */
// Cấu hình chung. Điền formEndpoint (Formspree) để form gửi thẳng về email.
// Ví dụ: 'https://formspree.io/f/abcdwxyz'. Để trống thì form hiện nội dung đơn kèm nút Gọi/Zalo/Email.
const CONFIG = {
  formEndpoint: '',
  brand: 'Năm Chùa',
  phone: '0975332882',
  phoneIntl: '+84975332882',
  zalo: '0975332882',
  email: 'quochuydoan2005@gmail.com',
};

/* 05-utils.js */
// Tạo phần tử DOM: el('div', { class: 'x', 'data-id': 1 }, 'text' | node | [con...])
function el(tag, attrs, children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value === false || value == null) continue;
    node.setAttribute(key, value === true ? '' : value);
  }
  for (const child of [].concat(children == null ? [] : children)) {
    if (child == null || child === false) continue; // cho phép viết cond ? el(...) : null
    node.append(child);
  }
  return node;
}

// 100000 -> "100.000đ"; null/undefined -> null
function formatPrice(value) {
  return typeof value === 'number' ? `${value.toLocaleString('vi-VN')}đ` : null;
}

/* 10-products-data.js */
// Dữ liệu sản phẩm. Đổi giá, ảnh, mô tả ở đây, sau đó chạy: node build.mjs
// price: số (đồng) hoặc null để hiện "Liên hệ báo giá".
// image: đường dẫn ảnh; chưa có ảnh thật thì dùng PLACEHOLDER_IMG.
const PLACEHOLDER_IMG = 'assets/img/placeholder.svg';

const PRODUCT_GROUPS = [
  { id: 'ong-nghe', label: 'Từ ong và nghệ' },
  { id: 'hoa-lan', label: 'Hoa lan' },
  { id: 'cay-giong', label: 'Cây giống' },
];

const PRODUCTS = [
  {
    id: 'mat-ong', group: 'ong-nghe', name: 'Mật ong', spec: '1 lít', price: 100000,
    image: 'assets/img/matong.webp', imageAlt: 'Hai chai mật ong nguyên chất của Năm Chùa',
    desc: 'Nuôi và thu hoạch tại vườn. Cam kết chất lượng.', inStock: true,
  },
  {
    id: 'sua-ong-chua', group: 'ong-nghe', name: 'Sữa ong chúa', spec: '100 gram', price: 200000,
    image: 'assets/img/suaongchua.webp', imageAlt: 'Các hũ sữa ong chúa nguyên chất',
    desc: 'Nuôi và thu hoạch tại vườn. Cam kết chất lượng.', inStock: true,
  },
  {
    id: 'tinh-bot-nghe', group: 'ong-nghe', name: 'Tinh bột nghệ', spec: '1 hũ (100 gram)', price: 70000,
    image: 'assets/img/botnghe.webp', imageAlt: 'Các hũ tinh bột nghệ',
    desc: 'Sản phẩm của công ty sản xuất lớn. Cam kết chất lượng.', inStock: true,
  },
  {
    id: 'lan-ho-diep', group: 'hoa-lan', name: 'Lan hồ điệp', spec: 'Nhiều màu, nhiều kích cỡ', price: null,
    image: 'assets/img/lanhodiep.webp', imageAlt: 'Lan hồ điệp hoa trắng viền tím',
    desc: 'Liên hệ để xem các loại đang có và nhận báo giá.', inStock: true,
  },
  {
    id: 'lan-cat', group: 'hoa-lan', name: 'Lan cát', spec: 'Nhiều màu', price: null,
    image: 'assets/img/lancat.webp', imageAlt: 'Lan cát hoa màu cam',
    desc: 'Liên hệ để xem các loại đang có và nhận báo giá.', inStock: true,
  },
  {
    id: 'lan-dendro', group: 'hoa-lan', name: 'Lan dendro', spec: 'Nhiều màu', price: null,
    image: 'assets/img/landendro.webp', imageAlt: 'Lan dendro hoa xanh viền tím',
    desc: 'Liên hệ để xem các loại đang có và nhận báo giá.', inStock: true,
  },
  {
    id: 'lan-rung-tim', group: 'hoa-lan', name: 'Lan rừng tím', spec: 'Hoa màu tím', price: null,
    image: 'assets/img/lanrungtim.webp', imageAlt: 'Lan rừng hoa màu tím',
    desc: 'Liên hệ để xem các loại đang có và nhận báo giá.', inStock: true,
  },
  {
    id: 'lan-rung-trang', group: 'hoa-lan', name: 'Lan rừng trắng', spec: 'Hoa màu trắng', price: null,
    image: 'assets/img/lanrungtrang.webp', imageAlt: 'Lan rừng hoa màu trắng',
    desc: 'Liên hệ để xem các loại đang có và nhận báo giá.', inStock: true,
  },
  {
    id: 'cacao-giong', group: 'cay-giong', name: 'Cây cacao giống', spec: 'Cây giống', price: null,
    image: 'assets/img/cacao.webp', imageAlt: 'Vườn ươm cây cacao giống',
    desc: 'Liên hệ để biết giống, kích cỡ cây và báo giá theo số lượng.', inStock: true,
  },
];

/* 20-products.js */
// Hiển thị tab nhóm sản phẩm và các thẻ sản phẩm.
const tabsEl = document.getElementById('product-tabs');
const gridEl = document.getElementById('product-grid');
let activeGroup = PRODUCT_GROUPS[0].id;
const ASK_LABEL = 'Hỏi giá qua Zalo';

// Zalo không cho điền sẵn tin nhắn qua link, nên chép sẵn vào clipboard để khách dán vào ô chat.
function copyAskMessage(link, product) {
  const text = `Chào ${CONFIG.brand}, tôi muốn hỏi giá ${product.name}.`;
  navigator.clipboard?.writeText(text).then(() => {
    link.textContent = 'Đã chép tin nhắn, dán vào Zalo';
    setTimeout(() => { link.textContent = ASK_LABEL; }, 4000);
  }).catch(() => {}); // không chép được thì khách tự gõ, link vẫn mở Zalo bình thường
}

function productCard(product) {
  const price = formatPrice(product.price);

  const img = el('img', {
    src: product.image, alt: product.imageAlt || product.name,
    width: 800, height: 800, loading: 'lazy',
  });
  // Ảnh thật bấm được để phóng to; ảnh tạm thì không.
  const picture = product.image === PLACEHOLDER_IMG
    ? img
    : el('button', {
      class: 'product-zoom', type: 'button', 'data-zoom': product.id,
      'aria-label': `Xem ảnh lớn: ${product.name}`,
    }, img);

  // Chỉ gắn nhãn khi hết hàng; còn hàng là trạng thái mặc định nên không cần nhãn.
  const media = el('div', { class: 'product-media' }, [
    picture,
    product.inStock ? null : el('span', { class: 'product-badge' }, 'Hết hàng'),
  ]);

  const orderBtn = el('button', {
    class: price ? 'btn btn-primary' : 'link-btn', type: 'button', 'data-order': product.id,
  }, product.inStock ? 'Đặt mua' : 'Hỏi hàng');

  // Chưa có giá thì nút chính là hỏi giá qua Zalo; "Đặt mua" chỉ còn là link chữ phụ.
  const actions = el('div', { class: 'product-actions' }, price ? [orderBtn] : [
    el('a', {
      class: 'btn btn-primary', href: `https://zalo.me/${CONFIG.zalo}`, target: '_blank', rel: 'noopener',
      'data-ask': product.id,
    }, ASK_LABEL),
    orderBtn,
  ]);

  // Giá nằm ngay dưới tên. Có giá thì quy cách đi kèm giá; chưa có giá thì hiện lời mời báo giá.
  const priceLine = price
    ? el('p', { class: 'product-price' }, [price, el('span', {}, ` / ${product.spec}`)])
    : el('p', { class: 'product-price is-quote' }, 'Liên hệ báo giá');

  const body = el('div', { class: 'product-body' }, [
    el('h3', {}, product.name),
    priceLine,
    price ? null : el('p', { class: 'product-spec' }, product.spec),
    el('p', { class: 'product-desc' }, product.desc),
    actions,
  ]);

  return el('article', { class: 'product-card' }, [media, body]);
}

// Hai nút mũi tên: mỗi lần cuộn một thẻ; hết chỗ cuộn thì khóa nút.
const prevBtn = document.getElementById('products-prev');
const nextBtn = document.getElementById('products-next');

function updateArrows() {
  prevBtn.disabled = gridEl.scrollLeft <= 1;
  nextBtn.disabled = gridEl.scrollLeft + gridEl.clientWidth >= gridEl.scrollWidth - 1;
}

function scrollCards(direction) {
  const card = gridEl.firstElementChild;
  if (!card) return;
  const step = card.getBoundingClientRect().width + parseFloat(getComputedStyle(gridEl).columnGap || 0);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  gridEl.scrollBy({ left: direction * step, behavior: reduce ? 'auto' : 'smooth' });
}

prevBtn.addEventListener('click', () => scrollCards(-1));
nextBtn.addEventListener('click', () => scrollCards(1));
gridEl.addEventListener('scroll', updateArrows, { passive: true });
if ('ResizeObserver' in window) new ResizeObserver(updateArrows).observe(gridEl);
else window.addEventListener('resize', updateArrows);

function renderGrid(animate) {
  gridEl.setAttribute('aria-labelledby', `tab-${activeGroup}`);
  const cards = PRODUCTS.filter((p) => p.group === activeGroup).map(productCard);
  if (animate) {
    cards.forEach((card, i) => {
      card.classList.add('card-in');
      card.style.setProperty('--i', i);
    });
  }
  gridEl.replaceChildren(...cards);
  gridEl.scrollLeft = 0;
  updateArrows();
}

// animate: chỉ bật khi người dùng đổi tab (lần hiển thị đầu tiên do hiệu ứng cuộn lo).
function setGroup(groupId, focus, animate) {
  activeGroup = groupId;
  for (const tab of tabsEl.children) {
    const selected = tab.dataset.group === groupId;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && focus) tab.focus();
  }
  renderGrid(animate);
}

function renderTabs() {
  tabsEl.replaceChildren(...PRODUCT_GROUPS.map((group) =>
    el('button', {
      class: 'tab', type: 'button', role: 'tab', id: `tab-${group.id}`, 'data-group': group.id,
    }, group.label)));

  tabsEl.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (tab) setGroup(tab.dataset.group, false, true);
  });

  // Phím mũi tên chuyển tab (chuẩn ARIA tabs)
  tabsEl.addEventListener('keydown', (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    const ids = PRODUCT_GROUPS.map((g) => g.id);
    const next = (ids.indexOf(activeGroup) + step + ids.length) % ids.length;
    setGroup(ids[next], true, true);
    e.preventDefault();
  });
}

gridEl.addEventListener('click', (e) => {
  const askLink = e.target.closest('[data-ask]');
  if (askLink) {
    copyAskMessage(askLink, PRODUCTS.find((p) => p.id === askLink.dataset.ask));
    return; // không chặn link: vẫn mở Zalo
  }
  const orderBtn = e.target.closest('[data-order]');
  if (orderBtn) {
    selectProduct(orderBtn.dataset.order);
    return;
  }
  const zoomBtn = e.target.closest('[data-zoom]');
  if (zoomBtn) {
    const product = PRODUCTS.find((p) => p.id === zoomBtn.dataset.zoom);
    const price = formatPrice(product.price);
    openLightbox({
      src: product.image, alt: product.imageAlt, title: product.name,
      meta: price ? `${price} / ${product.spec}` : `${product.spec} · Liên hệ báo giá`,
      productId: product.id,
    });
  }
});

renderTabs();
setGroup(activeGroup, false, false);

/* 30-order-form.js */
// Phiếu đặt hàng: điền sẵn sản phẩm, kiểm tra dữ liệu, gửi Formspree hoặc hiện phương án dự phòng.
const formEl = document.getElementById('order-form');
const productSelect = document.getElementById('f-product');
const errorEl = document.getElementById('form-error');
const resultEl = document.getElementById('form-result');
const submitBtn = document.getElementById('form-submit');
const OTHER_VALUE = 'Sản phẩm khác (ghi ở phần ghi chú)';

function fillProductSelect() {
  productSelect.append(el('option', { value: '' }, '-- Chọn sản phẩm --'));
  for (const group of PRODUCT_GROUPS) {
    productSelect.append(el('optgroup', { label: group.label },
      PRODUCTS.filter((p) => p.group === group.id).map((p) => el('option', { value: p.name }, p.name))));
  }
  productSelect.append(el('option', { value: OTHER_VALUE }, OTHER_VALUE));
}

// Gọi từ nút "Đặt mua" trên thẻ sản phẩm.
function selectProduct(id) {
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) return;
  productSelect.value = product.name;
  hideResult();
  formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.getElementById('f-name').focus({ preventScroll: true });
}

function normalizePhone(raw) {
  return raw.replace(/[\s.\-()]/g, '');
}

function validate(data) {
  const problems = [];
  if (!data.name.trim()) problems.push(['name', 'Vui lòng nhập họ và tên.']);
  if (!/^(0|\+84)\d{9,10}$/.test(normalizePhone(data.phone))) problems.push(['phone', 'Số điện thoại chưa đúng, ví dụ 0912345678.']);
  if (!data.product) problems.push(['product', 'Vui lòng chọn sản phẩm.']);
  if (!data.quantity.trim()) problems.push(['quantity', 'Vui lòng nhập số lượng.']);
  return problems;
}

function orderText(data) {
  return [
    `Đặt hàng ${CONFIG.brand}`,
    `Họ tên: ${data.name.trim()}`,
    `SĐT: ${normalizePhone(data.phone)}`,
    `Sản phẩm: ${data.product}`,
    `Số lượng: ${data.quantity.trim()}`,
    data.note.trim() ? `Ghi chú: ${data.note.trim()}` : null,
  ].filter(Boolean).join('\n');
}

function hideResult() {
  resultEl.hidden = true;
  resultEl.replaceChildren();
  resultEl.className = 'form-result';
}

function showSuccess() {
  resultEl.className = 'form-result is-success';
  resultEl.replaceChildren(el('p', {}, `Đã gửi phiếu đặt hàng. ${CONFIG.brand} sẽ gọi lại xác nhận với quý khách sớm nhất. Xin cảm ơn!`));
  resultEl.hidden = false;
}

// Dự phòng khi chưa cấu hình Formspree hoặc gửi lỗi: quý khách tự gửi đơn qua Gọi / Zalo / Email.
function showFallback(text, reason) {
  const mailto = `mailto:${CONFIG.email}?subject=${encodeURIComponent(`Đặt hàng ${CONFIG.brand}`)}&body=${encodeURIComponent(text)}`;
  const copyBtn = el('button', { class: 'btn btn-outline', type: 'button' }, 'Sao chép nội dung');
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = 'Đã sao chép';
    } catch {
      copyBtn.textContent = 'Không sao chép được';
    }
  });

  resultEl.className = 'form-result';
  resultEl.replaceChildren(
    el('p', {}, reason),
    el('pre', {}, text),
    el('div', { class: 'result-actions' }, [
      el('a', { class: 'btn btn-accent', href: `tel:${CONFIG.phoneIntl}` }, `Gọi ${CONFIG.phone}`),
      el('a', { class: 'btn btn-primary', href: `https://zalo.me/${CONFIG.zalo}`, target: '_blank', rel: 'noopener' }, 'Nhắn Zalo'),
      el('a', { class: 'btn btn-outline', href: mailto }, 'Gửi email'),
      copyBtn,
    ]),
  );
  resultEl.hidden = false;
}

async function submitOrder(data) {
  const text = orderText(data);
  if (!CONFIG.formEndpoint) {
    showFallback(text, 'Phiếu đã được soạn sẵn. Quý khách vui lòng gửi qua một trong các cách dưới đây để chốt đơn:');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Đang gửi...';
  try {
    const res = await fetch(CONFIG.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: data.name.trim(), phone: normalizePhone(data.phone), product: data.product,
        quantity: data.quantity.trim(), note: data.note.trim(), message: text, _gotcha: data._gotcha,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    showSuccess();
    formEl.reset();
  } catch {
    showFallback(text, 'Chưa gửi được phiếu qua mạng. Quý khách vui lòng gửi trực tiếp qua một trong các cách dưới đây:');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Gửi phiếu đặt hàng';
  }
}

formEl.addEventListener('submit', (e) => {
  e.preventDefault();
  hideResult();
  const raw = Object.fromEntries(new FormData(formEl));
  const data = {
    name: raw.name || '', phone: raw.phone || '', product: raw.product || '',
    quantity: raw.quantity || '', note: raw.note || '', _gotcha: raw._gotcha || '',
  };

  for (const field of formEl.elements) field.classList?.remove('is-invalid');
  const problems = validate(data);
  if (problems.length) {
    errorEl.textContent = problems.map(([, msg]) => msg).join(' ');
    errorEl.hidden = false;
    for (const [name] of problems) formEl.elements[name].classList.add('is-invalid');
    formEl.elements[problems[0][0]].focus();
    return;
  }
  errorEl.hidden = true;

  if (data._gotcha) return; // bot điền ô ẩn: bỏ qua im lặng
  submitOrder(data);
});

fillProductSelect();

/* 40-nav.js */
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

/* 45-scrollspy.js */
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

/* 50-reveal.js */
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

/* 60-lightbox.js */
// Cửa sổ xem ảnh lớn (thẻ <dialog>): ảnh sản phẩm và ảnh giới thiệu.
const lightboxEl = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
const lbTitle = document.getElementById('lb-title');
const lbMeta = document.getElementById('lb-meta');
const lbOrder = document.getElementById('lb-order');
let lbProductId = null;

// productId có thì hiện nút "Đặt mua" cho sản phẩm đó.
function openLightbox({ src, alt, title, meta, productId }) {
  lbImg.src = src;
  lbImg.alt = alt || title || '';
  lbTitle.textContent = title || '';
  lbMeta.textContent = meta || '';
  lbProductId = productId || null;
  lbOrder.hidden = !lbProductId;
  lightboxEl.showModal();
}

lightboxEl.addEventListener('click', (e) => {
  if (e.target === lightboxEl) lightboxEl.close(); // bấm vùng nền tối
});
document.getElementById('lb-close').addEventListener('click', () => lightboxEl.close());
lbOrder.addEventListener('click', () => {
  const id = lbProductId;
  lightboxEl.close();
  selectProduct(id);
});

for (const img of document.querySelectorAll('.about-photos img')) {
  img.tabIndex = 0;
  img.setAttribute('role', 'button');
  const open = () => openLightbox({ src: img.currentSrc || img.src, alt: img.alt, title: img.alt });
  img.addEventListener('click', open);
  img.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  });
}

/* 70-hero-video.js */
// Video hero: tự phát khi đang nhìn thấy, tạm dừng khi cuộn khỏi màn hình.
// Người dùng bật "giảm chuyển động" thì chỉ thấy ảnh poster.
const heroVideo = document.getElementById('hero-video');
if (heroVideo) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let heroInView = true;

  const syncHeroVideo = () => {
    if (reduceMotion.matches || !heroInView) heroVideo.pause();
    else heroVideo.play().catch(() => {}); // trình duyệt chặn tự phát thì giữ poster
  };

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      heroInView = entry.isIntersecting;
      syncHeroVideo();
    }).observe(heroVideo);
  }
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', syncHeroVideo);
  syncHeroVideo();
}

/* 99-ready.js */
// Báo cho script trong <head> biết app.js đã chạy xong (không cần bật chế độ hiện hết nội dung).
window.__appReady = true;

})();
