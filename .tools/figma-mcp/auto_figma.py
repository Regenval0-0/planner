import time
import pyautogui
from pywinauto import Application

# Конфигурация
MANIFEST_PATH = r"C:\Ren\.tools\figma-mcp\plugins\supercharged-figma\manifest.json"
PLUGIN_NAME = "Supercharged Figma AI"

print("=" * 60)
print(" Figma Plugin Auto-Installer & Connector")
print("=" * 60)

# Шаг 1: Найти и активировать Figma
print("\n[1/8] Finding Figma window...")
try:
    app = Application(backend="uia").connect(title_re=".*Figma.*")
    figma = app.window(title_re=".*Figma.*")
    figma.set_focus()
    print("   OK - Figma found and focused")
    time.sleep(1)
except Exception as e:
    print(f"   FAIL - {e}")
    exit(1)

# Шаг 2: Попробовать открыть меню через pywinauto
print("\n[2/8] Opening Plugins -> Development -> Import plugin from manifest...")
menu_worked = False
try:
    figma.menu_select("Plugins->Development->Import plugin from manifest...")
    print("   OK - Menu opened via UI Automation")
    menu_worked = True
    time.sleep(2)
except Exception as e:
    print(f"   FAIL - {e}")
    print("   Trying keyboard fallback...")

# Шаг 3: Если меню не сработало — пробуем через Quick Actions
if not menu_worked:
    print("\n[3/8] Trying Quick Actions (Ctrl+/)...")
    pyautogui.keyDown('ctrl')
    pyautogui.keyDown('slash')
    pyautogui.keyUp('slash')
    pyautogui.keyUp('ctrl')
    time.sleep(1)
    pyautogui.typewrite("import plugin from manifest", interval=0.01)
    time.sleep(0.5)
    pyautogui.keyDown('return')
    pyautogui.keyUp('return')
    print("   OK - Quick Actions invoked")
    time.sleep(3)
else:
    print("\n[3/8] Skipping Quick Actions (menu worked)")

# Шаг 4: Ввести путь к manifest.json в диалоге
print("\n[4/8] Entering manifest path in file dialog...")
time.sleep(2)  # Ждём открытия диалога
pyautogui.typewrite(MANIFEST_PATH, interval=0.01)
time.sleep(0.5)
pyautogui.keyDown('return')
pyautogui.keyUp('return')
print("   OK - Path entered")
time.sleep(3)

# Шаг 5: Ждём загрузки плагина
print("\n[5/8] Waiting for plugin to be imported...")
time.sleep(5)
print("   OK - Waited 5 seconds")

# Шаг 6: Запустить плагин через Quick Actions
print("\n[6/8] Launching plugin via Quick Actions...")
pyautogui.keyDown('ctrl')
pyautogui.keyDown('slash')
pyautogui.keyUp('slash')
pyautogui.keyUp('ctrl')
time.sleep(1)
pyautogui.typewrite(PLUGIN_NAME, interval=0.01)
time.sleep(0.5)
pyautogui.keyDown('return')
pyautogui.keyUp('return')
print("   OK - Plugin launch command sent")
time.sleep(3)

# Шаг 7: Кликнуть "Connect" в UI плагина (если есть)
print("\n[7/8] Attempting to click Connect in plugin UI...")
# Делаем скриншот для диагностики
pyautogui.screenshot(r"C:\Ren\.tools\figma-mcp\step7_plugin_ui.png")
print(r"   Screenshot saved to step7_plugin_ui.png")
# Попробуем кликнуть по центру плагина (он обычно открывается справа/снизу)
screen_w, screen_h = pyautogui.size()
# Плагин обычно открывается в модальном окне по центру
center_x, center_y = screen_w // 2, screen_h // 2
pyautogui.click(center_x, center_y)
time.sleep(1)
print("   Clicked center of screen")

# Шаг 8: Извлечь Channel ID
print("\n[8/8] Extracting Channel ID...")
time.sleep(2)
pyautogui.screenshot(r"C:\Ren\.tools\figma-mcp\step8_channel_id.png")
print(r"   Screenshot saved to step8_channel_id.png")

print("\n" + "=" * 60)
print(" Done! Check the screenshots in C:/Ren/.tools/figma-mcp/")
print(" If you see Channel ID in step8_channel_id.png,")
print(" tell me: 'Connect to Figma, channel <ID>'")
print("=" * 60)
