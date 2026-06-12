# Skill: AI Screen Control & GUI Automation

## When to Use
When the AI assistant needs to "see" the screen, interact with UI elements (click, type, scroll), test visual interfaces, or automate tasks in browsers/desktop apps on behalf of the user.

## Options Overview

| Approach | Best For | Speed | Cost | Setup |
|----------|----------|-------|------|-------|
| **Claude Computer Use API** | Desktop apps, legacy systems, complex visual tasks | Slow (2-8s/action) | $2-6/task | Docker sandbox |
| **Playwright MCP (Glance)** | Web testing, browser automation, visual QA | Fast | Free | npm install |
| **Browser MCP Bridge** | Debugging user's actual Chrome session | Medium | Free | Chrome extension |
| **VibeBrowser Cloud** | Always-on authenticated sessions (Gmail, GitHub) | Fast | Paid | npx command |
| **Screenshots + Analysis** | One-off visual checks, design review | Instant | Cheap | Built-in |

## Option 1: Claude Computer Use API (Full GUI Control)
Claude can control a virtual desktop: take screenshots, move mouse, click, type, press keys.

### How It Works
1. User gives task (e.g., "Fill out the tax form on screen").
2. Claude requests a screenshot.
3. Your app runs the action in a sandboxed container (Docker + Xvfb).
4. Returns screenshot result to Claude.
5. Claude decides next action (click, type, etc.).
6. Loop until task complete.

### Available Actions
```json
{
  "action": "screenshot"
}
{
  "action": "left_click",
  "coordinate": [420, 300]
}
{
  "action": "type",
  "text": "Hello World"
}
{
  "action": "key",
  "text": "ctrl+s"
}
{
  "action": "scroll",
  "scroll_amount": -3,
  "coordinate": [500, 400]
}
{
  "action": "mouse_move",
  "coordinate": [600, 350]
}
```

### Docker Setup (Reference Implementation)
```bash
# Anthropic provides official Docker image
docker pull anthropic/computer-use-demo

# Run with virtual display
docker run -it -p 8080:8080 \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  anthropic/computer-use-demo

# Access via browser at localhost:8080
```

### API Call Pattern
```ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function computerUseLoop(task: string) {
  const response = await client.beta.messages.create({
    model: 'claude-opus-4-8-20251001',
    max_tokens: 4096,
    betas: ['computer-use-2025-11-24'],
    tools: [
      {
        type: 'computer_20251124',
        name: 'computer',
        display_width_px: 1280,
        display_height_px: 800,
      },
      { type: 'bash_20250124', name: 'bash' },
      { type: 'text_editor_20250124', name: 'text_editor' },
    ],
    messages: [{ role: 'user', content: task }],
  });

  // Execute tool calls in sandbox, return results, repeat
  return response;
}
```

### Use Cases
- Filling forms on legacy sites with no API.
- Visual QA: "Check if the dashboard looks correct."
- Desktop app automation (Excel, calculators, etc.).
- Extracting data from complex visual layouts.

### Limitations
- **Slow**: ~2-8 seconds per action. A 20-step task takes 1-3 minutes.
- **Expensive**: ~$0.10-$0.30 per screenshot; $2-6 per typical task.
- **Accuracy**: Small text or complex layouts may cause misclicks.
- **Security**: Run only in sandboxed containers; never on production machines.

---

## Option 2: Playwright MCP Servers (Web Only)
Connect Claude Code directly to a browser via MCP.

### Glance (Recommended)
```bash
npm install -g glance-mcp

# Add to Claude Code
claude mcp add glance -- npx glance-mcp
```

**Tools available:**
- `browser_screenshot` — Returns base64 PNG (Claude "sees" the page).
- `browser_snapshot` — Full DOM + accessibility tree as text.
- `browser_navigate` — Go to URL.
- `browser_click`, `browser_fill`, `browser_select` — Interactions.
- `browser_assert` — 12 assertion types (textContains, urlEquals, visualCompare).

**Example workflow:**
```
User: "Открой мой сайт localhost:5173, сделай скриншот и скажи, всё ли в порядке с дизайном."
AI: (вызывает browser_navigate → browser_screenshot → анализирует → отвечает)
```

### Mare Browser MCP (Lightweight)
```bash
pnpm add -g mare-browser-mcp
npx playwright install chromium
pnpm run setup  # auto-registers with Claude Code
```

**Key tools:**
- `browser_screenshot()` — Visual capture.
- `browser_debug()` — URL + console + network + dialogs in one call.
- `browser_query()` — DOM extraction without screenshots (token-efficient).
- `browser_act()` — Click, hover, fill, scroll, keypress, drag.

### Browser MCP Bridge (Your Real Chrome)
```bash
git clone https://github.com/robhicks/browser-mcp-bridge.git
cd browser-mcp-bridge
npm run install-server
```

Install Chrome extension → connect to local server → Claude controls your actual browser.

**Best for:** Debugging the exact session you're already in. Full DevTools access.

---

## Option 3: Screenshot-Based Analysis (Simplest)
If full automation isn't needed, just share screenshots.

```bash
# macOS
screencapture -i screenshot.png

# Windows (PowerShell)
Add-Type -Assembly System.Windows.Forms
[Windows.Forms.SendKeys]::SendWait('{PRTSC}')

# Linux (GNOME)
gnome-screenshot -f screenshot.png
```

Then upload the image and ask: *"Что не так с этим экраном?"* — Claude analyzes visually without controlling anything.

---

## Vibe Coding with Screen Control

### Pattern: Visual TDD
1. User: "Сделай страницу профиля."
2. AI writes code.
3. AI opens browser via MCP, navigates to page, takes screenshot.
4. AI compares screenshot with mental model / Figma.
5. AI adjusts CSS, repeats until looks right.

### Pattern: Bug Reproduction
1. User: "На этой странице кнопка не работает."
2. AI takes screenshot, identifies button.
3. AI clicks button, checks console logs (via browser_debug).
4. AI identifies error in code, fixes it.

### Pattern: Form Filling
1. User: "Заполни 50 тестовых форм на сайте клиента."
2. AI navigates to form, reads fields from DOM.
3. AI fills data, submits, repeats.

---

## Security Best Practices
- **Never** run Computer Use on your main machine. Always sandbox (Docker/VM).
- **Block** sensitive sites in MCP browser configs.
- **Review** every action before execution in high-stakes environments.
- **Rotate** credentials after automated sessions.
- **Log** all actions for audit trails.

## Checklist
- [ ] MCP server installed and Claude Code configured.
- [ ] Screenshot tool returns clear images.
- [ ] Browser automation restricted to allowed URLs.
- [ ] Credentials never shared with AI (use pre-authenticated sessions).
- [ ] Actions logged for review.
- [ ] Fallback to manual control if AI gets stuck.
