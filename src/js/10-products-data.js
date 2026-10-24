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
    image: 'assets/img/lanhodiep.webp', imageAlt: 'Lan hồ điệp hoa trắng viền tím',
    desc: 'Liên hệ để xem các loại đang có và nhận báo giá.', inStock: true,
  },
  {
    id: 'lan-cat', group: 'hoa-lan', name: 'Lan cát', spec: 'Nhiều màu', price: null,
    image: 'assets/img/lancat.webp', imageAlt: 'Lan cát hoa màu cam',
    desc: 'Liên hệ để xem các loại đang có và nhận báo giá.', inStock: true,
  },
  {
    id: 'lan-dendro', group: 'hoa-lan', name: 'Lan dendro', spec: 'Nhiều màu', price: null,
    image: 'assets/img/landendro.webp', imageAlt: 'Lan dendro hoa xanh viền tím',
    desc: 'Liên hệ để xem các loại đang có và nhận báo giá.', inStock: true,
  },
  {
    id: 'lan-rung-tim', group: 'hoa-lan', name: 'Lan rừng tím', spec: 'Hoa màu tím', price: null,
    image: 'assets/img/lanrungtim.webp', imageAlt: 'Lan rừng hoa màu tím',
    desc: 'Liên hệ để xem các loại đang có và nhận báo giá.', inStock: true,
  },
  {
    id: 'lan-rung-trang', group: 'hoa-lan', name: 'Lan rừng trắng', spec: 'Hoa màu trắng', price: null,
    image: 'assets/img/lanrungtrang.webp', imageAlt: 'Lan rừng hoa màu trắng',
    desc: 'Liên hệ để xem các loại đang có và nhận báo giá.', inStock: true,
  },
  {
    id: 'cacao-giong', group: 'cay-giong', name: 'Cây cacao giống', spec: 'Cây giống', price: null,
    image: 'assets/img/cacao.webp', imageAlt: 'Vườn ươm cây cacao giống',
    desc: 'Liên hệ để biết giống, kích cỡ cây và báo giá theo số lượng.', inStock: true,
  },
];
