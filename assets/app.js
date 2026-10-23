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
    image: PLACEHOLDER_IMG, imageAlt: 'Lan hồ điệp',
    desc: 'Liên hệ để xem các loại đang có và nhận báo giá.', inStock: true,
  },
  {
    id: 'lan-rung', group: 'hoa-lan', name: 'Lan rừng', spec: 'Nhiều loại', price: null,
    image: PLACEHOLDER_IMG, imageAlt: 'Lan rừng',
    desc: 'Liên hệ để xem các loại đang có và nhận báo giá.', inStock: true,
  },
  {
    id: 'cacao-giong', group: 'cay-giong', name: 'Cây cacao giống', spec: 'Cây giống', price: null,
    image: PLACEHOLDER_IMG, imageAlt: 'Cây cacao giống',
    desc: 'Liên hệ để biết giống, kích cỡ cây và báo giá theo số lượng.', inStock: true,
  },
  {
    id: 'bon-bon-giong', group: 'cay-giong', name: 'Cây bòn bon giống', spec: 'Cây giống', price: null,
    image: PLACEHOLDER_IMG, imageAlt: 'Cây bòn bon giống',
    desc: 'Liên hệ để biết giống, kích cỡ cây và báo giá theo số lượng.', inStock: true,
  },
];

/* 20-products.js */
// Hiển thị tab nhóm sản phẩm và các thẻ sản phẩm.
const tabsEl = document.getElementById('product-tabs');
const gridEl = document.getElementById('product-grid');
let activeGroup = PRODUCT_GROUPS[0].id;

function productCard(product) {
  const price = formatPrice(product.price);

  const media = el('div', { class: 'product-media' }, [
    el('img', {
      src: product.image, alt: product.imageAlt || product.name,
      width: 904, height: 1130, loading: 'lazy',
    }),
    el('span', { class: product.inStock ? 'product-badge' : 'product-badge is-out' },
      product.inStock ? 'Còn hàng' : 'Hết hàng'),
  ]);

  const orderBtn = el('button', { class: 'btn btn-primary', type: 'button', 'data-order': product.id },
    product.inStock ? 'Đặt mua' : 'Hỏi hàng');

  const body = el('div', { class: 'product-body' }, [
    el('h3', {}, product.name),
    el('p', { class: 'product-spec' }, product.spec),
    el('p', { class: 'product-desc' }, product.desc),
    el('p', { class: price ? 'product-price' : 'product-price is-quote' }, price ? `${price} / ${product.spec}` : 'Liên hệ báo giá'),
    orderBtn,
  ]);

  return el('article', { class: 'product-card' }, [media, body]);
}

function renderGrid() {
  gridEl.setAttribute('aria-labelledby', `tab-${activeGroup}`);
  gridEl.replaceChildren(...PRODUCTS.filter((p) => p.group === activeGroup).map(productCard));
}

function setGroup(groupId, focus) {
  activeGroup = groupId;
  for (const tab of tabsEl.children) {
    const selected = tab.dataset.group === groupId;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && focus) tab.focus();
  }
  renderGrid();
}

function renderTabs() {
  tabsEl.replaceChildren(...PRODUCT_GROUPS.map((group) =>
    el('button', {
      class: 'tab', type: 'button', role: 'tab', id: `tab-${group.id}`, 'data-group': group.id,
    }, group.label)));

  tabsEl.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (tab) setGroup(tab.dataset.group);
  });

  // Phím mũi tên chuyển tab (chuẩn ARIA tabs)
  tabsEl.addEventListener('keydown', (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    const ids = PRODUCT_GROUPS.map((g) => g.id);
    const next = (ids.indexOf(activeGroup) + step + ids.length) % ids.length;
    setGroup(ids[next], true);
    e.preventDefault();
  });
}

gridEl.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-order]');
  if (btn) selectProduct(btn.dataset.order);
});

renderTabs();
setGroup(activeGroup);

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

})();
