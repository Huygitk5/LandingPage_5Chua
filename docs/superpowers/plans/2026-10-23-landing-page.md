# Landing page Năm Chùa — Implementation Plan

> Spec: `docs/superpowers/specs/2026-10-23-landing-page-design.md`

**Goal:** Landing page một trang cho Năm Chùa, mã nguồn chia theo từng section, ghép bằng script build, host GitHub Pages.

**Architecture:** Mỗi section là một partial HTML riêng (`src/sections/NN-*.html`) kèm CSS riêng (`src/css/NN-*.css`). `build.mjs` ghép partial vào `src/layout.html` theo marker `<!-- @include ... -->`, thay biến `{{key}}` từ `src/site.json`, gộp CSS và JS. Kết quả xuất ra thư mục gốc để GitHub Pages phục vụ.

**Tech Stack:** HTML/CSS/JS thuần, Node 20 (chỉ dùng để build và test, không có dependency).

## Global Constraints
- Tiếng Việt, mobile-first (360 px trở lên), font Be Vietnam Pro + Lora.
- Màu: vàng mật ong, xanh lá đậm, nền kem.
- Không có section đánh giá khách hàng. Không bịa giá hay thông tin: giá trống thì hiện "Liên hệ báo giá".
- Bột nghệ chỉ ghi nguồn "công ty sản xuất", không ghi "thu hoạch tại vườn".
- SĐT/Zalo/email/địa chỉ chỉ khai báo một lần trong `src/site.json`.

## File Structure
```
src/
  layout.html           khung trang, chỉ chứa marker include
  site.json             biến dùng chung ({{phone}}, {{zalo}}, ...)
  sections/01-header … 09-footer .html
  css/00-base.css, 01-header.css … 09-footer.css
  js/00-config.js, 10-products-data.js, 20-products.js, 30-order-form.js, 40-nav.js
build.mjs               ghép src → index.html, assets/styles.css, assets/app.js
tests/build.test.mjs    kiểm tra kết quả build
assets/img/             ảnh
```
Output (commit lên git): `index.html`, `assets/styles.css`, `assets/app.js`.

## Tasks
1. **Build system + test**: `build.mjs`, `site.json`, `tests/build.test.mjs` (không còn marker `@include` / `{{`, đủ id section, mọi đường dẫn local tồn tại). Chạy `node --test`.
2. **Base + header + hero + trust**: CSS token, partial, nav di động.
3. **About + products**: dữ liệu trong `10-products-data.js`, render và tab lọc trong `20-products.js`.
4. **Why-us + how-to-order + contact + footer**: form, nút nổi, Google Maps.
5. **Form logic**: `30-order-form.js` (điền sẵn từ nút Đặt mua, gửi Formspree, dự phòng Zalo).
6. **SEO + ảnh**: meta, Open Graph, JSON-LD, sitemap, robots, nén ảnh WebP.
7. **Kiểm thử + deploy**: chạy test, kiểm tra trình duyệt ở 360/768/1280 px, hướng dẫn đẩy GitHub Pages.

## Chờ người dùng cung cấp
Giá và ảnh hoa lan, cacao giống, bòn bon giống; danh sách loại lan; xác nhận số Zalo; endpoint Formspree (điền vào `src/js/00-config.js`).
