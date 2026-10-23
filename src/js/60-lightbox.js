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
