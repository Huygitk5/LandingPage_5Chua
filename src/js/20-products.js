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
