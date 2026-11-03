import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from '../build.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SECTION_IDS = ['trang-chu', 'gioi-thieu', 'san-pham', 'cach-dat-hang', 'lien-he'];

build();
const html = readFileSync(join(root, 'index.html'), 'utf8');

test('index.html được ghép đủ, không còn marker hay biến chưa thay', () => {
  assert.ok(!html.includes('@include'), 'còn marker @include');
  assert.ok(!/\{\{\s*\w+\s*\}\}/.test(html), 'còn biến {{...}}');
});

test('có đủ các section theo id', () => {
  for (const id of SECTION_IDS) {
    assert.ok(html.includes(`id="${id}"`), `thiếu section #${id}`);
  }
});

test('mỗi file trong src/sections đều được ghép vào index.html', () => {
  const tpl = readFileSync(join(root, 'src', 'layout.html'), 'utf8');
  for (const f of readdirSync(join(root, 'src', 'sections'))) {
    assert.ok(tpl.includes(`sections/${f}`), `src/layout.html chưa include ${f}`);
  }
});

test('mọi đường dẫn local (src/href) đều trỏ tới file có thật', () => {
  const refs = [...html.matchAll(/(?:src|href)="(?!https?:|tel:|mailto:|#|data:)([^"]+)"/g)].map((m) => m[1]);
  assert.ok(refs.length > 0);
  for (const ref of refs) {
    assert.ok(existsSync(join(root, ref.split('?')[0])), `không tìm thấy ${ref}`);
  }
});

test('video hero có nguồn mp4 và poster có thật, muted + playsinline để tự phát', () => {
  const sources = [...html.matchAll(/<source src="(assets\/video\/[^"]+\.mp4)"[^>]*>/g)];
  const poster = html.match(/ poster="(assets\/video\/[^"]+)"/);
  assert.equal(sources.length, 1, 'cần đúng 1 nguồn video');
  assert.ok(poster, 'thiếu poster ở hero');
  for (const ref of [sources[0][1], poster[1]]) {
    assert.ok(existsSync(join(root, ref)), `không tìm thấy ${ref}`);
  }
  assert.match(html, /<video[^>]*\bmuted\b[^>]*\bplaysinline\b/, 'video phải muted + playsinline để tự phát trên di động');
});

test('link nhóm sản phẩm ở chân trang trỏ tới nhóm có thật', () => {
  const data = readFileSync(join(root, 'src', 'js', '10-products-data.js'), 'utf8');
  const groupIds = [...data.matchAll(/\{ id: '([\w-]+)', label:/g)].map((m) => m[1]);
  const links = [...html.matchAll(/data-group-link="([\w-]+)"/g)].map((m) => m[1]);
  assert.ok(links.length > 0, 'chân trang chưa có link nhóm sản phẩm');
  for (const id of links) assert.ok(groupIds.includes(id), `không có nhóm sản phẩm "${id}"`);
});

test('4 chương đánh số 01–04 đúng thứ tự, mỗi chương có nút trên đường bay', () => {
  const chapters = [...html.matchAll(
    /<section class="chapter[^"]*" id="([\w-]+)">[\s\S]*?<span class="chapter-node"[^>]*><\/span>\s*<span class="chapter-no"[^>]*>(\d\d)<\/span>/g,
  )].map((m) => [m[1], m[2]]);
  assert.deepEqual(chapters, [['gioi-thieu', '01'], ['san-pham', '02'], ['cach-dat-hang', '03'], ['lien-he', '04']]);
});

test('không còn phần cũ đã gộp (vi-sao, dải cam kết, viền sóng)', () => {
  assert.ok(!html.includes('vi-sao'), 'còn nhắc tới #vi-sao');
  assert.ok(!/class="trust"/.test(html), 'còn dải cam kết riêng');
  assert.ok(!/wave-(top|bottom)/.test(html), 'còn viền sóng');
});

test('đường bay và cột chương có đủ, link trỏ đúng 4 chương', () => {
  assert.match(html, /<div class="story" id="story">/);
  assert.match(html, /id="flight-path"/);
  const rail = html.match(/<nav class="chapter-rail"[\s\S]*?<\/nav>/);
  assert.ok(rail, 'thiếu cột chương');
  const hrefs = [...rail[0].matchAll(/href="#([\w-]+)"/g)].map((m) => m[1]);
  assert.deepEqual(hrefs, ['gioi-thieu', 'san-pham', 'cach-dat-hang', 'lien-he']);
});

test('phiếu đặt hàng nằm trong chương 03', () => {
  const start = html.indexOf('id="cach-dat-hang"');
  const form = html.indexOf('id="order-form"');
  const end = html.indexOf('id="lien-he"');
  assert.ok(start > 0 && start < form && form < end, 'phiếu phải nằm giữa chương 03 và chương 04');
});

test('bundle CSS và JS được tạo', () => {
  assert.ok(readFileSync(join(root, 'assets', 'styles.css'), 'utf8').length > 100);
  assert.ok(readFileSync(join(root, 'assets', 'app.js'), 'utf8').length > 100);
});

test('SĐT lấy từ site.json xuất hiện trong trang', () => {
  const site = JSON.parse(readFileSync(join(root, 'src', 'site.json'), 'utf8'));
  assert.ok(html.includes(`tel:${site.phoneIntl}`));
});

test('ảnh chia sẻ og:image là JPEG 1200x630 và có file thật', () => {
  const m = html.match(/<meta property="og:image" content="[^"]*?(assets\/img\/[^"]+)">/);
  assert.ok(m, 'thiếu og:image');
  const file = readFileSync(join(root, m[1]));
  assert.equal(file[0], 0xff, 'không phải JPEG');
  // đọc kích thước từ khối SOF của JPEG
  let i = 2;
  while (i < file.length) {
    const marker = file[i + 1];
    if (marker >= 0xc0 && marker <= 0xc3) {
      assert.equal(file.readUInt16BE(i + 7), 1200, 'rộng phải 1200');
      assert.equal(file.readUInt16BE(i + 5), 630, 'cao phải 630');
      return;
    }
    i += 2 + file.readUInt16BE(i + 2);
  }
  assert.fail('không tìm thấy kích thước JPEG');
});

test('không còn nhắc tới bòn bon', () => {
  assert.ok(!/bòn bon/i.test(html));
});
