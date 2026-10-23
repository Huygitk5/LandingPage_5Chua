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
