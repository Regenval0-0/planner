# Olimpium Automation

Автоматизация для курса «Python от А до Я: для новичков» на [Olimpium](https://olimpium.ru/).

## Учётные данные
- **Email:** `dasha10.vaiman@gmail.com`
- **Курс:** Python от А до Я (ID: 671)
- **Стартовый URL:** `https://olimpium.ru/courses/671/stage/23539`

## Структура

```
olimpium/
├── solutions/              # 103 готовых решения (task_1.py ... task_103.py)
├── scripts/
│   ├── full_course_scraper.py   # Сбор заданий со всех этапов
│   └── auto_uploader.py         # Автозагрузка решений на сайт
└── README.md               # Этот файл
```

## Использование

### Сбор заданий
```bash
python scripts/full_course_scraper.py
```

### Загрузка решений
```bash
python scripts/auto_uploader.py
```

## Метод входа (Playwright)

```python
await page.goto("https://olimpium.ru/login")
await page.fill("input[type='text'], input[type='email']", EMAIL)
await page.fill("input[type='password']", PASSWORD)
await page.keyboard.press("Enter")
await asyncio.sleep(5)
await page.goto("https://olimpium.ru/courses/671/stage/23539")
```

### Особенности сайта
- Динамический контент (Vue.js), ждать `.trainerNavigationItemComponent`
- Кнопка «Следующий этап» — `button.button._next` (клик, не href)
- Поле загрузки файла (`input[type="file"]`) появляется после клика на задание
- Лекции без заданий — на странице нет `.trainerNavigationItemComponent`

## Статус
| Этап | Задания |
|------|---------|
| Модуль 4 (sys.argv) | 1–30 |
| Модуль 5 (Tkinter база) | 31–50 |
| Модуль 6 (Tkinter продвинутый) | 51–60 |
| Модуль 7 (os, re, файлы) | 61–90 |
| Итоговый модуль | 91–103 |
