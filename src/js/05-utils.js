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
