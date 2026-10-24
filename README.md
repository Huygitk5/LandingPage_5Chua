# Landing page Năm Chùa (5 CHÙA)

Trang bán mật ong, sữa ong chúa, tinh bột nghệ, hoa lan và cây cacao giống.

## Cấu trúc

Mã nguồn nằm trong `src/`, chia theo từng section. `build.mjs` ghép lại thành `index.html`, `assets/styles.css`, `assets/app.js` (các file này được commit để GitHub Pages phục vụ trực tiếp).

| Việc cần làm | Sửa file |
|---|---|
| SĐT, Zalo, email, địa chỉ, link Facebook, URL trang | `src/site.json` |
| Giá, ảnh, mô tả, thêm/bớt sản phẩm | `src/js/10-products-data.js` |
| Nội dung từng section | `src/sections/NN-*.html` |
| Kiểu dáng từng section | `src/css/NN-*.css` (cùng số thứ tự với section) |
| Gửi form về email (Formspree) | `formEndpoint` trong `src/js/00-config.js` |

Thêm section mới: tạo `src/sections/NN-ten.html`, thêm dòng `<!-- @include sections/NN-ten.html -->` vào `src/layout.html`, tạo `src/css/NN-ten.css`.

## Lệnh

```
npm run build   # ghép src/ -> index.html, assets/styles.css, assets/app.js
npm test        # build rồi kiểm tra kết quả
```

Chạy thử tại máy: `python -m http.server 8080` rồi mở http://127.0.0.1:8080/. Luôn chạy `npm run build` sau khi sửa trong `src/`.

## Đăng lên GitHub Pages

1. Đẩy toàn bộ thư mục này lên một repo GitHub.
2. Settings, Pages, Source: branch `main`, thư mục `/ (root)`.
3. Nếu URL khác `https://quochuy0811.github.io/MATONG/`, sửa `siteUrl` trong `src/site.json`, `sitemap.xml` và `robots.txt`, rồi build lại.

## Bật form gửi về email

1. Tạo form trên https://formspree.io (miễn phí), lấy địa chỉ dạng `https://formspree.io/f/xxxxxxxx`.
2. Điền vào `formEndpoint` trong `src/js/00-config.js`, chạy `npm run build`.

Khi để trống, form hiện nội dung đơn kèm nút Gọi, Zalo, Email để khách tự gửi.
