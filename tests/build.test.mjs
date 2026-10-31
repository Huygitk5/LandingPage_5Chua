import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from '../build.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SECTION_IDS = ['trang-chu', 'gioi-thieu', 'san-pham', 'vi-sao', 'cach-dat-hang', 'lien-he'];

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

test('video hero có file mp4 và poster thật', () => {
  const src = html.match(/<source src="(assets\/video\/[^"]+\.mp4)"/);
  const poster = html.match(/poster="(assets\/video\/[^"]+)"/);
  assert.ok(src && poster, 'thiếu video hoặc poster ở hero');
  assert.ok(existsSync(join(root, src[1])), `không tìm thấy ${src[1]}`);
  assert.ok(existsSync(join(root, poster[1])), `không tìm thấy ${poster[1]}`);
  assert.match(html, /<video[^>]*\bmuted\b[^>]*\bplaysinline\b/, 'video phải muted + playsinline để tự phát trên di động');
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
