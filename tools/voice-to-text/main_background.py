import os
import sys
import ctypes
import datetime

# === ЛОГИРОВАНИЕ С САМОГО НАЧАЛА ===
LOG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "voice_log.txt")

def _log(msg: str) -> None:
    try:
        with open(LOG_PATH, "a", encoding="utf-8") as f:
            ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            f.write(f"[{ts}] {msg}\n")
    except Exception as e:
        pass

_log("=" * 40)
_log("🚀 Старт main_background.py")
_log(f"Python: {sys.executable}")
_log(f"Аргументы: {sys.argv}")

# === ПРОВЕРКА ПРАВ АДМИНИСТРАТОРА ===
def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except Exception as e:
        _log(f"⚠️ Ошибка проверки прав: {e}")
        return False

_admin = is_admin()
if _admin:
    _log("✅ Права администратора есть.")
else:
    _log("⚠️ Запущено без прав администратора — продолжаем. Если Ctrl+' не работает, запусти скрипт вручную от имени администратора.")

# === ИМПОРТЫ ===
try:
    import speech_recognition as sr
    _log("✅ speech_recognition импортирован")
except Exception as e:
    _log(f"❌ speech_recognition: {e}")
    sr = None

try:
    import pyperclip
    _log("✅ pyperclip импортирован")
except Exception as e:
    _log(f"❌ pyperclip: {e}")
    pyperclip = None

try:
    import keyboard
    _log("✅ keyboard импортирован")
except Exception as e:
    _log(f"❌ keyboard: {e}")
    keyboard = None

try:
    import pyaudio
    _log("✅ pyaudio импортирован")
except Exception as e:
    _log(f"❌ pyaudio: {e}")
    pyaudio = None

import threading
import time
import io

# === УВЕДОМЛЕНИЕ О СТАРТЕ ===
def _notify(title: str, msg: str) -> None:
    try:
        ctypes.windll.user32.MessageBoxW(0, msg, title, 0x40 | 0x0)
    except Exception as e:
        _log(f"⚠️ Не удалось показать уведомление: {e}")

_is_recording = False
_recording_lock = threading.Lock()
_last_hotkey_time = 0


def _beep(freq: int = 800, duration: int = 150) -> None:
    try:
        import winsound
        winsound.Beep(freq, duration)
    except Exception:
        try:
            ctypes.windll.user32.MessageBeep(0x00000030)
        except Exception:
            pass


def _process_text(text: str) -> None:
    _log(f"✅ Распознано: {text}")
    try:
        pyperclip.copy(text)
        time.sleep(0.15)
        keyboard.send('ctrl+v')
        _beep(600, 100)
        _log("✅ Текст вставлен. Жми Enter для отправки.")
    except Exception as e:
        _log(f"⚠️ Ошибка вставки: {e}")


def _recognize_audio(audio_data: sr.AudioData) -> None:
    recognizer = sr.Recognizer()
    try:
        text = recognizer.recognize_google(audio_data, language="ru-RU")
        _process_text(text)
    except sr.UnknownValueError:
        _log("❌ Речь не распознана")
    except sr.RequestError as e:
        _log(f"❌ Ошибка сети: {e}")


def _recording_thread() -> None:
    global _is_recording

    if not pyaudio:
        _log("❌ PyAudio не установлен")
        return

    try:
        pa = pyaudio.PyAudio()
        stream = pa.open(
            format=pyaudio.paInt16,
            channels=1,
            rate=16000,
            input=True,
            frames_per_buffer=1024
        )
    except Exception as e:
        _log(f"❌ Не удалось открыть микрофон: {e}")
        return

    buffer = io.BytesIO()
    _beep(1200, 100)
    _log("🎤 Запись началась")

    while True:
        with _recording_lock:
            if not _is_recording:
                break
        try:
            data = stream.read(1024, exception_on_overflow=False)
            buffer.write(data)
        except Exception as e:
            _log(f"❌ Ошибка записи: {e}")
            break

    _beep(400, 100)
    _log("⏹ Запись остановлена. Распознаю...")

    stream.stop_stream()
    stream.close()
    pa.terminate()

    raw_data = buffer.getvalue()
    if len(raw_data) > 0:
        audio = sr.AudioData(raw_data, 16000, 2)
        _recognize_audio(audio)
    else:
        _log("⚠️ Аудио не записано")

    _log("⏳ Ожидание Ctrl+/...")


def _toggle_recording() -> None:
    global _is_recording

    with _recording_lock:
        if not _is_recording:
            _is_recording = True
            threading.Thread(target=_recording_thread, daemon=True).start()
        else:
            _is_recording = False


def main() -> None:
    if not keyboard:
        _log("❌ Модуль 'keyboard' не установлен")
        _notify("Голосовой ввод — Ошибка", "Модуль keyboard не установлен.\nЗапусти setup.bat")
        sys.exit(1)

    if not pyaudio:
        _log("❌ PyAudio не установлен")
        _notify("Голосовой ввод — Ошибка", "PyAudio не установлен.\nЗапусти setup.bat")
        sys.exit(1)

    _log("=" * 40)
    _log("🎙 Голосовой ввод запущен (toggle режим)")
    _log("=" * 40)

    def _on_apostrophe_press(event):
        global _last_hotkey_time
        if keyboard.is_pressed('ctrl'):
            now = time.time()
            if now - _last_hotkey_time < 0.5:
                return False
            _last_hotkey_time = now
            _toggle_recording()
            return False
        return True

    try:
        keyboard.on_press_key(40, _on_apostrophe_press)
        _log("🔥 Горячая клавиша Ctrl+' активна")
    except Exception as e:
        _log(f"⚠️ Не удалось зарегистрировать хоткей: {e}")
        _notify("Голосовой ввод — Ошибка", f"Не удалось зарегистрировать Ctrl+':\n{e}")
        sys.exit(1)

    _notify("Голосовой ввод", "✅ Работает!\nНажми Ctrl+' → говори → Ctrl+' → Enter")
    _log("✅ Уведомление показано. Цикл ожидания...")

    while True:
        time.sleep(1)


if __name__ == "__main__":
    main()
