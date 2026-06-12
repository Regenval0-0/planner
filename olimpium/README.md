# 📁 olimpium/

**Назначение:** Автоматизация курса «Python от А до Я» на [Olimpium](https://olimpium.ru/).

---

## Описание

Python-скрипты для автоматического прохождения курса на платформе Olimpium.

### Стек
- Python 3.12
- Playwright (автоматизация браузера)
- asyncio

### Структура
```
olimpium/
├── solutions/              # 103 готовых решения (task_1.py ... task_103.py)
├── scripts/
│   ├── full_course_scraper.py   # Сбор заданий со всех этапов
│   └── auto_uploader.py         # Автозагрузка решений
└── README.md
```

### Использование
```bash
# Сбор заданий
python scripts/full_course_scraper.py

# Загрузка решений
python scripts/auto_uploader.py
```

### Данные
- **Курс:** Python от А до Я (ID: 671)
- **Стартовый URL:** https://olimpium.ru/courses/671/stage/23539
