# Trang kể chuyện theo chương — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Biến landing page Năm Chùa từ 8 dải màu rời rạc thành một trang liền mạch: mở đầu toàn màn hình với video, rồi 4 chương trên một nền kem, nối bằng đường bay của ong và cột số chương.

**Architecture:** Site tĩnh, `build.mjs` ghép `src/layout.html` + `src/sections/*.html` → `index.html`, nối `src/css/*.css` → `assets/styles.css`, nối `src/js/*.js` (theo tên file, chung một IIFE) → `assets/app.js`. Mọi biến `{{key}}` lấy từ `src/site.json`. Video hero dựng bằng `tools/hero-video.py` (Pillow + imageio-ffmpeg).

**Tech Stack:** HTML/CSS/JS thuần, Node 24 (`node --test`), Python 3 + Pillow + imageio-ffmpeg, Chrome headless để chụp ảnh kiểm tra.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-10-31-story-layout-design.md`.
- Không bịa thông tin mới (nhận xét khách, giao hàng, giờ mở cửa). Câu dẫn giữa chương chỉ là văn dẫn.
- Không thêm thư viện JS. Mọi hiệu ứng tắt khi `prefers-reduced-motion: reduce` (biến dùng chung `reducedMotion` trong `src/js/05-utils.js`).
- Giữ id: `trang-chu`, `gioi-thieu`, `san-pham`, `cach-dat-hang`, `lien-he`, `order-form`, `hero-video`. Bỏ `vi-sao`.
- Không dùng tool `mcp__claude-in-chrome__*`. Kiểm tra giao diện bằng Chrome headless CLI (chỉ chụp ảnh).
- File nguồn dùng CRLF; sửa bằng Edit/Write (không sed toàn file).
- Test: `node --test tests/build.test.mjs` (lệnh `npm test` lỗi sẵn trên Windows/Node 24, không sửa trong kế hoạch này).
- Sau mỗi thay đổi `src/`: `node build.mjs` rồi `node --check assets/app.js`.

Lệnh chụp ảnh dùng chung (đặt trong scratchpad, không commit) — `shot.sh <out.png> <width> <height>`:

```bash
CH="/c/Program Files/Google/Chrome/Application/chrome.exe"
"$CH" --headless=new --disable-gpu --hide-scrollbars --mute-audio --no-first-run \
  --user-data-dir="$SCRATCH/chrome-prof" --virtual-time-budget=5000 \
  --window-size="$2,$3" --screenshot="$1" "file:///D:/Work/MatOng/index.html"
```

---

## Tiến độ

| Task | Trạng thái | Commit | Ghi chú |
|---|---|---|---|
| 0. Commit phần việc trước | ✅ Xong | a7d8fe9 | 10/10 test đạt |
| 1. Video không chữ, 2 khổ | ✅ Xong | 92fe972 | lg 3,7MB (720×900), sm 1,7MB (540×960, crf 34 thay vì 30 cho nhẹ) |
| 2. Cấu trúc HTML theo chương | ✅ Xong | d363f71 | 14/14 test đạt |
| 3. CSS liền mạch | ⏳ Đang làm | | |
| 4. JS đường bay + cột chương | ⬜ Chưa làm | | |

---

### Task 0: Commit phần việc trước đó trong phiên

**Files:** toàn bộ thay đổi chưa commit hiện có (video hero, `tools/`, chân trang mới, dọn CSS/JS, test).

- [x] **Step 1: Chạy test trên trạng thái hiện tại**

Run: `node build.mjs && node --test tests/build.test.mjs`
Expected: `ℹ pass 10`, `ℹ fail 0`

- [x] **Step 2: Commit**

```bash
git add -A
git commit -m "Add hero video, richer footer and small CSS/JS cleanups"
```

---

### Task 1: Video không chữ, hai khổ (máy tính 720×900, điện thoại 540×960)

**Files:**
- Modify (viết lại toàn bộ): `tools/hero-video.py`
- Delete: `.gitignore`, `tools/.cache/` (không còn cần font Lora vì bỏ chữ)
- Modify: `src/sections/02-hero.html` (chỉ thẻ `<video>` — phần còn lại làm ở Task 2)
- Modify: `src/js/70-hero-video.js`
- Test: `tests/build.test.mjs`

**Interfaces:**
- Produces: `assets/video/hero.mp4`, `hero-poster.webp` (720×900); `assets/video/hero-sm.mp4`, `hero-poster-sm.webp` (540×960). Thẻ `<video id="hero-video">` có `poster` = bản điện thoại, `data-poster-lg` = bản máy tính.

- [x] **Step 1: Sửa test video cho hai poster**

Trong `tests/build.test.mjs`, thay test `'video hero có bản máy tính, bản điện thoại và poster thật'` bằng:

```js
test('video hero có bản máy tính, bản điện thoại và poster cho từng khổ', () => {
  const sources = [...html.matchAll(/<source src="(assets\/video\/[^"]+\.mp4)"([^>]*)>/g)];
  const poster = html.match(/ poster="(assets\/video\/[^"]+)"/);
  const posterLg = html.match(/data-poster-lg="(assets\/video\/[^"]+)"/);
  assert.equal(sources.length, 2, 'cần 2 nguồn video (lớn + nhỏ)');
  assert.ok(poster && posterLg, 'thiếu poster hoặc data-poster-lg ở hero');
  assert.match(sources[0][2], /media="\(min-width: 860px\)"/, 'bản lớn phải đứng đầu và có media cho máy tính');
  assert.doesNotMatch(sources[1][2], /media=/, 'bản nhỏ là nguồn mặc định, không có media');
  for (const ref of [...sources.map((s) => s[1]), poster[1], posterLg[1]]) {
    assert.ok(existsSync(join(root, ref)), `không tìm thấy ${ref}`);
  }
  assert.match(html, /<video[^>]*\bmuted\b[^>]*\bplaysinline\b/, 'video phải muted + playsinline để tự phát trên di động');
});
```

- [x] **Step 2: Chạy test, xác nhận FAIL**

Run: `node build.mjs && node --test tests/build.test.mjs`
Expected: FAIL `thiếu poster hoặc data-poster-lg ở hero`

- [x] **Step 3: Viết lại `tools/hero-video.py`**

```python
"""Dựng video ngắn (không chữ) cho phần mở đầu từ ảnh trong assets/img và tools/video-src.

Ong hoạt hình bay quanh khung, phấn hoa trôi lên, chuyển cảnh bằng các ô tổ ong
mở dần. Mọi chuyển động tuần hoàn theo độ dài video nên video lặp liền mạch.
Video không có chữ: tiêu đề nằm trên trang, đè lên video.

Chạy:   pip install pillow imageio-ffmpeg
        python tools/hero-video.py        # dựng cả hai khổ
        python tools/hero-video.py lg     # chỉ khổ máy tính (hoặc: sm)
Xuất:   assets/video/hero.mp4, hero-poster.webp         (720x900, máy tính)
        assets/video/hero-sm.mp4, hero-poster-sm.webp   (540x960, điện thoại)
"""
import math
import random
import subprocess
import sys
from pathlib import Path

import imageio_ffmpeg
from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / 'assets' / 'img'
SRC = Path(__file__).resolve().parent / 'video-src'   # ảnh minh họa public domain, xem CREDITS.md
OUT = ROOT / 'assets' / 'video'

# khổ: (rộng, cao, tên video, tên poster, crf)
FORMATS = {
    'lg': (720, 900, 'hero.mp4', 'hero-poster.webp', 28),
    'sm': (540, 960, 'hero-sm.mp4', 'hero-poster-sm.webp', 30),
}
FMT = sys.argv[1] if len(sys.argv) > 1 else 'lg'
W, H, VIDEO_NAME, POSTER_NAME, CRF = FORMATS[FMT]
UNIT = W / 720           # co giãn ong, ô tổ ong theo khổ

FPS = 24
D = 3.5                  # thời lượng mỗi cảnh (giây)
TR = 0.9                 # thời lượng chuyển cảnh tổ ong

HONEY = (227, 160, 8)
HONEY_LIGHT = (255, 214, 102)
INK = (43, 30, 10)

# (ảnh, tâm cắt ngang 0..1, tâm cắt dọc 0..1) — thứ tự kể chuyện:
# ong hút mật → vườn ong → ong chúa → bánh tổ → giọt mật → mật ong → sữa ong chúa
# → lan cattleya → lan hồ điệp → cacao M1 → cacao D3 → cacao giống
SCENES = [
    (SRC / 'ong-hoa-cuc.webp', 0.36, 0.50),
    (IMG / 'intro1.webp', 0.50, 0.62),
    (SRC / 'ong-chua.webp', 0.50, 0.40),
    (IMG / 'intro3.webp', 0.50, 0.66),
    (SRC / 'giot-mat.webp', 0.50, 0.42),
    (IMG / 'matong.webp', 0.50, 0.55),
    (IMG / 'suaongchua.webp', 0.50, 0.55),
    (IMG / 'lancat.webp', 0.50, 0.36),
    (IMG / 'lanhodiep.webp', 0.50, 0.45),
    (SRC / 'trai-cacao1.png', 0.50, 0.50),
    (SRC / 'trai-cacao2.png', 0.50, 0.50),
    (IMG / 'cacao.webp', 0.50, 0.50),
]
N = len(SCENES)
T = N * D
FRAMES = round(T * FPS)

rng = random.Random(7)


def ease(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


# ---------- ảnh nền + Ken Burns ----------

def load_scene(path, focus_x, focus_y):
    im = Image.open(path).convert('RGB')
    # cắt viền đen (ảnh chụp từ video thường có dải đen trên/dưới)
    box = im.convert('L').point(lambda v: 255 if v > 18 else 0).getbbox()
    if box and box != (0, 0, *im.size):
        im = im.crop(box)
    iw, ih = im.size
    if iw / ih > W / H:
        ch, cw = ih, ih * W / H
    else:
        cw, ch = iw, iw * H / W
    cx = min(max(focus_x * iw, cw / 2), iw - cw / 2)
    cy = min(max(focus_y * ih, ch / 2), ih - ch / 2)
    return im, (cx, cy, cw, ch)


scenes = [load_scene(*s) for s in SCENES]


def scene_frame(i, w):
    """Ảnh của cảnh i, w giây sau khi cảnh bắt đầu hiện (0..D+TR)."""
    im, (cx, cy, cw, ch) = scenes[i]
    k = w / (D + TR)
    z = 1.0 + 0.11 * (k if i % 2 == 0 else 1 - k)
    pan = (1 if i % 3 else -1) * 0.035 * (k - 0.5)
    bw, bh = cw / z, ch / z
    iw, ih = im.size
    x = min(max(cx + pan * cw, bw / 2), iw - bw / 2)
    y = min(max(cy, bh / 2), ih - bh / 2)
    return im.resize((W, H), Image.BICUBIC, box=(x - bw / 2, y - bh / 2, x + bw / 2, y + bh / 2))


# ---------- chuyển cảnh tổ ong ----------

HEX_R = 58 * UNIT
SS = 2  # vẽ mask ở 2x để mép mịn


def hex_points(cx, cy, r):
    return [(cx + r * math.cos(math.radians(60 * k - 30)), cy + r * math.sin(math.radians(60 * k - 30)))
            for k in range(6)]


HEXES = []
row = 0
y = -HEX_R
while y < H + HEX_R * 2:
    x = (math.sqrt(3) * HEX_R / 2 if row % 2 else 0) - HEX_R
    while x < W + HEX_R * 2:
        delay = 0.5 * (x / W) + 0.5 * (1 - y / H)   # mở từ dưới trái lên trên phải
        HEXES.append((x, y, min(1.0, max(0.0, delay + rng.uniform(-0.08, 0.08)))))
        x += math.sqrt(3) * HEX_R
    y += 1.5 * HEX_R
    row += 1


def hex_transition(a, b, p):
    mask = Image.new('L', (W * SS, H * SS), 0)
    md = ImageDraw.Draw(mask)
    edge = Image.new('RGBA', (W * SS, H * SS), (0, 0, 0, 0))
    ed = ImageDraw.Draw(edge)
    for x, y, delay in HEXES:
        q = ease((p - delay * 0.55) / 0.45)
        if q <= 0:
            continue
        pts = hex_points(x * SS, y * SS, HEX_R * 1.06 * q * SS)
        md.polygon(pts, fill=255)
        if q < 1:
            ed.polygon(pts, outline=HONEY + (int(230 * (1 - q)),), width=max(2, round(3 * UNIT)) * SS)
    out = Image.composite(b, a, mask.resize((W, H), Image.LANCZOS))
    edge = edge.resize((W, H), Image.LANCZOS)
    out.paste(edge, (0, 0), edge)
    return out


# ---------- ong hoạt hình ----------

BEE_SS = 4


def draw_bee(flap):
    """Ong nhìn sang phải. flap 0..1 = độ mở cánh."""
    s = BEE_SS
    cw, ch = 70 * s, 58 * s
    im = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    wing_h = (8 + 14 * flap) * s
    for ox, a in ((-4, 120), (6, 165)):   # cánh sau, cánh trước
        wx, wy = (30 + ox) * s, 22 * s
        d.ellipse((wx - 10 * s, wy - wing_h, wx + 10 * s, wy + 2 * s),
                  fill=(255, 255, 255, a), outline=(255, 255, 255, 230), width=s)
    body = (12 * s, 22 * s, 52 * s, 50 * s)
    d.ellipse(body, fill=(247, 181, 0, 255))
    stripes = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
    sd = ImageDraw.Draw(stripes)
    for x0 in (20, 30, 40):
        sd.rectangle((x0 * s, 0, (x0 + 5) * s, ch), fill=INK + (255,))
    body_mask = Image.new('L', (cw, ch), 0)
    ImageDraw.Draw(body_mask).ellipse(body, fill=255)
    im.paste(stripes, (0, 0), ImageChops.multiply(stripes.getchannel('A'), body_mask))
    d.ellipse(body, outline=INK + (255,), width=2 * s)
    d.polygon([(13 * s, 34 * s), (5 * s, 36 * s), (13 * s, 39 * s)], fill=INK + (255,))
    d.ellipse((47 * s, 25 * s, 65 * s, 43 * s), fill=INK + (255,))          # đầu
    d.ellipse((57 * s, 29 * s, 62 * s, 34 * s), fill=(255, 255, 255, 255))  # mắt
    for ax, ay in ((60, 10), (66, 14)):                                     # râu
        d.line([(56 * s, 27 * s), (ax * s, ay * s)], fill=INK + (255,), width=s * 2)
        d.ellipse(((ax - 2) * s, (ay - 2) * s, (ax + 2) * s, (ay + 2) * s), fill=INK + (255,))
    return im.resize((cw // s, ch // s), Image.LANCZOS)


BEE_FRAMES = [draw_bee(0.5 + 0.5 * math.cos(2 * math.pi * k / 6)) for k in range(6)]

# (tâm x, tâm y, biên độ x, y, tần số x, y, pha, tỉ lệ)
BEES = [
    (W * 0.55, H * 0.30, W * 0.34, H * 0.16, 2, 3, 0.0, 1.55 * UNIT),
    (W * 0.45, H * 0.42, W * 0.38, H * 0.20, 3, 2, 1.9, 1.1 * UNIT),
]


def bee_pos(b, t):
    cx, cy, ax, ay, fx, fy, ph, _ = b
    a = 2 * math.pi * t / T
    return (cx + ax * math.sin(fx * a + ph),
            cy + ay * math.sin(fy * a + ph * 1.7) + 6 * UNIT * math.sin(41 * a + ph))


def _composite(frame, im, x, y):
    # alpha_composite không nhận tọa độ âm, nên cắt phần nằm ngoài khung
    sx, sy = max(0, -x), max(0, -y)
    ex, ey = min(im.width, frame.width - x), min(im.height, frame.height - y)
    if ex <= sx or ey <= sy:
        return
    frame.alpha_composite(im.crop((sx, sy, ex, ey)), (x + sx, y + sy))


def draw_bees(frame, t, fi):
    for n, b in enumerate(BEES):
        x, y = bee_pos(b, t)
        x2, y2 = bee_pos(b, t + 0.05)
        vx, vy = x2 - x, y2 - y
        sprite = BEE_FRAMES[(fi + n * 3) % len(BEE_FRAMES)]
        sprite = sprite.resize((round(sprite.width * b[7]), round(sprite.height * b[7])), Image.LANCZOS)
        ang = max(-25.0, min(25.0, math.degrees(math.atan2(-vy, abs(vx) + 1e-6))))
        if vx < 0:
            sprite = sprite.transpose(Image.FLIP_LEFT_RIGHT)
            ang = -ang
        sprite = sprite.rotate(ang, resample=Image.BICUBIC, expand=True)
        shadow = Image.new('RGBA', sprite.size, (0, 0, 0, 0))
        shadow.putalpha(sprite.getchannel('A').point(lambda v: v * 0.3))
        shadow = shadow.filter(ImageFilter.GaussianBlur(4))
        px, py = round(x - sprite.width / 2), round(y - sprite.height / 2)
        _composite(frame, shadow, px + 5, py + 9)
        _composite(frame, sprite, px, py)


# ---------- phấn hoa ----------

POLLEN = [
    dict(x=rng.uniform(0, W), y=rng.uniform(0, H + 60), v=rng.choice((1, 1, 2)),
         sway=rng.uniform(6, 18), m=rng.choice((2, 3, 4)), ph=rng.uniform(0, 6.28),
         r=rng.uniform(1.6, 4.2), a=rng.uniform(0.45, 0.9))
    for _ in range(28)
]


def draw_pollen(frame, t):
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    span = H + 60
    for p in POLLEN:
        y = (p['y'] - p['v'] * span * t / T) % span - 30
        x = p['x'] + p['sway'] * math.sin(2 * math.pi * p['m'] * t / T + p['ph'])
        tw = 0.65 + 0.35 * math.sin(2 * math.pi * 7 * t / T + p['ph'] * 3)
        r = p['r']
        d.ellipse((x - r, y - r, x + r, y + r), fill=HONEY_LIGHT + (int(255 * p['a'] * tw),))
    frame.alpha_composite(layer.filter(ImageFilter.GaussianBlur(3)))
    frame.alpha_composite(layer)


# ---------- ghép khung hình ----------

def render(t, fi):
    s = int(t // D) % N
    u = t - s * D
    img = scene_frame(s, u + TR)
    if u >= D - TR:
        nxt = (s + 1) % N
        img = hex_transition(img, scene_frame(nxt, u - (D - TR)), (u - (D - TR)) / TR)
    frame = img.convert('RGBA')
    draw_pollen(frame, t)
    draw_bees(frame, t, fi)
    return frame.convert('RGB')


def render_format():
    OUT.mkdir(parents=True, exist_ok=True)
    video = OUT / VIDEO_NAME
    writer = imageio_ffmpeg.write_frames(
        str(video), (W, H), fps=FPS, codec='libx264', quality=None, macro_block_size=1,
        output_params=['-crf', str(CRF), '-preset', 'slow', '-profile:v', 'main',
                       '-movflags', '+faststart', '-an'],
    )
    writer.send(None)
    poster = None
    for fi in range(FRAMES):
        frame = render(fi / FPS, fi)
        if fi == round(1.0 * FPS):
            poster = frame
        writer.send(frame.tobytes())
    writer.close()
    poster.save(OUT / POSTER_NAME, quality=80)
    print(f'xong {FMT}: {video} ({video.stat().st_size // 1024} KB, {W}x{H}, {T:.1f}s)')


if __name__ == '__main__':
    if len(sys.argv) > 1:
        render_format()
    else:
        for key in FORMATS:   # mỗi khổ một tiến trình vì W/H là hằng của module
            subprocess.run([sys.executable, __file__, key], check=True)
```

- [x] **Step 4: Dựng video, xóa font cache không còn dùng**

Run:
```bash
python tools/hero-video.py
rm -rf tools/.cache .gitignore
ls -la assets/video
```
Expected: in ra `xong lg: ... 720x900, 42.0s` và `xong sm: ... 540x960, 42.0s`; thư mục có `hero.mp4`, `hero-sm.mp4`, `hero-poster.webp`, `hero-poster-sm.webp`.

- [x] **Step 5: Sửa thẻ video trong `src/sections/02-hero.html`**

Thay thẻ `<video ...>` hiện có bằng:

```html
        <video class="hero-video" id="hero-video" width="540" height="960" muted loop playsinline preload="auto"
               poster="assets/video/hero-poster-sm.webp" data-poster-lg="assets/video/hero-poster.webp"
               aria-label="Video ngắn: ong hút mật, vườn ong Chợ Lách, bánh tổ mật, mật ong nguyên chất, sữa ong chúa, hoa lan và cây cacao giống của {{brand}}">
          <!-- Máy tính dùng khổ 4:5, điện thoại khổ 9:16. Trình duyệt không hiểu media thì lấy bản đầu. -->
          <source src="assets/video/hero.mp4" type="video/mp4" media="(min-width: 860px)">
          <source src="assets/video/hero-sm.mp4" type="video/mp4">
        </video>
```

- [x] **Step 6: Đổi poster theo khổ trong `src/js/70-hero-video.js`**

Ngay sau dòng `if (heroVideo) {`, thêm:

```js
  // Poster mặc định là khổ dọc (điện thoại); máy tính dùng poster khổ 4:5.
  if (heroVideo.dataset.posterLg && window.matchMedia('(min-width: 860px)').matches) {
    heroVideo.poster = heroVideo.dataset.posterLg;
  }
```

- [x] **Step 7: Chạy test, xác nhận PASS**

Run: `node build.mjs && node --check assets/app.js && node --test tests/build.test.mjs`
Expected: `ℹ fail 0`

- [x] **Step 8: Commit**

```bash
git add -A tools assets/video src/sections/02-hero.html src/js/70-hero-video.js tests/build.test.mjs index.html assets/app.js .gitignore
git commit -m "Render caption-free hero video in desktop (4:5) and mobile (9:16) formats"
```

---

### Task 2: Cấu trúc HTML theo chương

**Files:**
- Modify: `src/layout.html`, `src/sections/01-header.html`, `src/sections/02-hero.html`, `src/sections/04-about.html`, `src/sections/05-products.html`, `src/sections/07-how-to-order.html`, `src/sections/08-contact.html`, `src/sections/09-footer.html`
- Create: `src/sections/03-flight-path.html`, `src/sections/06-chapter-rail.html`
- Delete: `src/sections/03-trust.html`, `src/sections/06-why-us.html`
- Test: `tests/build.test.mjs`

**Interfaces:**
- Produces (dùng ở Task 3, 4): `<div class="story" id="story">` bọc 4 chương; mỗi chương `<section class="chapter …" id="…">` có `<header class="chapter-head">` chứa `<span class="chapter-node">`, `<span class="chapter-no">NN</span>`, `<div class="chapter-title">`; cuối chương `<p class="chapter-next"><a href="#…">…<span aria-hidden="true">↓</span></a></p>`; `<div class="flight-path" id="flight-path">` chứa `.flight-path-fill` và `svg.flight-bee`; `<nav class="chapter-rail" id="chapter-rail">` với 4 link `<a href="#id"><span class="rail-label">…</span><span class="rail-no">NN</span></a>`; mở đầu có `.hero-media`, `.hero-copy`, `ul.hero-facts`, `a.hero-scroll`.

- [x] **Step 1: Viết test (thất bại) cho cấu trúc chương**

Trong `tests/build.test.mjs`: đổi
`const SECTION_IDS = ['trang-chu', 'gioi-thieu', 'san-pham', 'vi-sao', 'cach-dat-hang', 'lien-he'];`
thành
`const SECTION_IDS = ['trang-chu', 'gioi-thieu', 'san-pham', 'cach-dat-hang', 'lien-he'];`
và thêm trước test `'bundle CSS và JS được tạo'`:

```js
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
```

- [x] **Step 2: Chạy test, xác nhận FAIL**

Run: `node build.mjs && node --test tests/build.test.mjs`
Expected: 4 test mới FAIL (không tìm thấy chương / còn `vi-sao`...).

- [x] **Step 3: `src/layout.html` — bọc 4 chương trong `.story`, thêm cột chương**

Thay khối từ `<main>` tới `<!-- @include sections/09-footer.html -->` bằng:

```html
  <main>
    <!-- @include sections/02-hero.html -->
    <div class="story" id="story">
      <!-- @include sections/03-flight-path.html -->
      <!-- @include sections/04-about.html -->
      <!-- @include sections/05-products.html -->
      <!-- @include sections/07-how-to-order.html -->
      <!-- @include sections/08-contact.html -->
    </div>
  </main>
  <!-- @include sections/06-chapter-rail.html -->
  <!-- @include sections/09-footer.html -->
```

- [x] **Step 4: Tạo `src/sections/03-flight-path.html`**

```html
<!-- Đường bay của ong nối các chương. Vị trí, độ dài và tiến độ do src/js/48-story.js tính. -->
<div class="flight-path" id="flight-path" aria-hidden="true">
  <div class="flight-path-fill"></div>
  <svg class="flight-bee" viewBox="0 0 32 28">
    <ellipse cx="13" cy="7" rx="6" ry="7" fill="#fff" fill-opacity="0.85" stroke="#2b2a26" stroke-width="1.2"/>
    <ellipse cx="20" cy="8" rx="5" ry="6" fill="#fff" fill-opacity="0.85" stroke="#2b2a26" stroke-width="1.2"/>
    <ellipse cx="16" cy="17" rx="11" ry="8" fill="#f7b500" stroke="#2b2a26" stroke-width="1.5"/>
    <path d="M12 9.6v14.8M17 9v16M22 10.4v13.2" stroke="#2b2a26" stroke-width="2.6"/>
    <circle cx="28" cy="16" r="3.5" fill="#2b2a26"/>
  </svg>
</div>
```

- [x] **Step 5: Tạo `src/sections/06-chapter-rail.html`**

```html
<nav class="chapter-rail" id="chapter-rail" aria-label="Các chương">
  <a href="#gioi-thieu"><span class="rail-label">Vườn ong</span><span class="rail-no">01</span></a>
  <a href="#san-pham"><span class="rail-label">Sản phẩm</span><span class="rail-no">02</span></a>
  <a href="#cach-dat-hang"><span class="rail-label">Đặt hàng</span><span class="rail-no">03</span></a>
  <a href="#lien-he"><span class="rail-label">Ghé vườn</span><span class="rail-no">04</span></a>
</nav>
```

- [x] **Step 6: Viết lại `src/sections/02-hero.html`**

```html
<section class="hero" id="trang-chu">
  <svg class="leaf leaf-1" aria-hidden="true"><use href="#i-leafshape"/></svg>

  <!-- Video dựng bằng tools/hero-video.py. JS tự phát (trừ khi người dùng bật "giảm chuyển động"). -->
  <div class="hero-media">
    <video class="hero-video" id="hero-video" width="540" height="960" muted loop playsinline preload="auto"
           poster="assets/video/hero-poster-sm.webp" data-poster-lg="assets/video/hero-poster.webp"
           aria-label="Video ngắn: ong hút mật, vườn ong Chợ Lách, bánh tổ mật, mật ong nguyên chất, sữa ong chúa, hoa lan và cây cacao giống của {{brand}}">
      <!-- Máy tính dùng khổ 4:5, điện thoại khổ 9:16. Trình duyệt không hiểu media thì lấy bản đầu. -->
      <source src="assets/video/hero.mp4" type="video/mp4" media="(min-width: 860px)">
      <source src="assets/video/hero-sm.mp4" type="video/mp4">
    </video>
  </div>

  <div class="container hero-inner">
    <div class="hero-copy" data-reveal>
      <p class="eyebrow">Cơ sở nuôi ong từ năm {{since}}</p>
      <h1>{{tagline}}</h1>
      <p class="lead">Mật ong, sữa ong chúa, tinh bột nghệ, cùng hoa lan và cây cacao giống. Đảm bảo chất lượng 100% tự nhiên. Hân hạnh phục vụ quý khách.</p>
      <div class="hero-actions">
        <a class="btn btn-primary btn-lg" href="tel:{{phoneIntl}}">
          <svg class="icon" aria-hidden="true"><use href="#i-phone"/></svg>
          <span>Gọi {{phoneDisplay}}</span>
        </a>
        <a class="btn btn-outline btn-lg" href="https://zalo.me/{{zalo}}" target="_blank" rel="noopener">
          <svg class="icon" aria-hidden="true"><use href="#i-zalo"/></svg>
          <span>Nhắn Zalo</span>
        </a>
      </div>
      <ul class="hero-facts">
        <li>Nuôi, thu hoạch tại vườn</li>
        <li>Ong, lan, cây giống</li>
        <li>Ưu đãi mua số lượng lớn</li>
      </ul>
    </div>
  </div>

  <a class="hero-scroll" href="#gioi-thieu">Câu chuyện bắt đầu <span aria-hidden="true">&darr;</span></a>
</section>
```

- [x] **Step 7: Viết lại `src/sections/04-about.html` (chương 01, gộp "Vì sao chọn")**

```html
<section class="chapter about" id="gioi-thieu">
  <svg class="leaf leaf-about" aria-hidden="true"><use href="#i-leafshape"/></svg>

  <div class="container">
    <header class="chapter-head">
      <span class="chapter-node" aria-hidden="true"></span>
      <span class="chapter-no" aria-hidden="true">01</span>
      <div class="chapter-title" data-reveal>
        <p class="eyebrow">Vườn ong</p>
        <h2>Câu chuyện của {{brand}}</h2>
      </div>
    </header>

    <div class="about-inner">
      <div class="about-copy" data-reveal>
        <p>{{brand}} là cơ sở nuôi ong khởi nghiệp từ năm {{since}} tại {{address}}. Mật ong và sữa ong chúa được nuôi và thu hoạch ngay tại vườn.</p>
        <p>Bên cạnh các sản phẩm từ ong, cơ sở còn cung cấp tinh bột nghệ, hoa lan (hồ điệp, lan cát, dendro, lan rừng) cùng cây cacao giống cho bà con làm vườn.</p>
        <p>Mọi sản phẩm đều được cam kết chất lượng.</p>

        <ul class="stats">
          <li><strong class="stat-num" data-count="30" data-suffix="+">30+</strong><span>năm nuôi ong</span></li>
          <li><strong class="stat-num" data-count="products">9</strong><span>sản phẩm</span></li>
          <li><strong class="stat-num" data-count="100" data-suffix="%">100%</strong><span>tự nhiên</span></li>
        </ul>
      </div>

      <div class="about-photos" data-reveal data-delay="2">
        <img src="assets/img/intro3.webp" width="600" height="1200" loading="lazy" alt="Cầu ong nhiều mật được lấy từ thùng nuôi">
        <img src="assets/img/intro2.webp" width="600" height="1200" loading="lazy" alt="Chủ vườn {{brand}}">
      </div>
    </div>

    <h3 class="reasons-title">Vì sao chọn {{brand}}</h3>
    <ul class="reasons" data-stagger>
      <li>
        <svg class="icon" aria-hidden="true"><use href="#i-clock"/></svg>
        <p><strong>Hơn 30 năm làm ong</strong>Khởi nghiệp nuôi ong từ năm {{since}} tại Chợ Lách, Bến Tre.</p>
      </li>
      <li>
        <svg class="icon" aria-hidden="true"><use href="#i-leaf"/></svg>
        <p><strong>Tự nhiên, rõ nguồn gốc</strong>Mật ong và sữa ong chúa nuôi, thu hoạch tại vườn. Tinh bột nghệ ghi rõ do công ty sản xuất.</p>
      </li>
      <li>
        <svg class="icon" aria-hidden="true"><use href="#i-grid"/></svg>
        <p><strong>Một nơi, nhiều sản phẩm</strong>Từ mật ong, sữa ong chúa, tinh bột nghệ đến hoa lan, cây cacao giống.</p>
      </li>
      <li>
        <svg class="icon" aria-hidden="true"><use href="#i-tag"/></svg>
        <p><strong>Mua nhiều có ưu đãi</strong>Giá niêm yết rõ ràng. Mua số lượng lớn xin gọi để có giá tốt hơn.</p>
      </li>
    </ul>

    <p class="chapter-next"><a href="#san-pham">Từ khu vườn ấy, đây là những gì {{brand}} gửi đến quý khách <span aria-hidden="true">&darr;</span></a></p>
  </div>
</section>
```

- [x] **Step 8: `src/sections/05-products.html` (chương 02)**

Thay dòng mở `<section class="section products wave-top" id="san-pham">` bằng `<section class="chapter products" id="san-pham">`; thay khối `<header class="section-head" data-reveal>…</header>` bằng:

```html
    <header class="chapter-head">
      <span class="chapter-node" aria-hidden="true"></span>
      <span class="chapter-no" aria-hidden="true">02</span>
      <div class="chapter-title" data-reveal>
        <p class="eyebrow">Sản phẩm</p>
        <h2>Sản phẩm của {{brand}}</h2>
        <p class="section-sub">Chọn nhóm sản phẩm, bấm “Đặt mua” để điền sẵn vào phiếu đặt hàng.</p>
      </div>
    </header>
```

và ngay sau đoạn `<p class="products-note">…</p>` thêm:

```html
    <p class="chapter-next"><a href="#cach-dat-hang">Chọn được sản phẩm rồi? Đặt hàng chỉ mất ba bước <span aria-hidden="true">&darr;</span></a></p>
```

- [x] **Step 9: Viết lại `src/sections/07-how-to-order.html` (chương 03, chứa phiếu)**

```html
<section class="chapter steps" id="cach-dat-hang">
  <svg class="leaf leaf-steps" aria-hidden="true"><use href="#i-leafshape"/></svg>

  <div class="container">
    <header class="chapter-head">
      <span class="chapter-node" aria-hidden="true"></span>
      <span class="chapter-no" aria-hidden="true">03</span>
      <div class="chapter-title" data-reveal>
        <p class="eyebrow">Đặt hàng</p>
        <h2>Đặt hàng trong 3 bước</h2>
      </div>
    </header>

    <ol class="steps-list" data-stagger>
      <li>
        <span class="step-no" aria-hidden="true">1</span>
        <h3>Chọn sản phẩm</h3>
        <p>Xem sản phẩm và giá ở phần trên, chọn loại và số lượng cần mua.</p>
      </li>
      <li>
        <span class="step-no" aria-hidden="true">2</span>
        <h3>Gọi, nhắn Zalo hoặc điền phiếu</h3>
        <p>Ưu tiên gọi <a href="tel:{{phoneIntl}}">{{phoneDisplay}}</a> để được tư vấn nhanh nhất. Hoặc để lại thông tin ở phiếu đặt hàng bên dưới.</p>
      </li>
      <li>
        <span class="step-no" aria-hidden="true">3</span>
        <h3>Xác nhận và nhận hàng</h3>
        <p>{{brand}} gọi lại xác nhận số lượng, giá và cách giao hàng với quý khách.</p>
      </li>
    </ol>

    <form class="order-form" id="order-form" novalidate data-reveal>
      <h3>Phiếu đặt hàng</h3>

      <div class="field-row field-row-even">
        <div>
          <label for="f-name">Họ và tên</label>
          <input id="f-name" name="name" type="text" autocomplete="name" required>
        </div>
        <div>
          <label for="f-phone">Số điện thoại</label>
          <input id="f-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="Ví dụ: 0912345678" required>
        </div>
      </div>

      <div class="field-row">
        <div>
          <label for="f-product">Sản phẩm</label>
          <select id="f-product" name="product" required></select>
        </div>
        <div>
          <label for="f-qty">Số lượng</label>
          <input id="f-qty" name="quantity" type="text" placeholder="Ví dụ: 2 lít" required>
        </div>
      </div>

      <label for="f-note">Ghi chú (không bắt buộc)</label>
      <textarea id="f-note" name="note" rows="4" placeholder="Địa chỉ nhận hàng, thời gian tiện nghe máy..."></textarea>

      <input class="hp" type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true">

      <p class="form-error" id="form-error" role="alert" hidden></p>
      <button class="btn btn-primary btn-lg btn-block" type="submit" id="form-submit">Gửi phiếu đặt hàng</button>

      <div class="form-result" id="form-result" role="status" aria-live="polite" hidden></div>
    </form>

    <p class="chapter-next"><a href="#lien-he">Muốn xem tận nơi? Mời quý khách ghé vườn <span aria-hidden="true">&darr;</span></a></p>
  </div>
</section>
```

- [x] **Step 10: Viết lại `src/sections/08-contact.html` (chương 04)**

```html
<section class="chapter contact" id="lien-he">
  <div class="container">
    <header class="chapter-head">
      <span class="chapter-node" aria-hidden="true"></span>
      <span class="chapter-no" aria-hidden="true">04</span>
      <div class="chapter-title" data-reveal>
        <p class="eyebrow">Ghé vườn</p>
        <h2>Liên hệ và ghé thăm vườn</h2>
        <p class="section-sub">Ưu tiên liên hệ qua số điện thoại.</p>
      </div>
    </header>

    <div class="contact-grid">
      <aside class="contact-info" data-reveal>
        <h3>Thông tin liên hệ</h3>
        <ul class="contact-list">
          <li>
            <svg class="icon" aria-hidden="true"><use href="#i-phone"/></svg>
            <span><strong>Điện thoại</strong><a href="tel:{{phoneIntl}}">{{phoneDisplay}}</a></span>
          </li>
          <li>
            <svg class="icon" aria-hidden="true"><use href="#i-zalo"/></svg>
            <span><strong>Zalo</strong><a href="https://zalo.me/{{zalo}}" target="_blank" rel="noopener">{{zalo}}</a></span>
          </li>
          <li>
            <svg class="icon" aria-hidden="true"><use href="#i-facebook"/></svg>
            <span><strong>Facebook</strong><a href="{{facebookUrl}}" target="_blank" rel="noopener">{{facebookName}}</a></span>
          </li>
          <li>
            <svg class="icon" aria-hidden="true"><use href="#i-mail"/></svg>
            <span><strong>Email</strong><a href="mailto:{{email}}">{{email}}</a></span>
          </li>
          <li>
            <svg class="icon" aria-hidden="true"><use href="#i-pin"/></svg>
            <span><strong>Địa chỉ</strong><a href="{{mapsUrl}}" target="_blank" rel="noopener">{{address}}</a></span>
          </li>
        </ul>
      </aside>

      <div class="map" data-reveal data-delay="2">
        <iframe title="Bản đồ {{address}}" src="{{mapsEmbedUrl}}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
      </div>
    </div>
  </div>
</section>
```

- [x] **Step 11: Header và chân trang**

`src/sections/01-header.html`: đổi `<a href="#cach-dat-hang">Cách đặt hàng</a>` thành `<a href="#cach-dat-hang">Đặt hàng</a>`.

`src/sections/09-footer.html`: đổi `<footer class="site-footer wave-top">` thành `<footer class="site-footer">`; thay danh sách trong cột "Khám phá" bằng:

```html
      <ul class="footer-list">
        <li><a href="#gioi-thieu">Câu chuyện vườn ong</a></li>
        <li><a href="#san-pham">Sản phẩm</a></li>
        <li><a href="#cach-dat-hang">Cách đặt hàng</a></li>
        <li><a href="#lien-he">Liên hệ, ghé vườn</a></li>
      </ul>
```

- [x] **Step 12: Xóa section cũ, chạy test**

Run:
```bash
git rm -q src/sections/03-trust.html src/sections/06-why-us.html
node build.mjs && node --check assets/app.js && node --test tests/build.test.mjs
```
Expected: `ℹ fail 0` (14 test).

- [x] **Step 13: Commit**

```bash
git add -A src tests index.html assets/app.js assets/styles.css
git commit -m "Restructure page into hero + four story chapters"
```

---

### Task 3: CSS — một nền liền mạch, đầu chương, đường bay, cột chương, mở đầu toàn màn hình

**Files:**
- Create: `src/css/03-story.css`
- Modify (viết lại): `src/css/02-hero.css`, `src/css/07-how-to-order.css`
- Modify: `src/css/00-base.css`, `src/css/01-header.css`, `src/css/04-about.css`, `src/css/05-products.css`, `src/css/08-contact.css`, `src/css/09-footer.css`, `src/css/12-effects.css`
- Delete: `src/css/03-trust.css`, `src/css/06-why-us.css`

**Interfaces:**
- Consumes: class/id từ Task 2.
- Produces: biến CSS `--progress` (0..1, mặc định 1) trên `#flight-path`; class `.is-visible` trên `#chapter-rail`; `.is-active` trên link rail — Task 4 đặt các giá trị này.

- [ ] **Step 1: Tạo `src/css/03-story.css`**

```css
/* Phần câu chuyện: một nền kem liền mạch, 4 chương nối nhau bằng đường bay của ong. */
.story { position: relative; --path-x: 12px; background: var(--cream); }
.story .container { padding-left: 34px; }

.chapter { position: relative; isolation: isolate; padding: 64px 0; }

/* Họa tiết tổ ong rất mờ ở góc chương 02 và 04 để nhịp với phần mở đầu */
.products::before, .contact::before {
  content: ""; position: absolute; top: 0; right: 0; z-index: -1; width: 45%; height: 70%; pointer-events: none;
  background: var(--hex-honey); opacity: 0.07;
  -webkit-mask-image: radial-gradient(circle at 100% 0, #000, transparent 70%);
  mask-image: radial-gradient(circle at 100% 0, #000, transparent 70%);
}

/* Đầu chương: nút lục giác trên đường bay, số chương lớn viền mật, tiêu đề */
.chapter-head { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; }
/* Không đặt top: nút giữ vị trí tĩnh (canh giữa theo chiều dọc của .chapter-head), left tính theo .chapter */
.chapter-node {
  position: absolute; left: calc(var(--path-x) - 9px); z-index: 1; width: 18px; height: 20px;
  background: radial-gradient(circle, var(--cream) 0 3px, var(--honey) 3.5px);
  clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
}
.chapter-no {
  flex: none; font-family: var(--font-head); font-weight: 700; line-height: 0.85;
  font-size: clamp(3rem, 10vw, 5.25rem); color: transparent; -webkit-text-stroke: 2px var(--honey);
}
.chapter-title .eyebrow { margin-bottom: 4px; }
.chapter-title h2 { margin: 0; }
.chapter-title .section-sub { margin-top: 8px; }

/* Câu dẫn sang chương sau */
.chapter-next { margin: 48px 0 0; text-align: center; }
.chapter-next a {
  display: inline-flex; flex-direction: column; align-items: center; gap: 4px;
  font-family: var(--font-head); font-style: italic; font-size: 1.15rem; color: var(--honey-dark); text-decoration: none;
}
.chapter-next a:hover { color: var(--green-dark); }
.chapter-next span, .hero-scroll span { display: inline-block; animation: nudge 1.8s ease-in-out infinite; }
@keyframes nudge { 50% { transform: translateY(5px); } }

/* Đường bay: nét chấm mờ là cả hành trình, nét chấm đậm là phần đã đi qua */
.flight-path {
  --dots: repeating-linear-gradient(to bottom, currentColor 0 4px, transparent 4px 11px);
  position: absolute; left: calc(var(--path-x) - 1px); top: 0; width: 2px; height: 0; z-index: 0;
  pointer-events: none; color: rgba(227, 160, 8, 0.32); background: var(--dots);
}
.flight-path-fill {
  position: absolute; left: 0; top: 0; width: 100%; height: calc(var(--progress, 1) * 100%);
  color: var(--honey); background: var(--dots);
}
.flight-bee {
  position: absolute; left: 50%; top: calc(var(--progress, 1) * 100%); width: 26px; height: 23px;
  transform: translate(-50%, -50%) rotate(90deg); animation: bee-bob 0.9s ease-in-out infinite alternate;
}
@keyframes bee-bob { to { translate: 3px 0; } }

/* Cột số chương: chỉ màn rộng, hiện khi đã qua phần mở đầu */
.chapter-rail { display: none; }

@media (min-width: 860px) {
  .story { --path-x: 20px; }
  .story .container { padding-left: 48px; }
  .chapter { padding: 88px 0; }
}

@media (min-width: 1200px) {
  .story { --path-x: calc(50% - 570px); }
  .story .container { padding-left: 16px; }
  .chapter { padding: 96px 0; }
  .chapter-head { gap: 22px; margin-bottom: 40px; }
}

@media (min-width: 1280px) {
  .chapter-rail {
    position: fixed; right: 20px; top: 50%; z-index: 40; transform: translateY(-50%);
    display: flex; flex-direction: column; gap: 12px; opacity: 0; pointer-events: none; transition: opacity 0.3s;
  }
  .chapter-rail.is-visible { opacity: 1; pointer-events: auto; }
  .chapter-rail a {
    display: flex; align-items: center; justify-content: flex-end; gap: 8px;
    font-size: 0.78rem; font-weight: 600; color: var(--muted); text-decoration: none;
  }
  .chapter-rail a::after {
    content: ""; width: 8px; height: 8px; border-radius: 50%; background: var(--line); transition: background 0.2s, transform 0.2s;
  }
  .rail-label { opacity: 0; transform: translateX(6px); transition: opacity 0.2s, transform 0.2s; }
  .chapter-rail a:hover .rail-label, .chapter-rail a:focus-visible .rail-label { opacity: 1; transform: none; }
  .rail-no { font-variant-numeric: tabular-nums; }
  .chapter-rail a.is-active { color: var(--green-dark); }
  .chapter-rail a.is-active::after { background: var(--honey); transform: scale(1.5); }
}

/* Số chương trượt vào, ảnh lục giác mở ra theo nhịp cuộn (trình duyệt hỗ trợ scroll-driven animation) */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .chapter-no { animation: chapter-no-in linear both; animation-timeline: view(); animation-range: entry 0% cover 30%; }
    .about-photos img { animation: photo-in linear both; animation-timeline: view(); animation-range: entry 0% cover 35%; }
  }
}
@keyframes chapter-no-in { from { opacity: 0; translate: -32px 0; } }
@keyframes photo-in { from { opacity: 0.2; scale: 0.88; } }

@media (prefers-reduced-motion: reduce) {
  .flight-bee { display: none; }
}
```

- [ ] **Step 2: Viết lại `src/css/02-hero.css`**

```css
/* Mở đầu: cao bằng màn hình, nằm cả dưới header (header trong suốt ở đầu trang).
   Điện thoại: video phủ kín làm nền, chữ trắng phía dưới. Máy tính: chữ trái, video sát mép phải. */
.hero {
  position: relative; overflow: hidden; isolation: isolate;
  display: flex; flex-direction: column; justify-content: flex-end;
  min-height: 100svh; margin-top: calc(-1 * var(--header-h));
  padding: calc(var(--header-h) + 24px) 0 24px;
  background: var(--green-dark);
}
.hero-media { position: absolute; inset: 0; z-index: -1; }
.hero-video { display: block; width: 100%; height: 100%; object-fit: cover; }
.hero-media::after {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(180deg, rgba(20, 14, 4, 0.5) 0, rgba(20, 14, 4, 0) 20%, rgba(20, 14, 4, 0) 36%,
    rgba(20, 14, 4, 0.85) 74%, rgba(20, 14, 4, 0.92) 100%);
}

.hero-inner { position: relative; }
.hero .eyebrow { color: #ffd666; }
.hero h1 { margin-bottom: 0.35em; color: #fff; }
.lead { font-size: 1.05rem; color: rgba(255, 255, 255, 0.9); max-width: 34em; }

.hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin: 20px 0 16px; }
.hero .btn-outline { color: #fff; border-color: rgba(255, 255, 255, 0.85); }
.hero .btn-outline:hover { background: #fff; color: var(--green-dark); }

.hero-facts {
  list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 4px 18px;
  font-size: 0.9rem; font-weight: 600; color: rgba(255, 255, 255, 0.88);
}
.hero-facts li { display: flex; align-items: center; gap: 8px; }
.hero-facts li::before {
  content: ""; width: 8px; height: 9px; background: var(--honey);
  clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
}

.hero-scroll {
  position: relative; align-self: center; margin-top: 22px; font-size: 0.85rem; font-weight: 600;
  letter-spacing: 0.04em; color: rgba(255, 255, 255, 0.85); text-decoration: none;
}
.hero-scroll:hover { color: #fff; }

.leaf-1 { --s: 150px; --r: -20deg; left: -48px; bottom: 70px; display: none; }

@media (min-width: 860px) {
  .hero {
    justify-content: center; min-height: max(640px, 100svh); padding: calc(var(--header-h) + 40px) 0 72px;
    background: radial-gradient(circle at 25% 15%, var(--honey-soft) 0, transparent 50%), var(--cream);
  }
  /* Họa tiết tổ ong mờ phía chữ */
  .hero::before {
    content: ""; position: absolute; inset: 0; z-index: -2; pointer-events: none;
    background: var(--hex-honey); opacity: 0.14;
    -webkit-mask-image: linear-gradient(90deg, #000 0, transparent 55%);
    mask-image: linear-gradient(90deg, #000 0, transparent 55%);
  }
  .hero-media { left: auto; width: min(46vw, 760px); clip-path: ellipse(96% 100% at 100% 50%); }
  .hero-media::after { display: none; }
  .hero-copy { max-width: min(560px, 50%); }
  .hero .eyebrow { color: var(--honey-dark); }
  .hero h1 { color: var(--green-dark); font-size: clamp(2.6rem, 4.6vw, 3.8rem); }
  .lead { color: var(--muted); font-size: 1.12rem; }
  .hero .btn-outline { color: var(--green-dark); border-color: var(--green); }
  .hero .btn-outline:hover { background: var(--green); color: #fff; }
  .hero-facts { color: var(--muted); }
  .hero-scroll { position: absolute; left: max(16px, calc(50% - 544px)); bottom: 28px; margin: 0; color: var(--honey-dark); }
  .hero-scroll:hover { color: var(--green-dark); }
  .leaf-1 { display: block; }
}
```

- [ ] **Step 3: Header chữ trắng khi nằm trên video (điện thoại)**

Thêm vào cuối `src/css/01-header.css`:

```css
/* Đầu trang trên điện thoại: header nằm trên video nên chữ và nút menu màu trắng */
@media (max-width: 859px) {
  .site-header:not(.is-scrolled) .brand-name,
  .site-header:not(.is-scrolled) .nav-toggle { color: #fff; }
  .site-header:not(.is-scrolled) .brand-sub { color: #ffd666; }
}
```

- [ ] **Step 4: Chương 01 — `src/css/04-about.css`**

Đổi dòng `.about { position: relative; overflow: hidden; background: var(--paper); }` thành `.about { overflow: hidden; }`; thêm cuối file (trước khối `@media (min-width: 860px)` hoặc sau, đều được):

```css
/* Vì sao chọn: danh sách gọn ngay trong chương 01 */
.reasons-title { margin: 56px 0 18px; font-size: 1.3rem; }
.reasons { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; }
.reasons li {
  display: flex; align-items: flex-start; gap: 14px; padding: 16px 18px;
  background: var(--paper); border: 1px solid var(--line); border-radius: var(--radius);
}
.reasons .icon {
  box-sizing: border-box; width: 2.6rem; height: 2.6rem; padding: 9px; border-radius: 50%;
  background: var(--honey-soft); color: var(--honey-dark);
}
.reasons p { margin: 0; font-size: 0.95rem; color: var(--muted); }
.reasons strong { display: block; margin-bottom: 2px; font-family: var(--font-head); font-size: 1.05rem; color: var(--green-dark); }

@media (min-width: 700px) { .reasons { grid-template-columns: 1fr 1fr; } }
@media (min-width: 1100px) {
  .reasons { grid-template-columns: repeat(4, 1fr); }
  .reasons li { flex-direction: column; }
}
```

- [ ] **Step 5: Chương 02 — `src/css/05-products.css`**

Xóa dòng `.products { background: var(--cream); }`; trong `.tabs { … justify-content: center; … }` đổi `center` thành `flex-start`; trong `.products-note { … text-align: center; … }` đổi `center` thành `left`.

- [ ] **Step 6: Chương 03 — viết lại `src/css/07-how-to-order.css`**

```css
/* Chương 03: ba bước nằm ngang, phiếu đặt hàng ngay bên dưới */
.steps { overflow: hidden; }
.leaf-steps { --s: 200px; --r: 200deg; right: -60px; top: 60px; --o: 0.12; }

.steps-list { list-style: none; margin: 0 0 36px; padding: 0; display: grid; gap: 18px; }
.steps-list li { position: relative; padding-left: 60px; }
.steps-list h3 { margin-bottom: 0.25em; }
.steps-list p { margin: 0; color: var(--muted); }

.step-no {
  position: absolute; left: 0; top: 0; width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--honey); color: var(--ink); font-family: var(--font-head); font-weight: 700; font-size: 1.25rem;
}

.steps .order-form { max-width: 760px; margin: 0 auto; }

@media (min-width: 860px) {
  .steps-list { grid-template-columns: repeat(3, 1fr); gap: 28px; margin-bottom: 48px; }
  .steps-list li { padding-left: 0; padding-top: 60px; }
  /* Nét đứt nối số của bước này sang bước sau */
  .steps-list li:not(:last-child)::after {
    content: ""; position: absolute; left: 56px; right: -16px; top: 21px;
    border-top: 2px dashed rgba(227, 160, 8, 0.55);
  }
}
```

- [ ] **Step 7: Chương 04 — `src/css/08-contact.css`**

Xóa dòng `.contact { background: var(--cream); }`. Đổi `.contact-list { list-style: none; margin: 0 0 20px; …` thành `margin: 0;`. Thay khối `.map { … }` và `.map iframe { … }` bằng:

```css
.map {
  display: flex; min-height: 320px; overflow: hidden;
  border: 1px solid var(--line); border-radius: var(--radius); box-shadow: var(--shadow); background: var(--paper);
}
.map iframe { flex: 1; width: 100%; border: 0; }
```

và đổi khối `@media (min-width: 860px)` ở cuối file thành:

```css
@media (min-width: 860px) {
  .contact-grid { grid-template-columns: 0.9fr 1.1fr; gap: 32px; }
  .order-form, .contact-info { padding: 28px; }
}
```

- [ ] **Step 8: Chân trang, base, hiệu ứng**

- `src/css/09-footer.css`: đổi `padding: 68px 0 0;` (trong `.site-footer`) thành `padding: 56px 0 0;`.
- `src/css/00-base.css`: xóa hai dòng `.section { padding: 56px 0; }` và `.section-head { max-width: 700px; margin: 0 auto 32px; text-align: center; }` (giữ `.section-sub`).
- `src/css/12-effects.css`: xóa biến `--wave-mask` trong `:root`, xóa toàn bộ khối "Viền sóng" (từ comment `/* Viền sóng…` tới hết dòng `.site-footer.wave-top { … }`), xóa khối `@media (max-width: 599px) { .leaf-2 { display: none; } }`. Sửa comment đầu file thành `/* Hiệu ứng dùng chung: họa tiết tổ ong, lá trang trí, hiện dần khi cuộn. */`.
- Xóa file: `git rm -q src/css/03-trust.css src/css/06-why-us.css`.

- [ ] **Step 9: Build, test, kiểm tra không còn class cũ**

Run:
```bash
node build.mjs && node --check assets/app.js && node --test tests/build.test.mjs
grep -c "wave-\|\.trust\|why-card\|section-head" assets/styles.css
```
Expected: `ℹ fail 0`; grep in ra `0`.

- [ ] **Step 10: Chụp ảnh kiểm tra**

Run: `bash $SCRATCH/shot.sh $SCRATCH/t3-desktop.png 1280 6400` và `bash $SCRATCH/shot.sh $SCRATCH/t3-mobile.png 390 9000`, thu nhỏ rồi xem.
Expected (bằng mắt): nền kem liền từ chương 01 tới 04, chỉ chân trang tối; mở đầu máy tính chữ trái + video phải mép cong; điện thoại chữ trắng đọc được trên video; số 01–04 viền mật; không tràn ngang ở 390px. (Đường bay chưa có độ dài — Task 4.)

- [ ] **Step 11: Commit**

```bash
git add -A src index.html assets/styles.css assets/app.js
git commit -m "Style story chapters on one continuous background with full-screen hero"
```

---

### Task 4: JS — đường bay theo nhịp cuộn, cột chương theo chương đang xem

**Files:**
- Create: `src/js/48-story.js`
- Modify (viết lại): `src/js/45-scrollspy.js`

**Interfaces:**
- Consumes: `reducedMotion` (MediaQueryList, `src/js/05-utils.js`), `navEl` (`src/js/40-nav.js`), `#story`, `#flight-path`, `.chapter-node`, `#chapter-rail`.
- Produces: `--progress` trên `#flight-path`, `top/height` inline của `#flight-path`, `.is-visible` trên `#chapter-rail`, `.is-active` + `aria-current` trên link menu và rail.

- [ ] **Step 1: Viết lại `src/js/45-scrollspy.js`**

```js
// Tô sáng mục menu và cột chương của chương đang xem
// (chương nào đã cuộn qua 40% chiều cao màn hình thì tính là đang xem).
const railEl = document.getElementById('chapter-rail');
const spyLinks = [...navEl.querySelectorAll('a[href^="#"]'), ...(railEl ? railEl.querySelectorAll('a[href^="#"]') : [])];
const spySections = [...new Set(spyLinks.map((a) => a.getAttribute('href').slice(1)))]
  .map((id) => document.getElementById(id))
  .filter(Boolean);
let spyQueued = false;

function syncSpy() {
  spyQueued = false;
  const line = window.innerHeight * 0.4;
  let currentId = null;
  for (const section of spySections) {
    if (section.getBoundingClientRect().top <= line) currentId = section.id;
  }
  for (const a of spyLinks) {
    const active = a.getAttribute('href') === `#${currentId}`;
    a.classList.toggle('is-active', active);
    if (active) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  }
  if (railEl) railEl.classList.toggle('is-visible', currentId !== null);
}

window.addEventListener('scroll', () => {
  if (spyQueued) return;
  spyQueued = true;
  requestAnimationFrame(syncSpy);
}, { passive: true });
syncSpy();
```

- [ ] **Step 2: Tạo `src/js/48-story.js`**

```js
// Đường bay của ong: nối nút lục giác của chương đầu và chương cuối, vẽ dần theo nhịp cuộn.
// Không có JS thì --progress mặc định 1 (CSS) nên đường hiện đầy đủ.
const storyEl = document.getElementById('story');
const pathEl = document.getElementById('flight-path');
const pathNodes = storyEl ? [...storyEl.querySelectorAll('.chapter-node')] : [];
let pathQueued = false;

function syncPath() {
  pathQueued = false;
  if (reducedMotion.matches) {
    pathEl.style.setProperty('--progress', '1');
    return;
  }
  const rect = pathEl.getBoundingClientRect();
  const line = window.innerHeight * 0.6;
  const progress = rect.height > 0 ? Math.min(1, Math.max(0, (line - rect.top) / rect.height)) : 1;
  pathEl.style.setProperty('--progress', progress.toFixed(4));
}

function layoutPath() {
  const base = storyEl.getBoundingClientRect().top;
  const centerOf = (node) => {
    const r = node.getBoundingClientRect();
    return r.top + r.height / 2 - base;
  };
  const top = centerOf(pathNodes[0]);
  pathEl.style.top = `${top}px`;
  pathEl.style.height = `${centerOf(pathNodes[pathNodes.length - 1]) - top}px`;
  syncPath();
}

if (pathEl && pathNodes.length > 1) {
  window.addEventListener('scroll', () => {
    if (pathQueued) return;
    pathQueued = true;
    requestAnimationFrame(syncPath);
  }, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(layoutPath).observe(storyEl);
  else window.addEventListener('resize', layoutPath);
  if (document.fonts) document.fonts.ready.then(layoutPath);
  layoutPath();
}
```

- [ ] **Step 3: Build, kiểm tra cú pháp, test**

Run: `node build.mjs && node --check assets/app.js && node --test tests/build.test.mjs`
Expected: `js-ok` (không lỗi cú pháp), `ℹ fail 0`.

- [ ] **Step 4: Chụp ảnh kiểm tra cuối**

Run: chụp `1280×6400`, `390×9000`, và màn hình đầu `1280×800`, `390×844` (mở đầu toàn màn hình).
Expected: đường chấm mật nối nút lục giác 01 → 04 (ảnh chụp cửa sổ cao nên tiến độ có thể đã đầy); nút lục giác thẳng hàng với đường; mở đầu điện thoại chữ trắng trên video, header trắng; máy tính video sát mép phải.

- [ ] **Step 5: Commit**

```bash
git add -A src index.html assets/app.js
git commit -m "Draw bee flight path on scroll and sync chapter rail with current chapter"
```
