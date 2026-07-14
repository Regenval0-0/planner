from PIL import Image, ImageDraw, ImageFont
import os

# === 512x512 Store Icon ===
icon = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
draw = ImageDraw.Draw(icon)

# Background circle
bg_color = (79, 70, 229)  # Indigo 600
draw.ellipse([0, 0, 512, 512], fill=bg_color)

# Try to load a font, fallback to default
try:
    # Try system fonts
    font_paths = [
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibri.ttf",
    ]
    font = None
    for fp in font_paths:
        if os.path.exists(fp):
            font = ImageFont.truetype(fp, 280)
            break
    if font is None:
        font = ImageFont.load_default()
except Exception:
    font = ImageFont.load_default()

# Draw "П" (first letter of Планер)
text = "П"
bbox = draw.textbbox((0, 0), text, font=font)
text_width = bbox[2] - bbox[0]
text_height = bbox[3] - bbox[1]
position = ((512 - text_width) // 2, (512 - text_height) // 2 - 30)
draw.text(position, text, fill=(255, 255, 255, 255), font=font)

icon.save('/c/Ren/frontend/planner/rustore-assets/icon-512.png')
print("✅ icon-512.png created")

# === Feature Graphic 1400x560 ===
fg = Image.new('RGB', (1400, 560), (15, 23, 42))  # Dark slate
draw = ImageDraw.Draw(fg)

# Subtle gradient effect (simple stripes)
for y in range(560):
    r = int(15 + (y / 560) * 30)
    g = int(23 + (y / 560) * 40)
    b = int(42 + (y / 560) * 60)
    draw.line([(0, y), (1400, y)], fill=(r, g, b))

# Draw a circle accent on the left
draw.ellipse([80, 80, 480, 480], fill=(79, 70, 229))

# Try font for title
try:
    font_title = None
    for fp in font_paths:
        if os.path.exists(fp):
            font_title = ImageFont.truetype(fp, 90)
            font_sub = ImageFont.truetype(fp, 42)
            break
    if font_title is None:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()
except Exception:
    font_title = ImageFont.load_default()
    font_sub = ImageFont.load_default()

# Title text
title = "Планер"
sub = "Календарь · Задачи · Платежи"

bbox_t = draw.textbbox((0, 0), title, font=font_title)
tw = bbox_t[2] - bbox_t[0]
th = bbox_t[3] - bbox_t[1]
draw.text(((1400 - tw) // 2 + 150, (560 - th) // 2 - 30), title, fill=(255, 255, 255), font=font_title)

bbox_s = draw.textbbox((0, 0), sub, font=font_sub)
sw = bbox_s[2] - bbox_s[0]
sh = bbox_s[3] - bbox_s[1]
draw.text(((1400 - sw) // 2 + 150, (560 - sh) // 2 + 80), sub, fill=(148, 163, 184), font=font_sub)

fg.save('/c/Ren/frontend/planner/rustore-assets/feature-graphic-1400x560.png')
print("✅ feature-graphic-1400x560.png created")

