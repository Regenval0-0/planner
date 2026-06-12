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

        # Click cookie agree
        try:
            btn = await page.query_selector('button:has-text("Соглашаюсь")')
            if btn:
                await btn.click()
                await asyncio.sleep(2)
        except:
            pass

        # Click "Продолжить обучение"
        btn = await page.query_selector('button:has-text("Продолжить обучение")')
        if not btn:
            btn = await page.query_selector('a:has-text("Продолжить обучение")')
        if btn:
            await btn.click()
            print("[CLICK] Продолжить обучение")
            await asyncio.sleep(8)
        else:
            print("[WARN] Button not found")
            await browser.close()
            return

        print(f"[PAGE] {page.url}")
        await page.screenshot(path="test_loaded.png", full_page=True)
        print("[SAVE] test_loaded.png")

        # Extract questions
        questions = await page.evaluate('''() => {
            const qs = [];
            const containers = document.querySelectorAll('.question, .test-question, [class*="question"], .task');
            containers.forEach((c, idx) => {
                const qText = c.querySelector('h3, h4, p, .question-text, [class*="question-text"]');
                const text = qText ? qText.innerText.trim() : '';
                const opts = [];
                const labels = c.querySelectorAll('label');
                labels.forEach((lbl, i) => {
                    const inp = lbl.querySelector('input[type="radio"], input[type="checkbox"]');
                    if (inp) {
                        const clone = lbl.cloneNode(true);
                        clone.querySelector('input').remove();
                        opts.push({
                            num: i + 1,
                            text: clone.innerText.trim(),
                            id: inp.id,
                            value: inp.value,
                            type: inp.type,
                            name: inp.name
                        });
                    }
                });
                if (opts.length > 0) {
                    qs.push({ index: idx + 1, text: text, options: opts });
                }
            });
            return qs;
        }''')

        if not questions:
            # Fallback: extract all radio/checkbox groups
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
                    }
                    byName[n].push({ num: byName[n].length + 1, text, id: inp.id, value: inp.value, type: inp.type });
                });
                Object.entries(byName).forEach(([name, opts]) => {
                    if (opts.length > 1) qs.push({ index: qs.length + 1, name, text: '', options: opts });
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

        print(f"[SAVE] Saved to {OUTPUT}")
        print("[WAIT] Browser open for 30s...")
        await asyncio.sleep(30)
        await browser.close()

asyncio.run(main())
