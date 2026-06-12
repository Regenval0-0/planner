# 🏠 C:\Ren — Рабочее пространство

**Владелец:** Даша (Fullstack-студент, Junior+ road map 2026)  
**Ассистент:** Лорен (Claude Code)  
**Дата организации:** 2026-06-08

---

## 📁 Структура

```
C:\Ren\
├── 📁 projects/          ← Активные проекты (backend, frontend, database, DNH, Olimpium)
├── 📁 docs/              ← Обучающие материалы и roadmaps
├── 📁 tools/             ← Утилиты и генераторы
├── 📁 archive/           ← Архивы, анализы видео, vibe-tools
├── 📁 assets/            ← Скриншоты, визитки, изображения
├── 📁 workspace/         ← Рабочие файлы (Атлас, Справочники, сервисы)
├── 📁 setup/             ← Скрипты настройки и установки
├── 📁 _trash/            ← 🗑 Удалённые старые проекты (planner-app, voice-assistant и др.)
│
├── CLAUDE.md             ← Инструкции для Claude Code
├── README.md             ← Этот файл
└── .git                  ← Git-репозиторий всего workspace
```

---

## 🚀 Активные проекты

| Проект | Стек | Статус | Путь |
|--------|------|--------|------|
| **Planner** | React 19 + Vite + Tailwind, Express + Prisma, PostgreSQL | 🔥 В разработке | `projects/planner/` |
| **BPOO Site** | React + Vite (redesign сайта колледжа) | 🔥 В разработке | `projects/bpoo-site/` |
| **Do No Harm** | React + Electron (калькулятор + руководство) | 🎮 Активный | `projects/dnh/` |
| **Olimpium** | Python + Playwright (автоматизация курса) | 🤖 Автоматизирован | `projects/olimpium/` |

---

## 📚 Документы

- `CLAUDE.md` — правила работы с Claude Code (tech stack, guidelines)
- `AGENTS.md` — описание ролей агентов (если используется multi-agent)
- `.cursorrules` — правила для Cursor IDE

---

## 🗑 Что удалено

В `_trash/` перемещены устаревшие проекты:
- `planner-app/` — старый Electron desktop (заменён на fullstack planner)
- `voice-assistant/` — пустой Vite-шаблон
- `olimpium_solutions/` — дубль старых решений
- `package.json` — остаток от старого planner-app
- `EOF`, `nul`, `site-monitor.log` — мусорные файлы

---

## 🛠 Быстрые команды

```bash
# Planner frontend
cd projects/frontend/planner && npm run dev

# Planner backend
cd projects/backend/planner && npm run dev

# BPOO site
cd projects/frontend/bpoo-site && npm run dev

# DNH Project
cd projects/dnh/dnh-project && npm run dev

# Olimpium scraper
cd projects/olimpium && python scripts/full_course_scraper.py
```

---

## 📝 Память проекта

См. `C:\Users\dasha\.claude\projects\C--Ren\memory\` — постоянная память о проектах, навыках, roadmaps.
