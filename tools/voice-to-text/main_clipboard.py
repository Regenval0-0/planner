import speech_recognition as sr
import pyperclip
import sys
import threading
import time

try:
    import keyboard
except ImportError:
    keyboard = None


def record_and_recognize(duration: int = 5) -> str | None:
    """Записывает аудио с микрофона и распознаёт речь через Google Speech API."""
    recognizer = sr.Recognizer()

    try:
        with sr.Microphone() as source:
            print("\n🎤 Слушаю... говори сейчас")
            recognizer.adjust_for_ambient_noise(source, duration=0.5)
            audio = recognizer.listen(source, timeout=10, phrase_time_limit=duration)
            print("⏳ Распознаю...")
    except sr.WaitTimeoutError:
        print("❌ Таймаут: микрофон не слышит звук.")
        return None
    except Exception as e:
        print(f"❌ Ошибка микрофона: {e}")
        return None

    try:
        text = recognizer.recognize_google(audio, language="ru-RU")
        return text
    except sr.UnknownValueError:
        print("❌ Речь не распознана. Попробуй говорить громче и чётче.")
        return None
    except sr.RequestError as e:
        print(f"❌ Ошибка сети (Google Speech API): {e}")
        return None


def _process_voice_input() -> None:
    """Обработчик: записывает, распознаёт, копирует в буфер."""
    text = record_and_recognize()
    if text:
        print(f"✅ Распознано: {text}")
        try:
            pyperclip.copy(text)
            print("📋 Текст скопирован в буфер обмена! Вставь в чат (Ctrl+V).")
        except Exception as e:
            print(f"⚠️ Не удалось скопировать в буфер обмена: {e}")
            print(f"   Скопируй вручную: {text}")
    print("⏳ Ожидание Ctrl+'...")


def _on_hotkey() -> None:
    """Запускает запись в отдельном потоке, чтобы не блокировать слушатель."""
    threading.Thread(target=_process_voice_input, daemon=True).start()


def main() -> None:
    if not keyboard:
        print("❌ Модуль 'keyboard' не установлен.")
        print("   Установи: pip install keyboard")
        print("   И запусти скрипт от имени администратора.")
        sys.exit(1)

    print("=" * 50)
    print("🎙 ГОЛОСОВОЙ ВВОД (Только буфер обмена)")
    print("=" * 50)
    print()
    print("✅ Нажми Ctrl+' в любом месте — начнётся запись.")
    print("   Текст скопируется в буфер. Вставь самостоятельно Ctrl+V.")
    print()
    print("❌ Для выхода нажми Ctrl+C в этом окне")
    print("-" * 50)
    print()

    _last_hotkey_time = 0

    def _on_apostrophe_press(event):
        nonlocal _last_hotkey_time
        if keyboard.is_pressed('ctrl'):
            now = time.time()
            if now - _last_hotkey_time < 0.5:
                return False
            _last_hotkey_time = now
            _on_hotkey()
            return False
        return True

    try:
        keyboard.on_press_key(40, _on_apostrophe_press)
        print("🔥 Горячая клавиша Ctrl+' активна.")
        print("⏳ Ожидание Ctrl+'...")
    except Exception as e:
        print(f"⚠️ Не удалось зарегистрировать горячую клавишу: {e}")
        print("   Запусти скрипт от имени администратора.")
        sys.exit(1)

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n👋 Пока!")
        sys.exit(0)


if __name__ == "__main__":
    main()
