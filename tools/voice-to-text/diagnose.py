import sys, ctypes, time, os

LOG = os.path.join(os.path.dirname(__file__), "voice_log.txt")

def log(msg):
    ts = time.strftime("%H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    try:
        with open(LOG, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass

log("=" * 40)
log("DIAGNOSTIKA: test s F12")
log("=" * 40)

try:
    import keyboard
    log("OK keyboard zagruzhen")
except Exception as e:
    log(f"FAIL keyboard: {e}")
    sys.exit(1)

count = [0]

def on_hotkey():
    count[0] += 1
    log(f"HOTKEY F12 SRABOTAL! ({count[0]} raz)")
    ctypes.windll.user32.MessageBoxW(0, f"F12 RABOTAET!\nNazhata {count[0]} raz.", "Diagnostika", 0x40)

keyboard.add_hotkey("f12", on_hotkey)
log("Zaregistrirovan F12 - zhdem nazhatiya...")
log("(Nazhmi F12 v lyubom meste)")
log("Dlya vykhoda: Ctrl+C v etom okne")

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    log("Poka")
