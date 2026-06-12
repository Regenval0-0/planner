# Skill: Figma Plugin API — Создание дизайнов программно

## When to Use
Генерация UI-элементов, создание дизайн-систем, автоматическое построение макетов прямо внутри Figma через плагин.

## Важно: REST API только читает
Figma REST API **не умеет создавать** файлы, фреймы, фигуры или текст. Для создания дизайнов используется **Figma Plugin API** — он работает внутри Figma Desktop/Web и имеет полный read/write доступ к документу.

## Создание плагина

### 1. Базовая структура
```
my-figma-plugin/
  manifest.json          # Описание плагина
  code.ts               # Логика (Node.js/TS)
  ui.html               # UI плагина (опционально)
```

### 2. manifest.json
```json
{
  "name": "AI Design Generator",
  "id": "12345678",
  "api": "1.0.0",
  "editorType": ["figma", "figjam"],
  "main": "code.js"
}
```

### 3. Создание нод (основные методы)

```ts
// Фрейм
const frame = figma.createFrame();
frame.name = "Card";
frame.resize(400, 300);
frame.x = 100;
frame.y = 100;
frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
frame.cornerRadius = 12;

// Прямоугольник
const rect = figma.createRectangle();
rect.resize(400, 200);
rect.fills = [{ type: 'SOLID', color: { r: 0.23, g: 0.51, b: 0.96 } }];
rect.cornerRadius = 8;

// Текст (ОБЯЗАТЕЛЬНО загрузить шрифт сначала)
await figma.loadFontAsync({ family: "Inter", style: "Regular" });
const text = figma.createText();
text.characters = "Hello Figma!";
text.fontSize = 24;
text.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];

// Круг
const ellipse = figma.createEllipse();
ellipse.resize(80, 80);
ellipse.fills = [{ type: 'SOLID', color: { r: 1, g: 0.41, b: 0.38 } }];

// Линия
const line = figma.createLine();
line.resize(200, 0);
line.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.85, b: 0.85 } }];
line.strokeWeight = 1;

// Вектор
const vector = figma.createVector();
vector.vectorPaths = [{
  windingRule: "EVENODD",
  data: "M 0 0 L 100 0 L 50 100 Z"
}];
```

## Auto Layout (Flexbox в Figma)

```ts
// Создать Auto Layout frame
const autoFrame = figma.createAutoLayout("VERTICAL");
autoFrame.name = "Card Content";
autoFrame.itemSpacing = 12;
autoFrame.paddingTop = 16;
autoFrame.paddingBottom = 16;
autoFrame.paddingLeft = 16;
autoFrame.paddingRight = 16;
autoFrame.primaryAxisAlignItems = "MIN";       // top/center/bottom
autoFrame.counterAxisAlignItems = "CENTER";     // left/center/right
autoFrame.layoutSizingHorizontal = "HUG";       // hug/fixed
autoFrame.layoutSizingVertical = "HUG";
autoFrame.cornerRadius = 12;
autoFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];

// Добавить дочерние элементы
autoFrame.appendChild(titleText);
autoFrame.appendChild(descriptionText);
autoFrame.appendChild(buttonFrame);
```

## Компоненты и варианты

```ts
// Создать компонент
const component = figma.createComponent();
component.name = "Button/Primary";
component.resize(120, 44);
component.fills = [{ type: 'SOLID', color: { r: 0.23, g: 0.51, b: 0.96 } }];
component.cornerRadius = 8;

// Создать варианты
const variant1 = component.clone();
variant1.name = "Button/Primary/Default";
const variant2 = component.clone();
variant2.name = "Button/Primary/Hover";
variant2.fills = [{ type: 'SOLID', color: { r: 0.18, g: 0.40, b: 0.76 } }];

// Создать Component Set (объединить варианты)
const componentSet = figma.combineAsVariants([variant1, variant2], figma.currentPage);
componentSet.name = "Button";
componentSet.x = 0;
componentSet.y = 0;
```

## Стили (Colors, Text, Effects)

```ts
// Создать цветовой стиль
const paintStyle = figma.createPaintStyle();
paintStyle.name = "Colors/Primary/500";
paintStyle.paints = [{ type: 'SOLID', color: { r: 0.23, g: 0.51, b: 0.96 } }];

// Применить стиль
rect.fillStyleId = paintStyle.id;

// Создать текстовый стиль
const textStyle = figma.createTextStyle();
textStyle.name = "Typography/Heading/1";
textStyle.fontSize = 32;
textStyle.fontName = { family: "Inter", style: "Bold" };
textStyle.lineHeight = { unit: "PIXELS", value: 40 };

// Применить текстовый стиль
text.textStyleId = textStyle.id;
```

## Переменные (Design Tokens)

```ts
// Создать коллекцию переменных
const collection = figma.variables.createVariableCollection("Design Tokens");

// Создать переменную цвета
const primaryColor = figma.variables.createVariable(
  "primary-500",
  collection.id,
  "COLOR"
);
primaryColor.setValueForMode(collection.modes[0].modeId, { r: 0.23, g: 0.51, b: 0.96 });

// Применить переменную
rect.setBoundVariable("fills", primaryColor.id);
```

## Полный пример: генерация карточки задачи

```ts
async function createTaskCard(title: string, description: string, priority: string) {
  // Шрифты
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "SemiBold" });

  // Цвета приоритета
  const priorityColors: Record<string, { r: number; g: number; b: number }> = {
    high: { r: 0.93, g: 0.27, b: 0.27 },
    medium: { r: 0.95, g: 0.61, b: 0.07 },
    low: { r: 0.13, g: 0.59, b: 0.34 },
  };

  // Основной фрейм (карточка)
  const card = figma.createAutoLayout("VERTICAL");
  card.name = "Task Card";
  card.resize(320, 180);
  card.itemSpacing = 8;
  card.paddingTop = 16;
  card.paddingBottom = 16;
  card.paddingLeft = 16;
  card.paddingRight = 16;
  card.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  card.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
  card.strokeWeight = 1;
  card.cornerRadius = 12;
  card.effects = [{
    type: "DROP_SHADOW",
    color: { r: 0, g: 0, b: 0, a: 0.08 },
    offset: { x: 0, y: 2 },
    radius: 8,
    spread: 0,
    visible: true,
    blendMode: "NORMAL",
  }];

  // Заголовок
  const titleNode = figma.createText();
  titleNode.characters = title;
  titleNode.fontSize = 18;
  titleNode.fontName = { family: "Inter", style: "SemiBold" };
  titleNode.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.1 } }];
  titleNode.layoutSizingHorizontal = "FILL";

  // Описание
  const descNode = figma.createText();
  descNode.characters = description;
  descNode.fontSize = 14;
  descNode.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }];
  descNode.layoutSizingHorizontal = "FILL";

  // Бейдж приоритета
  const badge = figma.createAutoLayout("HORIZONTAL");
  badge.name = "Priority Badge";
  badge.paddingTop = 4;
  badge.paddingBottom = 4;
  badge.paddingLeft = 8;
  badge.paddingRight = 8;
  badge.fills = [{ type: 'SOLID', color: priorityColors[priority] || priorityColors.medium }];
  badge.cornerRadius = 4;

  const badgeText = figma.createText();
  badgeText.characters = priority.toUpperCase();
  badgeText.fontSize = 12;
  badgeText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  badge.appendChild(badgeText);

  // Собрать карточку
  card.appendChild(titleNode);
  card.appendChild(descNode);
  card.appendChild(badge);

  figma.currentPage.appendChild(card);
  figma.viewport.scrollAndZoomIntoView([card]);

  return card;
}

// Запуск
figma.showUI(__html__, { width: 300, height: 200 });
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'create-card') {
    await createTaskCard(msg.title, msg.description, msg.priority);
  }
};
```

## Работа с изображениями

```ts
// Загрузить изображение
const image = await figma.createImageAsync(imageData);

// Применить к прямоугольнику
const imageRect = figma.createRectangle();
imageRect.resize(400, 300);
imageRect.fills = [{
  type: 'IMAGE',
  imageHash: image.hash,
  scaleMode: 'FILL'
}];
```

## Удаление и очистка

```ts
// Удалить ноду
node.remove();

// Найти и удалить все элементы по имени
const toDelete = figma.currentPage.findAll(n => n.name === "Old Component");
toDelete.forEach(n => n.remove());

// Очистить страницу
figma.currentPage.children.forEach(child => child.remove());
```

## Запуск плагина в Figma
1. **Figma Desktop** → Plugins → Development → Import plugin from manifest.
2. Выбрать `manifest.json`.
3. Plugins → Development → Название плагина.
4. При необходимости открыть UI (`figma.showUI`).

## Сборка TypeScript → JS
```bash
npm init -y
npm install -D @figma/plugin-typings typescript
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["ES2017"],
    "module": "CommonJS",
    "outDir": "./",
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["code.ts"]
}
```

```bash
npx tsc
```

## Checklist
- [ ] Шрифты загружены перед созданием/редактированием текста.
- [ ] Массивы `fills`, `strokes` перезаписываются целиком (read-only модификация).
- [ ] Цвета в Figma — 0-1, не 0-255 (r: 0.23, не r: 59).
- [ ] Auto Layout корректно настроен (HUG vs FIXED).
- [ ] Компоненты объединены в Component Set для вариантов.
- [ ] Переменные созданы в коллекции с хотя бы одним режимом.
- [ ] Плагин тестируется в Figma Desktop с открытой консолью (Plugins → Development → Open console).
