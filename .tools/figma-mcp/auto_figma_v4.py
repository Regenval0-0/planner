import time
import pyautogui
import ctypes
from pywinauto import Desktop
import subprocess

pyautogui.FAILSAFE = False

print("[v4] Starting automation...")

# 1. Activate Figma
d = Desktop(backend='win32')
figma = [w for w in d.windows() if 'figma' in w.window_text().lower()][0]
hwnd = figma.handle

ctypes.windll.user32.ShowWindow(hwnd, 5)
time.sleep(0.5)

# NirCmd activate
subprocess.run([r"C:\Ren\.tools\nircmd\nircmd.exe", "win", "activate", "ititle", "figma"], capture_output=True)
time.sleep(1.5)

# 2. Quick Actions
print("[v4] Opening Quick Actions...")
pyautogui.keyDown('ctrl')
pyautogui.keyDown('slash')
pyautogui.keyUp('slash')
pyautogui.keyUp('ctrl')
time.sleep(1.5)

# 3. Import plugin from manifest
print("[v4] Importing plugin...")
pyautogui.typewrite("""import plugin from manifest""", interval=0.01)
time.sleep(0.5)
pyautogui.keyDown('return')
pyautogui.keyUp('return')
time.sleep(2)

# 4. Enter manifest path
print("[v4] Entering manifest path...")
pyautogui.typewrite(r"C:\Ren\.tools\figma-mcp\plugins\supercharged-figma\manifest.json", interval=0.01)
time.sleep(0.5)
pyautogui.keyDown('return')
pyautogui.keyUp('return')
time.sleep(5)

# 5. Launch plugin
print("[v4] Launching plugin...")
pyautogui.keyDown('ctrl')
pyautogui.keyDown('slash')
pyautogui.keyUp('slash')
pyautogui.keyUp('ctrl')
time.sleep(1.5)
pyautogui.typewrite("Supercharged Figma AI", interval=0.01)
time.sleep(0.5)
pyautogui.keyDown('return')
pyautogui.keyUp('return')
time.sleep(3)

# 6. Screenshot
print("[v4] Taking screenshot...")
pyautogui.screenshot(r"C:\Ren\.tools\figma-mcp\final_attempt.png")
print("[v4] Done!")
