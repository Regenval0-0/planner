import time
import pyautogui

# Отключаем fail-safe (чтобы скрипт не остановился при движении мыши в угол)
pyautogui.FAILSAFE = False

MANIFEST_PATH = r"C:\Ren\.tools\figma-mcp\plugins\supercharged-figma\manifest.json"

print("=" * 60)
print(" Figma Plugin Auto-Installer v2")
print("=" * 60)

# Подвинуть мышь, чтобы fail-safe не сработал
pyautogui.moveTo(500, 500, duration=0.5)

# Шаг 1: Переключиться на Figma через Alt+Tab
print("\n[1/6] Switching to Figma via Alt+Tab...")
pyautogui.keyDown('alt')
pyautogui.keyDown('tab')
pyautogui.keyUp('tab')
pyautogui.keyUp('alt')
time.sleep(1)
print("   OK")

# Шаг 2: Открыть Quick Actions
print("\n[2/6] Opening Quick Actions (Ctrl+/)...")
pyautogui.keyDown('ctrl')
pyautogui.keyDown('slash')
pyautogui.keyUp('slash')
pyautogui.keyUp('ctrl')
time.sleep(1)
print("   OK")

# Шаг 3: Набрать "import plugin from manifest"
print("\n[3/6] Typing 'import plugin from manifest'...")
pyautogui.typewrite("""import plugin from manifest""", interval=0.01)
time.sleep(0.5)
pyautogui.keyDown('return')
pyautogui.keyUp('return')
print("   OK")
time.sleep(3)

# Шаг 4: Ввести путь к manifest в диалоге
print("\n[4/6] Entering manifest path...")
pyautogui.typewrite(MANIFEST_PATH, interval=0.01)
time.sleep(0.5)
pyautogui.keyDown('return')
pyautogui.keyUp('return')
print("   OK")
time.sleep(5)

# Шаг 5: Запустить плагин через Quick Actions
print("\n[5/6] Launching plugin...")
pyautogui.keyDown('ctrl')
pyautogui.keyDown('slash')
pyautogui.keyUp('slash')
pyautogui.keyUp('ctrl')
time.sleep(1)
pyautogui.typewrite("Supercharged Figma AI", interval=0.01)
time.sleep(0.5)
pyautogui.keyDown('return')
pyautogui.keyUp('return')
print("   OK")
time.sleep(3)

# Шаг 6: Сделать скриншот
print("\n[6/6] Taking screenshot...")
pyautogui.screenshot(r"C:\Ren\.tools\figma-mcp\final_screenshot.png")
print("   Screenshot saved to C:/Ren/.tools/figma-mcp/final_screenshot.png")

print("\n" + "=" * 60)
print(" Done! If plugin opened, copy Channel ID and tell me.")
print("=" * 60)
