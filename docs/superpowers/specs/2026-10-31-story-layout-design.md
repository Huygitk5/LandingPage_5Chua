# Năm Chùa — Trang kể chuyện theo chương (hướng A)

Ngày: 2026-10-31
Tham khảo: motionsites.ai (mẫu Honey Bee, Meadowbell, Saffron Field, Freight Scroll Hero).

## Vấn đề
Trang hiện tại đổi màu nền 8 lần liên tiếp (kem → xanh lá → trắng → kem → xanh nhạt → xanh đậm → kem → xanh đậm), mỗi phần một khung riêng, có viền sóng chen giữa. Người dùng thấy "rời rạc" ở hình thức, không phải ở nội dung.

## Mục tiêu
Một trang đọc liền mạch như một câu chuyện: mở đầu toàn màn hình, rồi 4 chương trên cùng một nền, nối với nhau bằng một sợi chỉ thị giác (đường bay của ong) và số chương. Giữ nguyên mọi chức năng bán hàng (gọi, Zalo, tab sản phẩm, băng chuyền, phiếu đặt hàng, lightbox).

## Không làm
Không bịa thông tin mới (nhận xét khách, chính sách giao hàng, giờ mở cửa). Không thêm thư viện JS. Không có phần đánh giá khách hàng (đã loại theo yêu cầu trong spec 2026-10-23).

## 1. Bố cục

| Phần | id | Nội dung | Lấy từ |
|---|---|---|---|
| Mở đầu | `trang-chu` | Cao bằng màn hình. Dòng nhỏ, tiêu đề, đoạn dẫn, nút Gọi/Zalo, dòng 3 ý: "Từ 1992 · Thu hoạch tại vườn · Ưu đãi mua sỉ". Video. | Hero + dải cam kết |
| 01 Vườn ong | `gioi-thieu` | Câu chuyện, 2 ảnh lục giác, 3 con số, 4 lý do (danh sách gọn: biểu tượng + tiêu đề + 1 câu) | Giới thiệu + Vì sao chọn |
| 02 Sản phẩm | `san-pham` | Tab + băng chuyền + ghi chú giá (giữ nguyên chức năng) | Sản phẩm |
| 03 Đặt hàng | `cach-dat-hang` | 3 bước thành một hàng ngang, ngay bên dưới là phiếu đặt hàng | Cách đặt hàng + phiếu trong Liên hệ |
| 04 Ghé vườn | `lien-he` | Thông tin liên hệ + bản đồ | Liên hệ |
| Chân trang | — | Như hiện tại, đổi link `#vi-sao` thành `#gioi-thieu` | — |

- Bỏ section `vi-sao` và section `trust` riêng (nội dung gộp như bảng trên).
- Cuối chương 01, 02, 03 có một câu dẫn ngắn sang chương sau (văn dẫn, không phải thông tin mới):
  - 01 → 02: "Từ khu vườn ấy, đây là những gì {{brand}} gửi đến quý khách."
  - 02 → 03: "Chọn được sản phẩm rồi? Đặt hàng chỉ mất ba bước."
  - 03 → 04: "Muốn xem tận nơi? Mời quý khách ghé vườn."
- Menu header: Giới thiệu → `#gioi-thieu`, Sản phẩm, Đặt hàng → `#cach-dat-hang`, Liên hệ → `#lien-he` (không đổi).
- Nút "Đặt mua" trên thẻ sản phẩm vẫn cuộn tới phiếu và điền sẵn sản phẩm (phiếu giờ nằm trong chương 03).

## 2. Hình thức

- **Nền:** `--cream` cho toàn bộ `main`; chân trang `--green-dark`. Bỏ `.wave-top`, `.wave-bottom`, `.trust`, nền riêng của `.about`, `.why`, `.steps`, `.contact`.
- **Khoảng cách chương:** `padding-block` 96px (máy tính) / 64px (điện thoại).
- **Đầu chương (`.chapter-head`):** số chương lớn (Lora, viền chữ màu mật, `-webkit-text-stroke`, nền chữ trong suốt), dòng nhỏ (eyebrow), tiêu đề h2. Canh trái, cùng một kiểu cho cả 4 chương.
- **Câu dẫn (`.chapter-next`):** chữ nghiêng Lora, màu `--honey-dark`, mũi tên ↓, canh giữa, cuối chương.
- **Thẻ / khối:** thẻ sản phẩm, phiếu, khối liên hệ giữ nền trắng + viền `--line` trên nền kem.
- **Họa tiết tổ ong mờ:** giữ ở mở đầu; thêm rất nhẹ (opacity ≤ 0.08) ở góc chương 02 và 04 để nhịp lặp lại.

## 3. Chuyển động

- **Đường bay của ong (`.flight-path`):** một đường thẳng đứng nét chấm màu mật chạy dọc `main`, từ chương 01 tới hết chương 04. Mỗi đầu chương có một nút lục giác nhỏ nằm trên đường (thẳng hàng với số chương). Đầu đường đang vẽ có một con ong nhỏ (biểu tượng SVG). Vị trí: máy tính cách mép trái container 40px về phía ngoài (chỉ khi màn hình ≥ 1200px đủ chỗ; hẹp hơn thì nằm trong lề trái container và nội dung chương thụt vào 32px); điện thoại cách mép màn hình 10px, nét mảnh, nội dung chương thụt trái 28px để không đè chữ. Vẽ dần theo tiến độ cuộn của `main`:
  - Trình duyệt hỗ trợ `animation-timeline: scroll()` → CSS thuần.
  - Không hỗ trợ → JS cập nhật biến `--progress` (0..1) theo `scroll`, gom bằng `requestAnimationFrame`.
  - Giảm chuyển động → hiện đường đầy đủ, không vẽ dần.
  - Đường bay là trang trí: `aria-hidden`, `pointer-events: none`.
- **Cột số chương (`.chapter-rail`):** cố định cạnh phải, chỉ hiện khi ≥ 1100px. 4 chấm + số 01–04 + tên ngắn khi hover/đang xem. Dùng lại logic scrollspy hiện có (`45-scrollspy.js`) để tô chương đang xem. Mỗi mục là link tới chương.
- **Theo nhịp cuộn (CSS `animation-timeline: view()` nếu hỗ trợ, ngược lại dùng `data-reveal` hiện có):**
  - Số chương trượt từ trái vào + mờ dần hiện.
  - Ảnh lục giác chương 01 mở từ `scale(0.9)` → 1.
- Giữ: lá đung đưa (chỉ ở mở đầu), số đếm, thẻ nổi khi hover, hiệu ứng thẻ khi đổi tab.
- Mọi hiệu ứng tắt khi `prefers-reduced-motion: reduce`.

## 4. Mở đầu và video

- **Máy tính (≥ 860px):** `min-height: 100svh` (trừ header). Lưới 2 cột: chữ bên trái, video bên phải cao bằng khung mở đầu, sát mép phải màn hình (không viền trắng, không bo góc), mép trái video cắt cong mềm bằng `clip-path` / `mask`. Dùng video 4:5 (720×900).
- **Điện thoại:** video phủ kín khung mở đầu làm nền (`object-fit: cover`), lớp gradient tối từ dưới lên, chữ + nút ở phần dưới, chữ màu trắng. Dùng video 9:16 (540×960).
- **Dựng lại video (`tools/hero-video.py`):**
  - Bỏ chú thích chữ trong video (giữ ong, phấn hoa, chuyển cảnh tổ ong, gradient nhẹ).
  - Tham số hóa kích thước: xuất `hero.mp4` (720×900, máy tính) và `hero-sm.mp4` (540×960, điện thoại) bằng cách render riêng từng khổ (không thu nhỏ từ bản kia vì khác tỉ lệ).
  - Poster riêng cho mỗi khổ: `hero-poster.webp`, `hero-poster-sm.webp`. Thẻ `<video>` dùng poster dọc; JS đổi poster theo khổ màn hình nếu cần.
  - Giữ `<source media="(min-width: 860px)">` cho bản máy tính, bản điện thoại là mặc định.
- Header trong suốt khi ở mở đầu; trên điện thoại chữ/biểu tượng header màu trắng khi nằm trên video, chuyển về màu thường khi cuộn (`.is-scrolled`).

## 5. Cấu trúc file

- `src/sections/`: `02-hero.html` (gộp dải cam kết), `04-about.html` → chương 01 (gộp why-us), `05-products.html` → chương 02, `07-how-to-order.html` → chương 03 (gồm phiếu), `08-contact.html` → chương 04 (chỉ thông tin + bản đồ). Xóa `03-trust.html`, `06-why-us.html` và CSS tương ứng (`03-trust.css`, `06-why-us.css`, `07-how-to-order.css` gộp vào CSS chương 03).
- CSS mới: `src/css/03-story.css` (nền, `.chapter`, `.chapter-head`, `.chapter-next`, `.flight-path`, `.chapter-rail`). JS mới: `src/js/48-story.js` (tiến độ đường bay khi không có scroll-timeline). Rail render trong HTML (`src/sections/`), không sinh bằng JS.
- `src/css/12-effects.css`: bỏ phần viền sóng.

## 6. Kiểm tra

- `node --test tests/build.test.mjs`: cập nhật `SECTION_IDS` thành `trang-chu, gioi-thieu, san-pham, cach-dat-hang, lien-he`; thêm test: mỗi chương có `.chapter-head` với số 01–04 đúng thứ tự; không còn `id="vi-sao"` hay link `#vi-sao`; rail có đủ 4 link trỏ tới id có thật; video có 2 nguồn + poster tồn tại.
- `node --check assets/app.js`.
- Chụp ảnh Chrome headless ở 390px và 1280px sau mỗi bước lớn, xem bằng mắt: nền liền mạch, đường bay nối số chương, chữ trên video đọc được, không tràn ngang trên 390px.
- Kiểm tra bằng đọc code: nút Đặt mua vẫn cuộn tới phiếu (id `order-form` giữ nguyên), link chân trang tới nhóm sản phẩm vẫn chạy.
