# Skill: Figma → React Code Generation

## When to Use
Конвертация дизайнов из Figma в production-ready React-компоненты с Tailwind CSS.

## Инструменты

### VibeFigma (Open-source, рекомендуется)
```bash
npm install -g vibefigma
```

```bash
# Базовая конвертация
npx vibefigma "https://www.figma.com/design/ABC123/My-Design" \
  --token YOUR_FIGMA_TOKEN \
  --output ./src/components

# С опциями
npx vibefigma "https://www.figma.com/design/ABC123" \
  --token YOUR_FIGMA_TOKEN \
  --output ./src/components \
  --framework react \
  --styling tailwind \
  --clean \
  --responsive
```

**Флаги:**
| Флаг | Описание |
|------|----------|
| `--clean` | AI-очистка сгенерированного кода |
| `--responsive` | Добавление responsive breakpoints |
| `--no-tailwind` | Использование vanilla CSS |
| `--interactive` | Интерактивный режим выбора нод |

### Anima SDK
```bash
npm install @animaapp/anima-sdk
```

```ts
import { AnimaSDK } from '@animaapp/anima-sdk';

const sdk = new AnimaSDK({ apiKey: process.env.ANIMA_API_KEY });

const result = await sdk.convertFigmaToCode({
  figmaFileUrl: 'https://www.figma.com/design/ABC123',
  framework: 'react',
  styling: 'tailwind',
  outputPath: './src/components',
});
```

### Figma REST API (Ручная конвертация)
Если нужен полный контроль:

```ts
import axios from 'axios';

const FIGMA_TOKEN = process.env.FIGMA_API_TOKEN;

async function getFigmaFile(fileKey: string) {
  const response = await axios.get(`https://api.figma.com/v1/files/${fileKey}`, {
    headers: { 'X-Figma-Token': FIGMA_TOKEN },
  });
  return response.data;
}

async function getImage(fileKey: string, nodeIds: string[]) {
  const response = await axios.get(
    `https://api.figma.com/v1/images/${fileKey}?ids=${nodeIds.join(',')}&format=svg`,
    { headers: { 'X-Figma-Token': FIGMA_TOKEN } }
  );
  return response.data;
}
```

## Структура Figma → React

### Mapping
| Figma | React |
|-------|-------|
| Frame (Auto Layout) | `div` с `display: flex` |
| Frame (no Auto Layout) | `div` с `position: relative/absolute` |
| Text | `p`, `span`, `h1-h6` |
| Rectangle/Ellipse | `div` с `border-radius` |
| Image Fill | `img` или `div` с `background-image` |
| Component Instance | React-компонент |
| Component Set (Variants) | Props с условными стилями |

### Пример конвертации

**Figma:**
- Frame: 400×300, white bg, rounded-12, shadow-sm
- Text: "Card Title", 18px, SemiBold
- Text: "Description", 14px, gray
- Button: 120×44, blue bg, white text, rounded-8

**React + Tailwind:**
```tsx
interface CardProps {
  title: string;
  description: string;
  buttonText: string;
}

export function Card({ title, description, buttonText }: CardProps) {
  return (
    <div className="w-[400px] rounded-xl bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
      <button className="mt-4 h-11 rounded-lg bg-blue-600 px-5 text-sm font-medium text-white hover:bg-blue-700">
        {buttonText}
      </button>
    </div>
  );
}
```

## Извлечение ассетов

### Иконки → SVG
```ts
const icons = await getImage(fileKey, iconNodeIds);
// Скачиваем SVG, сохраняем в src/assets/icons/
// Или используем как React-компоненты через SVGR
```

### Изображения → WebP
```ts
const images = await getImage(fileKey, imageNodeIds, { format: 'webp', scale: 2 });
// Сохраняем в public/images/
```

## Типографика

### Маппинг размеров
| Figma | Tailwind |
|-------|----------|
| 12px | `text-xs` |
| 14px | `text-sm` |
| 16px | `text-base` |
| 18px | `text-lg` |
| 20px | `text-xl` |
| 24px | `text-2xl` |
| 30px | `text-3xl` |
| 36px | `text-4xl` |

### Маппинг весов
| Figma | Tailwind |
|-------|----------|
| Regular (400) | `font-normal` |
| Medium (500) | `font-medium` |
| SemiBold (600) | `font-semibold` |
| Bold (700) | `font-bold` |

## Спейсинг

### Маппинг отступов
| Figma | Tailwind |
|-------|----------|
| 4px | `p-1`, `m-1`, `gap-1` |
| 8px | `p-2`, `m-2`, `gap-2` |
| 12px | `p-3`, `m-3`, `gap-3` |
| 16px | `p-4`, `m-4`, `gap-4` |
| 24px | `p-6`, `m-6`, `gap-6` |
| 32px | `p-8`, `m-8`, `gap-8` |

## Цвета

### Маппинг Figma → Tailwind
| Figma Hex | Tailwind |
|-----------|----------|
| #F8FAFC | `slate-50` |
| #E2E8F0 | `slate-200` |
| #94A3B8 | `slate-400` |
| #64748B | `slate-500` |
| #0F172A | `slate-900` |
| #3B82F6 | `blue-500` |
| #2563EB | `blue-600` |
| #10B981 | `emerald-500` |
| #EF4444 | `red-500` |

Если брендовые цвета не совпадают с Tailwind — добавить в `tailwind.config.js`.

## Компоненты и варианты

### Component Set → Props
**Figma:**
```
Button (Component Set)
├── Button/Primary/Default
├── Button/Primary/Hover
├── Button/Secondary/Default
└── Button/Secondary/Hover
```

**React:**
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', children }: ButtonProps) {
  const base = 'h-11 rounded-lg px-5 text-sm font-medium transition-colors';
  const styles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  };

  return <button className={`${base} ${styles[variant]}`}>{children}</button>;
}
```

## Post-processing

### После генерации
1. **Удалить dead code** — неиспользуемые переменные, комментарии.
2. **Заменить magic numbers** — вынести в константы.
3. **Добавить TypeScript** — типы для props, состояний.
4. **Добавить accessibility** — `aria-label`, `role`, semantic HTML.
5. **Оптимизировать импорты** — barrel exports, удалить дубликаты.

### Пример скрипта пост-обработки
```ts
// scripts/post-process-figma.ts
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

function processComponent(filePath: string) {
  let content = readFileSync(filePath, 'utf-8');

  // Заменить className concatenation на template literal
  content = content.replace(
    /className={\[`([^`]+)`\]}/g,
    'className={`$1`}'
  );

  // Добавить export default
  if (!content.includes('export default')) {
    const match = content.match(/export function (\w+)/);
    if (match) {
      content += `\nexport default ${match[1]};\n`;
    }
  }

  writeFileSync(filePath, content);
}

const componentsDir = './src/components';
readdirSync(componentsDir)
  .filter((f) => f.endsWith('.tsx'))
  .forEach((f) => processComponent(join(componentsDir, f)));
```

## Checklist
- [ ] Все цвета маппятся на Tailwind или добавлены в config.
- [ ] Размеры шрифтов и веса соответствуют дизайну.
- [ ] Отступы и gap используют Tailwind scale.
- [ ] Компоненты имеют правильные TypeScript типы.
- [ ] Ассеты (иконки, изображения) экспортированы и оптимизированы.
- [ ] Responsive breakpoints учтены (если есть mobile frames).
- [ ] Accessibility добавлена (`alt`, `aria-label`, focus states).
- [ ] Скриншот с localhost сверен с Figma-макетом.
