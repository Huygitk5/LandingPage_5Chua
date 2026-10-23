# Landing page Năm Chùa (5 CHÙA) — Thiết kế

Ngày: 2026-10-23

## Mục tiêu
Landing page một trang bán mật ong, sữa ong chúa, tinh bột nghệ, hoa lan (hồ điệp, lan rừng, ...), cây cacao giống, cây bòn bon giống. Thông tin thương hiệu lấy từ https://quochuy0811.github.io/MATONG/.
Chuyển đổi chính: khách gọi, nhắn Zalo hoặc điền form đặt hàng. Không có giỏ hàng, không thanh toán online.

## Thông tin thương hiệu (nguồn: trang cũ)
- Tên: Năm Chùa (5 CHÙA). Slogan: "Chuyên mọi sản phẩm về ong", "Hân hạnh phục vụ quý khách", "Đảm bảo chất lượng 100% tự nhiên".
- Nuôi ong từ năm 1992.
- Địa chỉ: Tân Thiềng, Chợ Lách, Bến Tre.
- SĐT: 0975332882 (ưu tiên liên hệ qua điện thoại). Facebook: Hòa Đoàn Văn. Email: quochuydoan2005@gmail.com.
- Sản phẩm hiện có: mật ong 100.000đ/1 lít; sữa ong chúa 200.000đ/100 g; bột nghệ 70.000đ/hủ 100 g (công ty sản xuất, không phải tự trồng). Cả ba có ưu đãi mua số lượng lớn.
- Ảnh cũ: `intro1-3.jpg`, `matong.jpg`, `suaongchua.jpg`, `botnghe.jpg`, `map.jpg`.

## Công nghệ
HTML, CSS, JS thuần, không build, host GitHub Pages. Mobile-first.

```
MatOng/
├─ index.html
├─ css/styles.css
├─ js/products.js   (dữ liệu sản phẩm)
├─ js/main.js       (tab lọc, render thẻ, điền sẵn form, gửi form)
├─ assets/img/      (WebP đã nén)
├─ sitemap.xml, robots.txt
```

`products.js`: mảng `{ id, group, name, spec, price, image, desc, inStock }`. `price` rỗng thì hiện "Liên hệ báo giá". `group` thuộc `ong-nghe | hoa-lan | cay-giong`.

## Cấu trúc trang
1. Header cố định: logo, menu (Giới thiệu, Sản phẩm, Liên hệ), nút Gọi ngay.
2. Hero: tiêu đề, "Từ 1992 · 100% tự nhiên", CTA Gọi/Zalo và Xem sản phẩm.
3. Dải tin cậy: Từ 1992 / Thu hoạch tại vườn / 100% tự nhiên / Ưu đãi số lượng lớn.
4. Giới thiệu: câu chuyện nghề nuôi ong, 3 ảnh.
5. Sản phẩm: 3 tab (Từ ong và nghệ / Hoa lan / Cây giống). Thẻ gồm ảnh, tên, quy cách, giá, nút "Đặt mua" (cuộn xuống form và điền sẵn sản phẩm).
6. Vì sao chọn Năm Chùa: 4 điểm mạnh.
7. Cách đặt hàng: 3 bước.
8. Form đặt hàng và liên hệ: tên, SĐT, sản phẩm, số lượng, ghi chú; thông tin liên hệ; Google Maps nhúng.
9. Footer và nút Gọi/Zalo nổi (mobile).

Không có section đánh giá khách hàng (đã loại theo yêu cầu).

## Giao diện
- Màu: vàng mật ong (nhấn), xanh lá đậm, nền kem.
- Font: Be Vietnam Pro (thân bài), Lora (tiêu đề).
- Ảnh WebP, lazy-load, có thuộc tính alt tiếng Việt.

## Form và SEO
- Form gửi qua Formspree về email. Lỗi thì hiện nút dự phòng mở Zalo kèm nội dung đơn.
- Thẻ meta tiếng Việt, Open Graph, JSON-LD LocalBusiness, sitemap.

## Kiểm thử
- Lighthouse mobile trên 90 (Performance, SEO, Accessibility).
- Kiểm tra responsive 360, 768, 1280 px.
- Kiểm tra: link tel/Zalo/Facebook, nút Đặt mua điền sẵn form, gửi form thành công và lỗi, tab lọc.

## Các bước thực hiện
1. Khung trang và hệ thiết kế.
2. Giới thiệu, dải tin cậy, sản phẩm.
3. Form, liên hệ, bản đồ, nút nổi.
4. Tối ưu ảnh, SEO, kiểm thử.
5. Đẩy lên GitHub, bật Pages.

## Việc cần người dùng cung cấp
- Giá và ảnh thật của hoa lan, cacao giống, bòn bon giống (đã xác nhận có), kèm danh sách các loại lan bán.
- Số Zalo (có dùng chung 0975332882 không).
- Tài khoản Formspree (sẽ hướng dẫn tạo).
- Chính sách giao hàng và đổi trả (trang cũ không có; chưa có thì bỏ khối này).

## Ngoài phạm vi
Giỏ hàng, thanh toán online, đa ngôn ngữ, đánh giá khách hàng.
