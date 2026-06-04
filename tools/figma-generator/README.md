# Figma Generator (.fig)

Генерация файлов Figma (`.fig`) программно через Node.js + TypeScript.

## Технологии

- **[openfig-core](https://github.com/OpenFig-org/openfig-core)** — парсинг и кодирование бинарного формата `.fig`
- **[@mongodb-js/zstd](https://github.com/mongodb-js/zstd)** — сжатие zstd (требуется для записи)

## Структура проекта

```
figma-generator/
├── src/
│   ├── generate.ts   # Генерация .fig файла
│   ├── verify.ts     # Проверка/чтение созданного файла
│   └── inspect.ts    # Отладочный вывод пустого документа
├── output.fig        # Результат (появляется после генерации)
├── package.json
└── tsconfig.json
```

## Запуск

```bash
# Генерация файла
npm run generate

# Проверка (парсинг обратно)
npm run verify
```

## Что умеет

- Создавать `.fig` файлы с нуля
- Добавлять фигуры: `RECTANGLE`, `ELLIPSE`, `TEXT`, `FRAME`
- Задавать цвета, обводку, скругление, шрифты
- Вкладывать элементы во фреймы (иерархия)

## Пример макета

Скрипт `generate.ts` создаёт:
- 🔴 Красный прямоугольник со скруглением
- 🔵 Синий круг
- ✏️ Текст "Привет из Node.js!"
- 📦 Фрейм с зелёным квадратом внутри

## Источники

- [openfig-core на GitHub](https://github.com/OpenFig-org/openfig-core)
- [openfig-cli на GitHub](https://github.com/OpenFig-org/openfig-cli)
