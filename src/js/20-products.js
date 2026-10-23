// Hiển thị tab nhóm sản phẩm và các thẻ sản phẩm.
const tabsEl = document.getElementById('product-tabs');
const gridEl = document.getElementById('product-grid');
let activeGroup = PRODUCT_GROUPS[0].id;

function productCard(product) {
  const price = formatPrice(product.price);

  const img = el('img', {
    src: product.image, alt: product.imageAlt || product.name,
    width: 904, height: 1130, loading: 'lazy',
  });
  // Ảnh thật bấm được để phóng to; ảnh tạm thì không.
  const picture = product.image === PLACEHOLDER_IMG
    ? img
    : el('button', {
      class: 'product-zoom', type: 'button', 'data-zoom': product.id,
      'aria-label': `Xem ảnh lớn: ${product.name}`,
    }, img);

  const media = el('div', { class: 'product-media' }, [
    picture,
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
