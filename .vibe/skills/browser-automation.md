# Skill: Browser Automation (Playwright, Puppeteer, Scraping)

## When to Use
Automating browser actions for testing (E2E), web scraping, data extraction, screenshot generation, PDF creation, or monitoring web applications.

## Playwright (Recommended)
Install:
```bash
npm install -D @playwright/test
npx playwright install
```

### Basic Test
```ts
import { test, expect } from '@playwright/test';

test('login flow', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'secret123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

### Locators (Preferred over selectors)
```ts
// Best: semantic locators
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByLabel('Email').fill('test@example.com');
await page.getByText('Welcome back').isVisible();
await page.getByTestId('submit-btn').click();

// Acceptable: CSS selectors
await page.locator('.login-form').click();
await page.locator('#username').fill('admin');

// Avoid: XPath unless absolutely necessary
```

### Assertions
```ts
await expect(page.locator('.title')).toHaveText('Dashboard');
await expect(page.locator('.spinner')).not.toBeVisible();
await expect(page).toHaveTitle(/Planner/);
await expect(page.locator('input')).toBeEnabled();
```

### Setup & Teardown
```ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    await use(page);
  },
});
```

### Screenshots & Traces
```ts
test('visual regression', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveScreenshot('dashboard.png');
});

// On failure, trace is auto-generated if configured
// npx playwright show-trace trace.zip
```

### API Request Mocking
```ts
await page.route('**/api/tasks', async (route) => {
  await route.fulfill({
    status: 200,
    body: JSON.stringify([{ id: '1', title: 'Mock Task' }]),
  });
});
```

### Parallel Execution Config
```ts
// playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 4 : undefined,
  retries: process.env.CI ? 2 : 0,
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
});
```

## Puppeteer (Chrome-only)
Install:
```bash
npm install puppeteer
```

```ts
import puppeteer from 'puppeteer';

async function scrape() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://example.com');
  const title = await page.evaluate(() => document.title);
  
  await page.screenshot({ path: 'screenshot.png', fullPage: true });
  await browser.close();
  return title;
}
```

## Web Scraping Best Practices

### Rate Limiting
```ts
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrapeUrls(urls: string[]) {
  for (const url of urls) {
    await scrapePage(url);
    await delay(1000 + Math.random() * 2000); // 1-3s delay
  }
}
```

### Block Unnecessary Resources (Speed up 2-3x)
```ts
await page.route('**/*.{png,jpg,jpeg,gif,css,font}', (route) => route.abort());
```

### Handle Infinite Scroll
```ts
async function scrollToBottom(page: Page) {
  let previousHeight = 0;
  while (true) {
    const currentHeight = await page.evaluate(() => document.body.scrollHeight);
    if (currentHeight === previousHeight) break;
    previousHeight = currentHeight;
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
  }
}
```

### Extract Structured Data
```ts
const products = await page.$$eval('.product', (elements) =>
  elements.map((el) => ({
    name: el.querySelector('.product-name')?.textContent?.trim(),
    price: el.querySelector('.product-price')?.textContent?.trim(),
    image: el.querySelector('img')?.src,
  }))
);
```

### Stealth Mode (Anti-bot)
```ts
// Playwright with stealth
import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';

chromium.use(stealth);
const browser = await chromium.launch();
```

## Testing Checklist
- [ ] Tests run in headless mode in CI.
- [ ] Screenshots captured on failure.
- [ ] API calls mocked where appropriate.
- [ ] Parallel execution configured.
- [ ] Cross-browser testing (Chromium + Firefox + WebKit).
- [ ] Rate limiting implemented for scraping.
- [ ] User-Agent rotation for scraping.
