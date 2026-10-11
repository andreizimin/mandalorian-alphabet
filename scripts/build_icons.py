"""Builds the Home Screen icons (public/icons/*.png) from the bundled Mandalorian font.

Usage (needs fonttools, brotli and pillow):
    python3 -I scripts/build_icons.py public/fonts/mando-af-regular.woff2 public/icons

Draws the glyph for "m" (for Mando) in warm beskar gold on a near-black background, kept inside
the central 70 % so it survives the corner masks iOS and Android apply.
"""

import io
import sys
from pathlib import Path

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

BACKGROUND = (27, 27, 29)
GLYPH = (217, 160, 102)
LETTER = "m"
SIZES = {"apple-touch-icon.png": 180, "icon-192.png": 192, "icon-512.png": 512}


def font_bytes(woff2_path):
    font = TTFont(woff2_path)
    font.flavor = None
    buffer = io.BytesIO()
    font.save(buffer)
    return buffer.getvalue()


def icon(size, data):
    image = Image.new("RGB", (size, size), BACKGROUND)
    draw = ImageDraw.Draw(image)
    target = size * 0.7
    font_size = int(size * 0.8)
    while True:
        font = ImageFont.truetype(io.BytesIO(data), font_size)
        left, top, right, bottom = draw.textbbox((0, 0), LETTER, font=font)
        if max(right - left, bottom - top) <= target or font_size < 8:
            break
        font_size -= 2
    x = (size - (right - left)) / 2 - left
    y = (size - (bottom - top)) / 2 - top
    draw.text((x, y), LETTER, font=font, fill=GLYPH)
    return image


def main(font_path, out_dir):
    data = font_bytes(font_path)
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    for name, size in SIZES.items():
        icon(size, data).save(out / name, optimize=True)
        print(f"{name}: {size}x{size}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
