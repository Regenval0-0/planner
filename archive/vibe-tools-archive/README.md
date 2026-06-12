# Полный архив Vibe-Tools

**Дата сборки:** 2026-06-08  
**Источник:** 3 видео из VK Video про vibe-coding с Claude Code  
**Локация:** `C:\Ren\vibe-tools-archive\

---

## 📦 Содержимое архива

```
vibe-tools-archive/
├── claude-skills.tar.gz          # Все скиллы (без .git и node_modules)
│   ├── skills/
│   │   ├── frontend-design/      # Официальный Anthropic skill
│   │   ├── ui-ux-pro-max/        # 67 стилей, 161 палитра, 57 шрифтов
│   │   └── minimal-design/       # Чёрно-белый минимализм
│   └── mcp.json                  # Конфигурация MCP серверов
│
├── skills/                        # Распакованные скиллы (только SKILL.md + refs)
│   ├── frontend-design/SKILL.md
│   ├── ui-ux-pro-max/SKILL.md
│   └── minimal-design/SKILL.md
│
├── mcp.json                       # MCP конфиг (Agent Browser + UI-UX Pro Max)
│
├── install-all-vibe-tools.bat    # Однокомандная установка ВСЕГО
│
└── video-analysis-results/        # Полный анализ 3 видео
    ├── ANALYSIS_SUMMARY.md        # Итоговый отчёт
    ├── VID_20260608_102133_359/   # Видео 1: Ancient Browser
    │   ├── metadata.json
    │   ├── transcript.json        # Таймкоды
    │   ├── transcript.txt         # Полный текст
    │   ├── audio.wav              # Извлечённое аудио
    │   └── frames/                # 5 ключевых кадров
    ├── VID_20260608_102136_664/   # Видео 2: Framer Motion + UI-UX
    │   └── (та же структура)
    └── VID_20260608_102146_420/   # Видео 3: 3 скилла
        └── (та же структура)
```

---

## 🚀 Быстрый старт

### 1. Установить всё одной командой
```cmd
install-all-vibe-tools.bat
```

### 2. Или вручную:
```bash
# Framer Motion (в проект)
cd frontend/planner && npm install motion

# Agent Browser (глобально)
npm install -g agent-browser agent-browser-mcp

# UI-UX Pro Max MCP
npm install -g @nextlevelbuilder/ui-ux-pro-max-mcp

# Python tools
pip install -U faster-whisper yt-dlp opencv-python pillow

# Скиллы (в ~/.claude/skills/)
git clone --depth 1 https://github.com/anthropics/skills.git
cp -r skills/skills/frontend-design ~/.claude/skills/

git clone --depth 1 https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git ~/.claude/skills/ui-ux-pro-max
cp ~/.claude/skills/ui-ux-pro-max/.claude/skills/ui-ux-pro-max/SKILL.md ~/.claude/skills/ui-ux-pro-max/

git clone --depth 1 https://github.com/holger1411/minimal-design-system-skill.git ~/.claude/skills/minimal-design
```

---

## 📹 Видео-анализ (кратко)

### Видео 1 — Ancient Browser (63с)
- **Инструмент:** Agent Browser от Vercel
- **Суть:** Браузерная сессия для Claude Code без сжигания токенов
- **Принцип:** Accessibility tree с `@e1`, `@e2` вместо скриншотов
- **Выигрыш:** 15× меньше токенов

### Видео 2 — Сайт за 15 мин / $20 (48с)
- **Шаг 1:** Claude Code (установка)
- **Шаг 2:** Framer Motion (spring-анимации)
- **Шаг 3:** UI-UX Pro Max skill (типографика, отступы)
- **Шаг 4:** twentyfour.dev (готовые компоненты)

### Видео 3 — 3 скилла (50с)
- **Скилл 1:** Minimal Design Skill (оживляет статичный UI)
- **Скилл 2:** Impact Design (20 команд, типографика, контрасты)
- **Скилл 3:** Text Skill (реальные дизайн-референции)

---

## 🛠 MCP серверы

| MCP сервер | Команда | Назначение |
|-----------|---------|-----------|
| Agent Browser | `npx agent-browser-mcp` | Браузерная автоматизация |
| UI-UX Pro Max | `npx @nextlevelbuilder/ui-ux-pro-max-mcp` | Дизайн-интеллект |

Конфигурация: `~/.claude/mcp.json`

---

## 📁 twentyfour.dev

**URL:** https://twentyfour.dev  
**Тип:** Веб-сайт с copy-paste компонентами (shadcn/ui)  
**Использование:**
1. Открыть сайт
2. Найти компонент
3. Скопировать команду
4. Вставить в Claude Code

Пример команды: `npx shadcn add button`

---

## 🔗 Источники

| Ресурс | Ссылка |
|--------|--------|
| Agent Browser | https://github.com/vercel-labs/agent-browser |
| Agent Browser MCP | https://github.com/codeChap/mcp-server-agent-browser |
| UI-UX Pro Max | https://github.com/nextlevelbuilder/ui-ux-pro-max-skill |
| UI-UX Pro Max MCP | https://github.com/dz114879/uiux-pro-max-mcp |
| Minimal Design | https://github.com/holger1411/minimal-design-system-skill |
| Frontend Design (Anthropic) | https://github.com/anthropics/claude-code/tree/main/plugins/frontend-design |
| Framer Motion | https://motion.dev/docs/react |
| twentyfour.dev | https://twentyfour.dev |
| faster-whisper | https://github.com/SYSTRAN/faster-whisper |
| yt-dlp | https://github.com/yt-dlp/yt-dlp |
