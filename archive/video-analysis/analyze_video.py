#!/usr/bin/env python3
"""
Анализатор видео: транскрибация + извлечение кадров.
Запуск: python analyze_video.py <путь_к_видео> [--model base|small|medium]
"""
import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

FFMPEG = r"C:\Users\dasha\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffmpeg.exe"
FFPROBE = r"C:\Users\dasha\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffprobe.exe"

def run(cmd, capture=True):
    """Запускает команду и возвращает stdout."""
    result = subprocess.run(cmd, shell=True, capture_output=capture, text=True, encoding='utf-8')
    if capture:
        return result.stdout.strip(), result.stderr.strip(), result.returncode
    return None, None, result.returncode

def extract_audio(video_path, audio_path):
    """Извлекает аудио в WAV (16kHz mono) для Whisper."""
    cmd = f'"{FFMPEG}" -y -i "{video_path}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "{audio_path}"'
    _, err, rc = run(cmd)
    if rc != 0:
        print(f"[ERROR] Audio extraction failed: {err}")
        return False
    print(f"[OK] Audio extracted: {audio_path}")
    return True

def extract_frames(video_path, output_dir, count=5):
    """Извлекает N равномерно распределённых кадров."""
    # Получаем длительность
    cmd = f'"{FFPROBE}" -v error -show_entries format=duration -of csv=p=0 "{video_path}"'
    out, _, _ = run(cmd)
    duration = float(out) if out else 0

    frames_dir = Path(output_dir) / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)

    frame_files = []
    for i in range(1, count + 1):
        t = (duration * i) / (count + 1)
        frame_path = frames_dir / f"frame_{i:02d}_at_{t:.1f}s.jpg"
        cmd = f'"{FFMPEG}" -y -ss {t:.3f} -i "{video_path}" -vframes 1 -q:v 2 "{frame_path}"'
        _, err, rc = run(cmd)
        if rc == 0:
            frame_files.append(str(frame_path))
            print(f"[OK] Frame {i}/{count} at {t:.1f}s")
        else:
            print(f"[WARN] Failed frame {i}: {err}")

    return frame_files

def transcribe(audio_path, model_size="base", device="cpu", compute_type="int8"):
    """Транскрибирует аудио через faster-whisper."""
    from faster_whisper import WhisperModel

    print(f"[INFO] Loading model {model_size} on {device} ({compute_type})...")
    model = WhisperModel(model_size, device=device, compute_type=compute_type)

    print(f"[INFO] Transcribing {audio_path}...")
    segments, info = model.transcribe(audio_path, beam_size=5, word_timestamps=False, vad_filter=True)

    transcript = []
    text_full = []
    for segment in segments:
        transcript.append({
            "start": round(segment.start, 2),
            "end": round(segment.end, 2),
            "text": segment.text.strip()
        })
        text_full.append(segment.text.strip())

    return {
        "language": info.language,
        "language_probability": round(info.language_probability, 4),
        "segments": transcript,
        "full_text": " ".join(text_full)
    }

def get_metadata(video_path):
    """Получает метаданные видео через ffprobe."""
    cmd = f'"{FFPROBE}" -v error -show_entries format=duration,bit_rate -show_entries stream=codec_name,width,height,r_frame_rate -of json "{video_path}"'
    out, _, _ = run(cmd)
    return json.loads(out)

def main():
    parser = argparse.ArgumentParser(description="Анализ видео: транскрибация + кадры")
    parser.add_argument("video", help="Путь к видеофайлу")
    parser.add_argument("--model", default="base", choices=["tiny", "base", "small", "medium"],
                        help="Размер модели Whisper (default: base)")
    parser.add_argument("--device", default="cpu", choices=["cpu", "cuda"],
                        help="Устройство (default: cpu)")
    parser.add_argument("--frames", type=int, default=5, help="Количество кадров (default: 5)")
    parser.add_argument("--out", default="./video-analysis", help="Папка для результатов")
    args = parser.parse_args()

    video_path = Path(args.video).resolve()
    if not video_path.exists():
        print(f"[ERROR] File not found: {video_path}")
        sys.exit(1)

    # Создаём output-папку
    out_dir = Path(args.out) / video_path.stem
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n{'='*60}")
    print(f"Анализ видео: {video_path.name}")
    print(f"{'='*60}\n")

    # Метаданные
    print("[1/4] Извлечение метаданных...")
    metadata = get_metadata(str(video_path))
    meta_path = out_dir / "metadata.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    print(f"[OK] Metadata saved: {meta_path}")

    # Кадры
    print(f"\n[2/4] Извлечение {args.frames} ключевых кадров...")
    frame_files = extract_frames(str(video_path), str(out_dir), args.frames)

    # Аудио
    print("\n[3/4] Извлечение аудио...")
    audio_path = out_dir / "audio.wav"
    audio_ok = extract_audio(str(video_path), str(audio_path))

    # Транскрибация
    transcript_data = None
    if audio_ok:
        print("\n[4/4] Транскрибация аудио...")
        try:
            transcript_data = transcribe(str(audio_path), model_size=args.model, device=args.device)
            tx_path = out_dir / "transcript.json"
            with open(tx_path, "w", encoding="utf-8") as f:
                json.dump(transcript_data, f, ensure_ascii=False, indent=2)
            print(f"[OK] Transcript saved: {tx_path}")

            # Также сохраним plain text
            txt_path = out_dir / "transcript.txt"
            with open(txt_path, "w", encoding="utf-8") as f:
                f.write(transcript_data["full_text"])
            print(f"[OK] Plain text saved: {txt_path}")
        except Exception as e:
            print(f"[ERROR] Transcription failed: {e}")
    else:
        print("[WARN] Skipping transcription (no audio)")

    # Итоговый summary
    summary = {
        "video": video_path.name,
        "output_dir": str(out_dir),
        "metadata": metadata,
        "frames": frame_files,
        "transcript": transcript_data is not None,
        "model": args.model,
    }
    summary_path = out_dir / "summary.json"
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*60}")
    print(f"ГОТОВО! Результаты в: {out_dir}")
    print(f"{'='*60}")
    print(f"  metadata.json    — технические данные видео")
    print(f"  transcript.txt   — полный текст транскрипции")
    print(f"  transcript.json  — транскрипция с таймкодами")
    print(f"  frames/          — {len(frame_files)} ключевых кадров")
    print(f"  summary.json     — сводка")

if __name__ == "__main__":
    main()
