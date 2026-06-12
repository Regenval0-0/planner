import time
import pyautogui
from pywinauto import Desktop

pyautogui.FAILSAFE = False

MANIFEST_PATH = r"C:\Ren\.tools\figma-mcp\plugins\supercharged-figma\manifest.json"
PLUGIN_NAME = "Supercharged Figma AI"

def screenshot(name):
    path = rf"C:\Ren\.tools\figma-mcp\{name}.png"
    pyautogui.screenshot(path)
    print(f"   Screenshot: {path}")

print("=" * 60)
print(" Figma Plugin Auto-Installer v3")
print("=" * 60)

# Шаг 1: Найти и активировать окно Figma через Desktop
print("\n[1/8] Finding and activating Figma window...")
desktop = Desktop(backend='win32')
figma_windows = [w for w in desktop.windows() if 'figma' in w.window_text().lower()]
print(f"   Found {len(figma_windows)} Figma window(s): {[w.window_text() for w in figma_windows]}")

if not figma_windows:
    print("   FAIL - No Figma window found")
    exit(1)

figma = figma_windows[0]
try:
    figma.set_focus()
    time.sleep(0.5)
    figma.restore()
    time.sleep(0.5)
    figma.set_focus()
    print("   OK - Figma window focused and restored")
except Exception as e:
    print(f"   WARN - {e}")
    # Fallback: click taskbar icon (approximate)
    screen_w, screen_h = pyautogui.size()
    # Figma icon is usually around 5th icon on taskbar (1920x1080 ~250px from left)
    pyautogui.click(250, screen_h - 20)
    time.sleep(1)
    print("   OK - Clicked taskbar icon")

screenshot("step1_activated")

# Шаг 2: Открыть Quick Actions
print("\n[2/8] Opening Quick Actions (Ctrl+/)...")
pyautogui.keyDown('ctrl')
pyautogui.keyDown('slash')
pyautogui.keyUp('slash')
pyautogui.keyUp('ctrl')
time.sleep(1.5)
screenshot("step2_quick_actions")
print("   OK")

# Шаг 3: Набрать "import plugin from manifest"
print("\n[3/8] Typing 'import plugin from manifest'...")
pyautogui.typewrite("""import plugin from manifest""", interval=0.01)
time.sleep(0.5)
pyautogui.keyDown('return')
pyautogui.keyUp('return')
time.sleep(2)
screenshot("step3_import_dialog")
print("   OK")

# Шаг 4: Ввести путь в диалоге выбора файла
print("\n[4/8] Entering manifest path in file dialog...")
pyautogui.typewrite(MANIFEST_PATH, interval=0.01)
time.sleep(0.5)
pyautogui.keyDown('return')
pyautogui.keyUp('return')
time.sleep(4)
screenshot("step4_imported")
print("   OK")

# Шаг 5: Ждём загрузки плагина
print("\n[5/8] Waiting for plugin to be imported...")
time.sleep(5)
print("   OK")

# Шаг 6: Запустить плагин через Quick Actions
print("\n[6/8] Launching plugin via Quick Actions...")
pyautogui.keyDown('ctrl')
pyautogui.keyDown('slash')
pyautogui.keyUp('slash')
pyautogui.keyUp('ctrl')
time.sleep(1.5)
pyautogui.typewrite(PLUGIN_NAME, interval=0.01)
time.sleep(0.5)
pyautogui.keyDown('return')
pyautogui.keyUp('return')
time.sleep(3)
screenshot("step6_plugin_opened")
print("   OK")

# Шаг 7: Нажать Connect в UI плагина (если есть кнопка)
print("\n[7/8] Clicking Connect button in plugin UI...")
# Plugin UI usually opens as a modal or panel. Let's try clicking center of screen
# where plugin UI typically appears
screen_w, screen_h = pyautogui.size()
center_x, center_y = screen_w // 2, screen_h // 2
pyautogui.click(center_x, center_y)
time.sleep(0.5)
# Try clicking slightly right (plugin panel is usually on right side)
pyautogui.click(screen_w - 200, 200)
time.sleep(1)
screenshot("step7_connected")
print("   OK")

# Шаг 8: Сделать финальный скриншот
print("\n[8/8] Taking final screenshot...")
screenshot("step8_final")

print("\n" + "=" * 60)
print(" Done! Check screenshots in C:/Ren/.tools/figma-mcp/")
print(" If you see Channel ID in step8_final.png, tell me the ID!")
print("=" * 60)
