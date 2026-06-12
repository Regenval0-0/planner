# Skill: Figma MCP Server — AI-генерация дизайнов

## When to Use
Когда AI-ассистент (Claude, Codex, Cursor) должен самостоятельно создавать или редактировать дизайны в Figma, извлекать токены и генерировать код из макетов.

## Figma MCP Server (Официальный)
Figma выпустил официальный MCP-сервер для интеграции с AI-агентами.

### Возможности
| Инструмент | Что делает |
|------------|------------|
| `use_figma` | Чтение и запись файлов, создание компонентов, фреймов, переменных |
| `generate_figma_design` | Отправка UI из запущенного веб-приложения в Figma как дизайн-слои |
| `search_design_system` | Поиск существующих компонентов, переменных, стилей |
| `get_design_context` | Извлечение контекста для генерации кода |
| `get_metadata` | Получение метаданных файла |

### Установка
```bash
# Добавить в Claude Code
claude mcp add figma -- npx -y @figma/mcp-server

# Или через настройки
# ~/.claude/settings.json или .claude/mcp.json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@figma/mcp-server"],
      "env": {
        "FIGMA_API_TOKEN": "figd_xxx"
      }
    }
  }
}
```

### API Token
1. Открыть Figma → Settings → Personal Access Tokens.
2. Создать новый токен.
3. Сохранить в `.env`:
```bash
FIGMA_API_TOKEN=figd_xxxxxxxx
```

## VibeFigma — Figma → React
Open-source конвертер дизайнов в production-ready React.

### Установка
```bash
npm install -g vibefigma

# Или npx
npx vibefigma --interactive
```

### Использование
```bash
# Конвертация файла
npx vibefigma "https://www.figma.com/design/ABC123/My-Design" --token YOUR_TOKEN

# С выводом в React + Tailwind
npx vibefigma "https://www.figma.com/design/ABC123" --token YOUR_TOKEN --output ./src/components

# Claude Code skill
npx skills add vibeflowing-inc/vibe_figma --skill vibefigma
```

### Возможности
- Извлечение компонентов, стилей, цветов, типографики.
- Генерация React + Tailwind CSS компонентов.
- Извлечение ассетов (иконки, изображения).
- Адаптивный дизайн.
- Опция чистки AI (`--clean`).

## SPFR Figma Design Pipeline
MCP-сервер для дизайн-интеллекта и генерации кода.

### Установка
```bash
npm install -g spfr-figma-pipeline
claude mcp add spfr -- npx -y spfr-figma-pipeline
```

### Возможности
- Аудит дизайна (нейминг, accessibility).
- Синхронизация токенов Figma → Tailwind config.
- Генерация React-компонентов.
- Батчевые записи (в 30-60x быстрее обычного API).

## Anima SDK — Production Codegen
Коммерческий SDK для преобразования дизайнов в код.

### Установка
```bash
npm install @animaapp/anima-sdk
```

### Использование
```ts
import { AnimaSDK } from '@animaapp/anima-sdk';

const sdk = new AnimaSDK({ apiKey: process.env.ANIMA_API_KEY });

// Figma → React
const result = await sdk.convertFigmaToCode({
  figmaFileUrl: 'https://www.figma.com/design/ABC123',
  framework: 'react',
  styling: 'tailwind',
});

console.log(result.components);
```

## OpenAI Skill: figma-generate-design
Официальный skill от OpenAI для создания экранов в Figma.

### Workflow
1. AI обнаруживает дизайн-систему (компоненты, переменные, стили).
2. Строит экран по частям, используя существующие токены.
3. Параллельно запускает `generate_figma_design` (скриншот из браузера) + `use_figma` (сборка компонентов).

### Промпт для Claude
```
"Создай в Figma экран логина. Используй существующую дизайн-систему из файла ABC123. Компоненты: Input, Button, Logo. Цвета из Variables: Primary-500, Surface-Muted."
```

## Практический пример: AI создаёт дизайн

### Шаг 1: Поиск дизайн-системы
```ts
// AI вызывает search_design_system
const components = await figmaMcp.searchDesignSystem({
  fileKey: "ABC123",
  query: "button, input, card"
});
```

### Шаг 2: Чтение токенов
```ts
const tokens = await figmaMcp.getVariables({
  fileKey: "ABC123"
});
// Primary-500: #3B82F6
// Surface-Muted: #F8FAFC
```

### Шаг 3: Создание экрана через Plugin API
Плагин получает JSON-инструкции от AI:
```json
{
  "action": "create_frame",
  "name": "Login Screen",
  "width": 1440,
  "height": 900,
  "fills": [{ "type": "SOLID", "color": "#F8FAFC" }],
  "children": [
    {
      "type": "component_instance",
      "componentName": "Logo",
      "x": 640, "y": 200
    },
    {
      "type": "auto_layout",
      "direction": "VERTICAL",
      "x": 520, "y": 320,
      "width": 400, "height": 300,
      "children": [
        { "type": "input", "label": "Email" },
        { "type": "input", "label": "Password" },
        { "type": "button", "text": "Sign In", "variant": "Primary" }
      ]
    }
  ]
}
```

### Шаг 4: Генерация кода из созданного дизайна
```ts
const code = await figmaMcp.generateCode({
  fileKey: "ABC123",
  nodeId: "123:456",
  framework: "react",
  styling: "tailwind"
});
// Получаем готовый React-компонент
```

## Сравнение инструментов

| Инструмент | Тип | Направление | Лучшее применение |
|------------|-----|-------------|-------------------|
| **Figma MCP Server** | Официальный | Двунаправленный | Чтение/запись файлов, синхронизация |
| **VibeFigma** | Open-source | Figma → Code | Быстрая конвертация в React |
| **SPFR Pipeline** | Open-source | Двунаправленный | Полный дизайн-пайплайн с токенами |
| **Anima SDK** | Коммерческий | Figma → Code | Production-кодген для команд |
| **Figma Plugin API** | Нативный | Code → Figma | Полный контроль, кастомные плагины |

## Vibe Coding паттерн: Design → Code Loop
```
Пользователь: "Сделай страницу профиля"
     ↓
AI создаёт дизайн в Figma через Plugin API
     ↓
AI генерирует React-компоненты через MCP
     ↓
AI имплементирует в проект (код + стили)
     ↓
AI открывает localhost, делает скриншот
     ↓
AI сравнивает скриншот с Figma-макетом
     ↓
AI доводит пиксель-в-пиксель до совпадения
```

## Checklist
- [ ] Figma API token создан и сохранён в `.env`.
- [ ] MCP-сервер установлен и подключён к Claude Code.
- [ ] Дизайн-система (компоненты, токены) опубликована в Figma.
- [ ] Компоненты названы чётко (Button/Primary, Input/Default).
- [ ] Переменные созданы для цветов, спейсинга, радиусов.
- [ ] Плагин протестирован на тестовом файле.
- [ ] Генерация кода проверена на соответствие дизайну.
- [ ] Скриншот с localhost сравнён с Figma-макетом.
