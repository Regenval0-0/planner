import asyncio
import json
from playwright.async_api import async_playwright

EMAIL = "dasha10.vaiman@gmail.com"
PASSWORD = "s174392jfwtfn"
OUTPUT = "quiz_23557.json"

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page(viewport={'width': 1400, 'height': 900})

        print("[AUTH] Login...")
        await page.goto("https://olimpium.ru/login", timeout=30000)
        await asyncio.sleep(2)
        try:
            await page.fill("input[type='text'], input[type='email']", EMAIL)
            await page.fill("input[type='password']", PASSWORD)
            await page.keyboard.press("Enter")
            await asyncio.sleep(5)
        except:
            pass

        print("[NAV] Open course...")
        await page.goto("https://olimpium.ru/courses/671", timeout=60000)
        await page.wait_for_load_state("domcontentloaded")
        await asyncio.sleep(5)

        try:
            btn = await page.query_selector('button:has-text("Соглашаюсь")')
            if btn:
                await btn.click()
                await asyncio.sleep(2)
        except:
            pass

        btn = await page.query_selector('button:has-text("Продолжить обучение")')
        if not btn:
            btn = await page.query_selector('a:has-text("Продолжить обучение")')
        if btn:
            await btn.click()
            print("[CLICK] Продолжить обучение")
        else:
            print("[ERR] Button not found")
            return

        # Ждем radio кнопки до 30 секунд
        print("[WAIT] Waiting for radio/checkbox...")
        try:
            await page.wait_for_selector('input[type="radio"], input[type="checkbox"]', timeout=30000)
            print("[OK] Found radio/checkbox")
        except Exception as e:
            print(f"[WARN] No radio found: {e}")

        await asyncio.sleep(3)
        print(f"[PAGE] {page.url}")

        # Сохраним HTML для анализа
        html = await page.content()
        with open("test_page.html", "w", encoding="utf-8") as f:
            f.write(html)
        print("[SAVE] test_page.html")

        # Extract all text with radio inputs
        questions = await page.evaluate('''() => {
            const qs = [];
            const inputs = Array.from(document.querySelectorAll('input[type="radio"], input[type="checkbox"]'));
            const byName = {};
            inputs.forEach(inp => {
                const n = inp.name || 'unnamed';
                if (!byName[n]) byName[n] = [];
                const lbl = inp.closest('label');
                let text = '';
                if (lbl) {
                    const clone = lbl.cloneNode(true);
                    const i = clone.querySelector('input');
                    if (i) i.remove();
                    text = clone.innerText.trim();
                } else {
                    // try parent div/span
                    const parent = inp.parentElement;
                    if (parent) {
                        const clone = parent.cloneNode(true);
                        const i = clone.querySelector('input');
                        if (i) i.remove();
                        text = clone.innerText.trim();
                    }
                }
                byName[n].push({ num: byName[n].length + 1, text, id: inp.id, value: inp.value, type: inp.type });
            });
            Object.entries(byName).forEach(([name, opts], idx) => {
                if (opts.length > 1) {
                    // Find question text nearby
                    const first = inputs.find(i => i.name === name);
                    let qText = '';
                    if (first) {
                        const container = first.closest('div, li, fieldset, section');
                        if (container) {
                            const qEl = container.querySelector('p, h3, h4, .question-text, [class*="question"]');
                            if (qEl) qText = qEl.innerText.trim();
                            if (!qText) {
                                // Clone container, remove options, get text
                                const clone = container.cloneNode(true);
                                clone.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(i => {
                                    const l = i.closest('label');
                                    if (l) l.remove(); else i.remove();
                                });
                                qText = clone.innerText.trim().substring(0, 500);
                            }
                        }
                    }
                    qs.push({ index: idx + 1, name, text: qText, options: opts });
                }
            });
            return qs;
        }''')

        data = { "url": page.url, "questions": questions }
        with open(OUTPUT, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"\n[OK] Extracted {len(questions)} question(s)\n")
        for q in questions:
            print(f"--- Вопрос {q['index']} ---")
            print(q.get('text', ''))
            for o in q['options']:
                print(f"  {o['num']}. {o['text']}")
            print()

        print(f"[SAVE] {OUTPUT}")
        await asyncio.sleep(30)
        await browser.close()

asyncio.run(main())
