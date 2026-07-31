from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1080, 2340

# Try to load system fonts
font_paths = [
    "C:/Windows/Fonts/segoeui.ttf",
    "C:/Windows/Fonts/arial.ttf",
    "C:/Windows/Fonts/calibri.ttf",
    "C:/Windows/Fonts/verdana.ttf",
]

def load_font(size):
    for fp in font_paths:
        if os.path.exists(fp):
            return ImageFont.truetype(fp, size)
    return ImageFont.load_default()

def load_font_bold(size):
    bold_paths = [
        "C:/Windows/Fonts/segoeuib.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/calibrib.ttf",
        "C:/Windows/Fonts/verdanab.ttf",
    ]
    for fp in bold_paths:
        if os.path.exists(fp):
            return ImageFont.truetype(fp, size)
    return load_font(size)

font_large = load_font_bold(64)
font_title = load_font_bold(48)
font_body = load_font(36)
font_small = load_font(28)
font_tiny = load_font(24)

out_dir = os.path.dirname(os.path.abspath(__file__))

# Colors
INDIGO = (79, 70, 229)
INDIGO_DARK = (67, 56, 202)
WHITE = (255, 255, 255)
GRAY_50 = (249, 250, 251)
GRAY_100 = (243, 244, 246)
GRAY_200 = (229, 231, 235)
GRAY_300 = (209, 213, 219)
GRAY_400 = (156, 163, 175)
GRAY_500 = (107, 114, 128)
GRAY_600 = (75, 85, 99)
GRAY_700 = (55, 65, 81)
GRAY_800 = (31, 41, 55)
GRAY_900 = (17, 24, 39)
SLATE_800 = (30, 41, 59)
SLATE_900 = (15, 23, 42)
SLATE_700 = (51, 65, 85)
GREEN = (34, 197, 94)
BLUE = (59, 130, 246)
PURPLE = (168, 85, 247)
ORANGE = (251, 146, 60)
RED = (239, 68, 68)

def rounded_rect(draw, xy, radius, fill):
    x1, y1, x2, y2 = xy
    draw.rounded_rectangle(xy, radius=radius, fill=fill)

def draw_button(draw, xy, text, font, fill=(79, 70, 229), text_color=WHITE):
    rounded_rect(draw, xy, 24, fill)
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    cx = (xy[0] + xy[2]) // 2 - tw // 2
    cy = (xy[1] + xy[3]) // 2 - th // 2 - 4
    draw.text((cx, cy), text, fill=text_color, font=font)

def draw_input(draw, xy, placeholder, font, fill=WHITE, border=GRAY_300):
    rounded_rect(draw, xy, 16, fill)
    draw.rounded_rectangle(xy, radius=16, outline=border, width=2)
    draw.text((xy[0] + 30, xy[1] + 22), placeholder, fill=GRAY_400, font=font)

def draw_status_bar(draw, bg=WHITE):
    draw.rectangle([0, 0, W, 60], fill=bg)
    draw.text((30, 10), "9:41", fill=GRAY_800 if bg == WHITE else GRAY_300, font=font_tiny)
    draw.text((W - 140, 10), "100%  Wi-Fi", fill=GRAY_800 if bg == WHITE else GRAY_300, font=font_tiny)

# ========== 01-setup.png ==========
img = Image.new('RGB', (W, H), (238, 242, 255))
draw = ImageDraw.Draw(img)

# Gradient background
for y in range(H):
    r = int(238 - (y / H) * 20)
    g = int(242 - (y / H) * 10)
    b = int(255 - (y / H) * 10)
    draw.line([(0, y), (W, y)], fill=(r, g, b))

draw_status_bar(draw, bg=(238, 242, 255))

# Card
card_x, card_y = 80, 280
card_w, card_h = W - 160, 1200
rounded_rect(draw, [card_x, card_y, card_x + card_w, card_y + card_h], 32, WHITE)

# Icon
draw.rounded_rectangle([card_x + card_w//2 - 70, card_y + 60, card_x + card_w//2 + 70, card_y + 200], radius=28, fill=(224, 231, 255))
bbox = draw.textbbox((0, 0), "→", font=font_large)
tw = bbox[2] - bbox[0]
draw.text((card_x + card_w//2 - tw//2, card_y + 90), "→", fill=INDIGO, font=font_large)

# Title
draw.text((card_x + 60, card_y + 240), "Добро пожаловать", fill=GRAY_900, font=font_title)
draw.text((card_x + 60, card_y + 310), "Настройте подключение к серверу", fill=GRAY_500, font=font_body)

# Input
draw_input(draw, [card_x + 60, card_y + 420, card_x + card_w - 60, card_y + 510], "https://planner-backend-xxx.onrender.com", font_small)

# Button
draw_button(draw, [card_x + 60, card_y + 560, card_x + card_w - 60, card_y + 650], "Подключиться к серверу", font_body)

# Secondary button
rounded_rect(draw, [card_x + 60, card_y + 690, card_x + card_w - 60, card_y + 780], 24, WHITE)
draw.rounded_rectangle([card_x + 60, card_y + 690, card_x + card_w - 60, card_y + 780], radius=24, outline=GRAY_300, width=2)
draw.text((card_x + 160, card_y + 720), "🔍 Найти сервер в сети", fill=GRAY_700, font=font_body)

# Info block
info_y = card_y + 860
draw.text((card_x + 60, info_y), "КАК ПОЛУЧИТЬ СЕРВЕР:", fill=GRAY_500, font=font_small)
for i, line in enumerate([
    "1. Нажмите кнопку Deploy to Render в README",
    "2. Дождитесь окончания сборки (3-5 минут)",
    "3. Скопируйте URL из Dashboard Render",
    "4. Вставьте его выше и нажмите «Подключиться»",
]):
    draw.text((card_x + 60, info_y + 50 + i * 50), line, fill=GRAY_500, font=font_tiny)

img.save(f"{out_dir}/screenshots/01-setup.png")
print("✅ 01-setup.png")

# ========== 02-login.png ==========
img = Image.new('RGB', (W, H), SLATE_900)
draw = ImageDraw.Draw(img)

# Gradient dark background
for y in range(H):
    r = int(15 + (y / H) * 15)
    g = int(23 + (y / H) * 10)
    b = int(42 + (y / H) * 5)
    draw.line([(0, y), (W, y)], fill=(r, g, b))

draw_status_bar(draw, bg=SLATE_900)

# Card
card_x, card_y = 60, 400
card_w, card_h = W - 120, 1400
rounded_rect(draw, [card_x, card_y, card_x + card_w, card_y + card_h], 40, (30, 41, 59, 180))

# Logo
draw.rounded_rectangle([card_x + card_w//2 - 80, card_y + 80, card_x + card_w//2 + 80, card_y + 240], radius=28, fill=(56, 189, 248))
bbox = draw.textbbox((0, 0), "П", font=font_large)
tw = bbox[2] - bbox[0]
draw.text((card_x + card_w//2 - tw//2, card_y + 110), "П", fill=WHITE, font=font_large)

# Title
draw.text((card_x + 60, card_y + 300), "Вход", fill=WHITE, font=font_title)
draw.text((card_x + 60, card_y + 370), "Войдите в свой аккаунт", fill=(148, 163, 184), font=font_body)

# Inputs
rounded_rect(draw, [card_x + 60, card_y + 480, card_x + card_w - 60, card_y + 570], 20, SLATE_700)
draw.text((card_x + 90, card_y + 500), "Ваш логин", fill=GRAY_400, font=font_small)

rounded_rect(draw, [card_x + 60, card_y + 610, card_x + card_w - 60, card_y + 700], 20, SLATE_700)
draw.text((card_x + 90, card_y + 630), "••••••", fill=GRAY_400, font=font_small)

# Button
draw_button(draw, [card_x + 60, card_y + 780, card_x + card_w - 60, card_y + 870], "Войти", font_body, fill=(14, 165, 233))

# Links
for i, txt in enumerate(["Забыли логин?", "Забыли пароль?", "Нет аккаунта? Создать"]):
    color = (148, 163, 184) if i < 2 else (56, 189, 248)
    draw.text((card_x + 60, card_y + 940 + i * 60), txt, fill=color, font=font_small)

img.save(f"{out_dir}/screenshots/02-login.png")
print("✅ 02-login.png")

# ========== 03-calendar.png ==========
img = Image.new('RGB', (W, H), GRAY_50)
draw = ImageDraw.Draw(img)
draw_status_bar(draw, bg=WHITE)

# Header
rounded_rect(draw, [0, 60, W, 220], 0, WHITE)
draw.text((40, 100), "Планер", fill=GRAY_900, font=font_title)

# Status badges
rounded_rect(draw, [W - 280, 100, W - 40, 160], 28, (224, 231, 255))
draw.text((W - 250, 115), "Синхронизация", fill=INDIGO, font=font_tiny)

# Month selector
rounded_rect(draw, [40, 240, 160, 320], 24, WHITE)
draw.rounded_rectangle([40, 240, 160, 320], radius=24, outline=GRAY_200, width=2)
draw.text((70, 265), "←", fill=GRAY_800, font=font_title)

rounded_rect(draw, [200, 240, 580, 320], 24, WHITE)
draw.rounded_rectangle([200, 240, 580, 320], radius=24, outline=GRAY_200, width=2)
draw.text((260, 265), "Июль 2026", fill=GRAY_800, font=font_body)

rounded_rect(draw, [620, 240, 740, 320], 24, WHITE)
draw.rounded_rectangle([620, 240, 740, 320], radius=24, outline=GRAY_200, width=2)
draw.text((650, 265), "→", fill=GRAY_800, font=font_title)

draw_button(draw, [780, 240, 1000, 320], "Сегодня", font_small)

# Calendar grid
draw.text((40, 360), "Пн   Вт   Ср   Чт   Пт   Сб   Вс", fill=GRAY_500, font=font_small)

# Days
days_start_y = 420
cell_w = (W - 80) // 7
for row in range(5):
    for col in range(7):
        day = row * 7 + col - 1
        if day < 1 or day > 31:
            continue
        x = 40 + col * cell_w
        y = days_start_y + row * 100
        rounded_rect(draw, [x + 4, y, x + cell_w - 4, y + 80], 12, WHITE)
        draw.text((x + cell_w//2 - 12, y + 20), str(day), fill=GRAY_800, font=font_small)
        if day == 31:
            draw.rounded_rectangle([x + 4, y, x + cell_w - 4, y + 80], radius=12, outline=INDIGO, width=3)
        if day in [5, 12, 20]:
            # Event dots
            colors = [BLUE, GREEN, PURPLE]
            for di, dc in enumerate(colors[:1] if day == 5 else colors[:2] if day == 12 else colors):
                draw.ellipse([x + 20 + di * 22, y + 60, x + 36 + di * 22, y + 76], fill=dc)

# Add button
draw_button(draw, [W - 160, days_start_y + 5 * 100 + 40, W - 40, days_start_y + 5 * 100 + 120], "+ Добавить", font_small)

# Upcoming panel
panel_y = days_start_y + 5 * 100 + 180
rounded_rect(draw, [40, panel_y, W - 40, panel_y + 400], 28, WHITE)
draw.text((70, panel_y + 30), "Предстоящие", fill=GRAY_800, font=font_title)

events = [
    ("Совещание", "12 июл · 10:00", PURPLE),
    ("Оплатить аренду", "20 июл · 45 000 ₽", ORANGE),
    ("День рождения", "25 июл", BLUE),
]
for i, (title, sub, color) in enumerate(events):
    y = panel_y + 100 + i * 100
    draw.rounded_rectangle([70, y, 76, y + 50], radius=4, fill=color)
    draw.text((100, y + 5), title, fill=GRAY_800, font=font_body)
    draw.text((100, y + 45), sub, fill=GRAY_500, font=font_tiny)

img.save(f"{out_dir}/screenshots/03-calendar.png")
print("✅ 03-calendar.png")

# ========== 04-settings.png ==========
img = Image.new('RGB', (W, H), SLATE_900)
draw = ImageDraw.Draw(img)

for y in range(H):
    r = int(15 + (y / H) * 10)
    g = int(23 + (y / H) * 8)
    b = int(42 + (y / H) * 4)
    draw.line([(0, y), (W, y)], fill=(r, g, b))

draw_status_bar(draw, bg=SLATE_900)

# Card
card_x, card_y = 60, 200
card_w, card_h = W - 120, 1800
rounded_rect(draw, [card_x, card_y, card_x + card_w, card_y + card_h], 32, SLATE_800)

draw.text((card_x + 40, card_y + 40), "← Назад", fill=GRAY_400, font=font_body)
draw.text((card_x + 40, card_y + 110), "Настройки", fill=WHITE, font=font_title)

# Theme section
y = card_y + 220
draw.text((card_x + 40, y), "ТЕМА ОФОРМЛЕНИЯ", fill=GRAY_400, font=font_tiny)
for i, (label, active) in enumerate([("☀️ Светлая", False), ("🌙 Тёмная", True), ("💻 Системная", False)]):
    bx = card_x + 40 + i * 280
    fill = (51, 65, 85) if active else SLATE_800
    border = INDIGO if active else (75, 85, 99)
    rounded_rect(draw, [bx, y + 50, bx + 260, y + 130], 20, fill)
    draw.rounded_rectangle([bx, y + 50, bx + 260, y + 130], radius=20, outline=border, width=3 if active else 1)
    draw.text((bx + 20, y + 70), label, fill=WHITE if active else GRAY_300, font=font_small)

# Accent colors
y = card_y + 420
draw.text((card_x + 40, y), "АКЦЕНТНЫЙ ЦВВЕТ", fill=GRAY_400, font=font_tiny)
accents = [INDIGO, (37, 99, 235), (16, 185, 129), (225, 29, 72), (245, 158, 11)]
for i, color in enumerate(accents):
    bx = card_x + 40 + i * 100
    draw.ellipse([bx, y + 50, bx + 80, y + 130], fill=color)
    if i == 0:
        draw.text((bx + 25, y + 70), "✓", fill=WHITE, font=font_body)

# Server URL
y = card_y + 620
draw.text((card_x + 40, y), "СЕРВЕР СИНХРОНИЗАЦИИ", fill=GRAY_400, font=font_tiny)
rounded_rect(draw, [card_x + 40, y + 50, card_x + card_w - 40, y + 130], 16, SLATE_700)
draw.text((card_x + 70, y + 75), "https://planner-backend-xxx.onrender.com", fill=WHITE, font=font_small)

draw_button(draw, [card_x + 40, y + 160, card_x + card_w - 40, y + 240], "Сохранить", font_body)

# Backup section
y = card_y + 980
draw.text((card_x + 40, y), "💾 РЕЗЕРВНАЯ КОПИЯ", fill=GRAY_400, font=font_tiny)
rounded_rect(draw, [card_x + 40, y + 60, card_x + card_w//2 - 20, y + 140], 20, SLATE_700)
draw.text((card_x + 80, y + 85), "📤 Экспорт", fill=WHITE, font=font_small)
rounded_rect(draw, [card_x + card_w//2 + 20, y + 60, card_x + card_w - 40, y + 140], 20, SLATE_700)
draw.text((card_x + card_w//2 + 60, y + 85), "📥 Импорт", fill=WHITE, font=font_small)

# Legal
y = card_y + 1250
draw.text((card_x + 40, y), "Правовая информация", fill=WHITE, font=font_body)
draw.text((card_x + 40, y + 60), "Политика конфиденциальности", fill=INDIGO, font=font_small)

img.save(f"{out_dir}/screenshots/04-settings.png")
print("✅ 04-settings.png")

# ========== 05-add-event.png ==========
img = Image.new('RGB', (W, H), GRAY_50)
draw = ImageDraw.Draw(img)
draw_status_bar(draw, bg=GRAY_50)

# Modal overlay
draw.rectangle([0, 0, W, H], fill=(0, 0, 0, 40))

# Modal card
mx, my = 60, 300
mw, mh = W - 120, 1400
rounded_rect(draw, [mx, my, mx + mw, my + mh], 32, WHITE)

draw.text((mx + 40, my + 40), "Новое событие", fill=GRAY_900, font=font_title)

# Title input
rounded_rect(draw, [mx + 40, my + 130, mx + mw - 40, my + 210], 16, WHITE)
draw.rounded_rectangle([mx + 40, my + 130, mx + mw - 40, my + 210], radius=16, outline=GRAY_300, width=2)
draw.text((mx + 70, my + 155), "Встреча с клиентом", fill=GRAY_800, font=font_body)

# Description
rounded_rect(draw, [mx + 40, my + 240, mx + mw - 40, my + 340], 16, WHITE)
draw.rounded_rectangle([mx + 40, my + 240, mx + mw - 40, my + 340], radius=16, outline=GRAY_300, width=2)
draw.text((mx + 70, my + 265), "Обсудить детали проекта", fill=GRAY_400, font=font_small)

# Type selector
draw.text((mx + 40, my + 380), "Тип", fill=GRAY_700, font=font_small)
rounded_rect(draw, [mx + 40, my + 420, mx + mw - 40, my + 500], 16, WHITE)
draw.rounded_rectangle([mx + 40, my + 420, mx + mw - 40, my + 500], radius=16, outline=GRAY_300, width=2)
draw.text((mx + 70, my + 440), "Встреча", fill=GRAY_800, font=font_body)

# Date/time inputs
for i, (label, val) in enumerate([("Дата и время", "2026-07-31T10:00"), ("Время окончания", "11:30")]):
    y = my + 540 + i * 120
    draw.text((mx + 40, y), label, fill=GRAY_700, font=font_small)
    rounded_rect(draw, [mx + 40, y + 40, mx + mw - 40, y + 120], 16, WHITE)
    draw.rounded_rectangle([mx + 40, y + 40, mx + mw - 40, y + 120], radius=16, outline=GRAY_300, width=2)
    draw.text((mx + 70, y + 60), val, fill=GRAY_800, font=font_body)

# Reminder
draw.text((mx + 40, my + 840), "Напоминание", fill=GRAY_700, font=font_small)
rounded_rect(draw, [mx + 40, my + 880, mx + mw - 40, my + 960], 16, WHITE)
draw.rounded_rectangle([mx + 40, my + 880, mx + mw - 40, my + 960], radius=16, outline=GRAY_300, width=2)
draw.text((mx + 70, my + 900), "За 15 минут", fill=GRAY_800, font=font_body)

# Buttons
draw_button(draw, [mx + 40, my + 1020, mx + mw//2 - 20, my + 1100], "Сохранить", font_body)
rounded_rect(draw, [mx + mw//2 + 20, my + 1020, mx + mw - 40, my + 1100], 20, GRAY_100)
draw.rounded_rectangle([mx + mw//2 + 20, my + 1020, mx + mw - 40, my + 1100], radius=20, outline=GRAY_200, width=2)
draw.text((mx + mw//2 + 90, my + 1045), "Отмена", fill=GRAY_700, font=font_body)

img.save(f"{out_dir}/screenshots/05-add-event.png")
print("✅ 05-add-event.png")

print("\n🎉 Все скриншоты готовы!")
