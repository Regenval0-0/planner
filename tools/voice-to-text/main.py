import speech_recognition as sr
import pyperclip
import sys
import threading
import time
import os
import ctypes
import io

try:
    import keyboard
except ImportError:
    keyboard = None

try:
    import pyaudio
except ImportError:
    pyaudio = None

try:
    import win32gui
    import win32con
    WIN32_AVAILABLE = True
except ImportError:
    WIN32_AVAILABLE = False

_is_recording = False
_recording_lock = threading.Lock()
_last_window_handle = None
_last_hotkey_time = 0


def is_admin() -> bool:
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except Exception:
        return False


def _beep(freq: int = 800, duration: int = 150) -> None:
    try:
        import winsound
        winsound.Beep(freq, duration)
    except Exception:
        try:
            ctypes.windll.user32.MessageBeep(0x00000030)
        except Exception:
            pass


def _get_active_window() -> int | None:
    """Get handle of currently focused window."""
    if not WIN32_AVAILABLE:
        return None
    try:
        return win32gui.GetForegroundWindow()
    except Exception:
        return None


def _restore_window(hwnd: int | None) -> None:
    """Restore focus to given window handle."""
    if not WIN32_AVAILABLE or not hwnd:
        return
    try:
        if win32gui.IsIconic(hwnd):
            win32gui.ShowWindow(hwnd, win32con.SW_RESTORE)
        win32gui.SetForegroundWindow(hwnd)
    except Exception:
        pass


def _process_text(text: str) -> None:
    global _last_window_handle

    print(f"\n✅ РАСПОЗНАНО: '{text}'")
    print("   [DEBUG] Возвращаю фокус в окно чата...")

    # Restore focus to the window that was active before recording
    _restore_window(_last_window_handle)
    time.sleep(0.2)

    try:
        pyperclip.copy(text)
        print("   [DEBUG] Текст скопирован.")
    except Exception as e:
        print(f"   [ERROR] Не удалось скопировать: {e}")
        print(f"   Текст: {text}")
        return

    time.sleep(0.15)

    print("   [DEBUG] Вставляю Ctrl+V...")
    try:
        keyboard.send('ctrl+v')
        print("✅ Текст вставлен! Нажми Enter чтобы отправить.")
        print("   Если текста нет — нажми Ctrl+V вручную.")
    except Exception as e:
        print(f"   [ERROR] Не удалось вставить: {e}")
        print("   Нажми Ctrl+V руками, текст уже в буфере.")


def _recognize_audio(audio_data: sr.AudioData) -> None:
    print("\n   [DEBUG] Распознаю через Google...")
    recognizer = sr.Recognizer()
    try:
        text = recognizer.recognize_google(audio_data, language="ru-RU")
        print(f"   [DEBUG] Google вернул: '{text}'")
        _process_text(text)
    except sr.UnknownValueError:
        print("\n❌ Речь не распознана.")
    except sr.RequestError as e:
        print(f"\n❌ Ошибка сети: {e}")


def _recording_thread() -> None:
    global _is_recording, _last_window_handle

    if not pyaudio:
        print("\n❌ PyAudio не установлен.")
        return

    # Save the active window BEFORE we press Ctrl+' (which might shift focus)
    # Actually, the user clicks into chat, then presses Ctrl+'.
    # The hotkey is already pressed, focus might have shifted.
    # Let's capture the window that was active just before we started recording.
    # But since this runs AFTER Ctrl+' is pressed, we need to capture it
    # when the user CLICKS into the chat field, not when pressing Ctrl+'.

    # Better approach: we'll try to get the window under cursor or
    # instruct the user to click AFTER starting... No.

    # Actually, the issue is: Ctrl+' is pressed while chat is focused,
    # but the hotkey processing happens in our script which might steal focus.
    # So we capture current active window at the START of recording.
    _last_window_handle = _get_active_window()
    if _last_window_handle:
        print(f"   [DEBUG] Запомнено окно: {win32gui.GetWindowText(_last_window_handle)}")

    pa = pyaudio.PyAudio()
    try:
        stream = pa.open(
            format=pyaudio.paInt16,
            channels=1,
            rate=16000,
            input=True,
            frames_per_buffer=1024
        )
    except Exception as e:
        print(f"\n❌ Не удалось открыть микрофон: {e}")
        return

    buffer = io.BytesIO()
    print("\n🎤 ЗАПИСЬ НАЧАЛАСЬ... говори")
    print("   Нажми Ctrl+' ещё раз чтобы остановить.")
    _beep(1200, 100)

    chunk_count = 0
    while True:
        with _recording_lock:
            if not _is_recording:
                break
        try:
            data = stream.read(1024, exception_on_overflow=False)
            buffer.write(data)
            chunk_count += 1
        except Exception as e:
            print(f"\n❌ Ошибка записи: {e}")
            break

    print(f"\n⏹ Запись остановлена. Чанков: {chunk_count}")
    _beep(400, 100)

    stream.stop_stream()
    stream.close()
    pa.terminate()

    raw_data = buffer.getvalue()
    print(f"   [DEBUG] Размер записи: {len(raw_data)} байт")

    if len(raw_data) > 0:
        audio = sr.AudioData(raw_data, 16000, 2)
        _recognize_audio(audio)
    else:
        print("\n⚠️ Аудио не записано.")

    print("\n⏳ Ожидание Ctrl+'...")


def _toggle_recording() -> None:
    global _is_recording

    with _recording_lock:
        if not _is_recording:
            _is_recording = True
            threading.Thread(target=_recording_thread, daemon=True).start()
        else:
            _is_recording = False
            print("\n   [DEBUG] Сигнал остановки...")


def main() -> None:
    if not keyboard:
        print("❌ Модуль 'keyboard' не установлен.")
        sys.exit(1)

    if not pyaudio:
        print("❌ PyAudio не установлен.")
        sys.exit(1)

    print("=" * 50)
    print("🎙 ГОЛОСОВОЙ ВВОД ДЛЯ CLAUDE")
    print("=" * 50)
    print()

    if not WIN32_AVAILABLE:
        print("⚠️  pywin32 не установлен — восстановление фокуса НЕ будет работать.")
        print("   py -3.12 -m pip install pywin32")
        print()

    if not is_admin():
        print("⚠️  Запущено БЕЗ прав администратора.")
        print("   Ctrl+' может НЕ работать в некоторых приложениях.")
        print("   Рекомендуется: запустить от имени администратора.")
        print()
    else:
        print("⚠️  Запущено ОТ ИМЕНИ АДМИНИСТРАТОРА.")
        print("   Восстановление фокуса в браузер может НЕ работать из-за защиты Windows.")
        print("   Если текст не вставляется — закрой скрипт и запусти БЕЗ администратора.")
        print()

    print("ИНСТРУКЦИЯ:")
    print("1. Кликни в поле ввода чата")
    print("2. Жми Ctrl+' → говори → Ctrl+' ещё раз")
    print("3. Если текст не вставился — нажми Ctrl+V вручную")
    print()
    print("❌ Для выхода: Ctrl+C")
    print("-" * 50)
    print()

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
        print("🔥 Горячая клавиша Ctrl+' активна.")
        print("⏳ Ожидание Ctrl+'...")
    except Exception as e:
        print(f"⚠️ Не удалось зарегистрировать горячую клавишу: {e}")
        sys.exit(1)

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        with _recording_lock:
            _is_recording = False
        print("\n👋 Пока!")
        sys.exit(0)


if __name__ == "__main__":
    main()
