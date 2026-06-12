# 📁 archive/

**Назначение:** Архивы, анализы, резервные копии инструментов.

---

## Содержимое

| Папка/Файл | Описание |
|-----------|----------|
| `vibe-tools-archive/` | Полный архив vibe-coding инструментов (скиллы, MCP, видео-анализ) |
| `vibe-tools-archive.tar.gz` | Сжатый архив (12 МБ) |
| `video-analysis/` | Результаты анализа видео из VK (транскрипции, кадры, аудио) |

---

## vibe-tools-archive

Содержит:
- `claude-skills.tar.gz` — скиллы Claude Code (frontend-design, ui-ux-pro-max, minimal-design)
- `mcp.json` — конфигурация MCP серверов
- `install-all-vibe-tools.bat` — скрипт установки всех инструментов
- `video-analysis-results/` — полный анализ 3 видео

---

## video-analysis

Результаты работы `faster-whisper` + `ffmpeg`:
- Транскрипции с таймкодами
- Ключевые кадры
- Извлечённое аудио
