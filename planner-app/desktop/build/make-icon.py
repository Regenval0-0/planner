from PIL import Image, ImageDraw, ImageFont
import os

build_dir = os.path.dirname(os.path.abspath(__file__))

size = 512
img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

bg_color = (14, 165, 233, 255)
radius = 112

# Draw rounded rectangle manually (PIL 10.0+ has rounded_rectangle)
try:
    draw.rounded_rectangle([0, 0, size-1, size-1], radius=radius, fill=bg_color)
except AttributeError:
    # Fallback for older PIL: draw circle in corners then rectangle
    draw.ellipse([0, 0, radius*2, radius*2], fill=bg_color)
    draw.ellipse([size-radius*2, 0, size-1, radius*2], fill=bg_color)
    draw.ellipse([0, size-radius*2, radius*2, size-1], fill=bg_color)
    draw.ellipse([size-radius*2, size-radius*2, size-1, size-1], fill=bg_color)
    draw.rectangle([radius, 0, size-radius-1, size-1], fill=bg_color)
    draw.rectangle([0, radius, size-1, size-radius-1], fill=bg_color)

white = (255, 255, 255, 255)
text = "P"
font_size = 260
try:
    font = ImageFont.truetype("segoeui.ttf", font_size)
except:
    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        font = ImageFont.load_default()

bbox = draw.textbbox((0, 0), text, font=font)
text_w = bbox[2] - bbox[0]
text_h = bbox[3] - bbox[1]
tx = (size - text_w) // 2
ty = (size - text_h) // 2 - 10

draw.text((tx, ty), text, font=font, fill=white)

png_path = os.path.join(build_dir, "icon.png")
img.save(png_path, "PNG")

ico_path = os.path.join(build_dir, "icon.ico")
sizes = [16, 24, 32, 48, 64, 128, 256]
ico_images = []
for s in sizes:
    ico_img = img.resize((s, s), Image.LANCZOS)
    ico_images.append(ico_img)

ico_images[0].save(ico_path, format="ICO", sizes=[(i.width, i.height) for i in ico_images])

print(f"PNG: {png_path}")
print(f"ICO: {ico_path}")
