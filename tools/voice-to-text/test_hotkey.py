import sys
import ctypes
import time

try:
    import keyboard
except ImportError:
    print("[ERROR] Modul 'keyboard' ne ustanovlen.")
    print("        pip install keyboard")
    sys.exit(1)


def _beep():
    """Korotkiy zvukovoy signal."""
    try:
        ctypes.windll.user32.MessageBeep(0x00000030)
    except Exception:
        pass


def _show_popup(text: str):
    """Pokazyvaet Windows MessageBox."""
    try:
        ctypes.windll.user32.MessageBoxW(0, text, "Golosovoy vvod", 0x40)
    except Exception:
        pass


def _on_test_hotkey():
    """Testovyy obrabotchik: zvuk + okno."""
    _beep()
    _show_popup("Goryachaya klavisha Ctrl+' RABOTAET!\n\nTeper mozhesh zapuskat osnovnoy skript.")


def main():
    print("=" * 50)
    print("TEST GORYACHEY KLAVISHI")
    print("=" * 50)
    print()
    print("Nazhmi Ctrl+' v lyubom meste.")
    print("Esli uvidish okno i uslyshish zvuk - vse rabotaet.")
    print()
    print("Dlya vykhoda: Ctrl+C ili zakroy eto okno.")
    print("-" * 50)

    _last_hotkey_time = 0

    def _on_apostrophe_press(event):
        nonlocal _last_hotkey_time
        if keyboard.is_pressed('ctrl'):
            now = time.time()
            if now - _last_hotkey_time < 0.5:
                return False
            _last_hotkey_time = now
            _on_test_hotkey()
            return False
        return True

    keyboard.on_press_key(40, _on_apostrophe_press)

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nPoka!")


if __name__ == "__main__":
    main()
