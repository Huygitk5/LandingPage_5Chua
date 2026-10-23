// Ghép src/ thành index.html, assets/styles.css, assets/app.js.
// Chạy: node build.mjs
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, 'src');

const read = (...p) => readFileSync(join(...p), 'utf8');

// Thay <!-- @include path --> bằng nội dung file (đệ quy), đường dẫn tính từ src/.
function inline(text, seen = []) {
  return text.replace(/^([ \t]*)<!--\s*@include\s+(\S+)\s*-->/gm, (_, indent, rel) => {
    if (seen.includes(rel)) throw new Error(`include vòng: ${[...seen, rel].join(' -> ')}`);
    const body = inline(read(src, rel), [...seen, rel]).trimEnd();
    return body.split('\n').map((l) => (l ? indent + l : l)).join('\n');
  });
}

// Thay {{key}} bằng giá trị trong site.json; thiếu key thì báo lỗi.
function fill(text, vars) {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
    if (!(key in vars)) throw new Error(`site.json thiếu khóa "${key}"`);
    return vars[key];
  });
}

const concat = (dir, ext) =>
  readdirSync(join(src, dir))
    .filter((f) => f.endsWith(ext))
    .sort()
    .map((f) => `/* ${f} */\n${read(src, dir, f).trim()}\n`)
    .join('\n');

export function build() {
  const vars = JSON.parse(read(src, 'site.json'));
  const html = fill(inline(read(src, 'layout.html')), vars);
  const css = fill(concat('css', '.css'), vars);
  const js = `(function () {\n'use strict';\n\n${fill(concat('js', '.js'), vars)}\n})();\n`;

  mkdirSync(join(root, 'assets'), { recursive: true });
  writeFileSync(join(root, 'index.html'), html);
  writeFileSync(join(root, 'assets', 'styles.css'), css);
  writeFileSync(join(root, 'assets', 'app.js'), js);
  return { html, css, js };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { html, css, js } = build();
  console.log(`index.html ${html.length}B, styles.css ${css.length}B, app.js ${js.length}B`);
}
