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
    'sm': (540, 960, 'hero-sm.mp4', 'hero-poster-sm.webp', 34),   # nén mạnh hơn cho mạng di động
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
