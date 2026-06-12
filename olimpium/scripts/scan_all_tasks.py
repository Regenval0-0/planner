import asyncio
import json
from playwright.async_api import async_playwright

EMAIL = "dasha10.vaiman@gmail.com"
PASSWORD = "s174392jfwtfn"
OUTPUT = "all_questions.json"

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
            await asyncio.sleep(10)
        else:
            print("[ERR] Button not found")
            return

        print(f"[PAGE] {page.url}")

        all_questions = []
        nav_items = await page.query_selector_all('.trainerNavigationItemComponent')
        print(f"[NAV] Found {len(nav_items)} tasks")

        for i in range(len(nav_items)):
            # Re-query nav items
            nav_items = await page.query_selector_all('.trainerNavigationItemComponent')
            if i >= len(nav_items):
                break

            await nav_items[i].click()
            print(f"[NAV] Clicked task {i+1}")
            await asyncio.sleep(4)

            # Extract question
            questions = await page.evaluate('''() => {
                const qs = [];
                const tasks = document.querySelectorAll('.trainerTaskComponent');
                tasks.forEach((task, idx) => {
                    const descEl = task.querySelector('.description');
                    const qText = descEl ? descEl.innerText.trim() : '';

                    const single = task.querySelector('.singleSelectTrainerTaskComponent');
                    if (single) {
                        const opts = [];
                        const options = single.querySelectorAll(':scope > .radioSelectComponent > .option, :scope > .option');
                        options.forEach((opt, j) => {
                            const textEl = opt.querySelector('.htmlTextComponent');
                            const text = textEl ? textEl.innerText.trim() : '';
                            if (text && !opts.find(o => o.text === text)) {
                                opts.push({ num: j + 1, text });
                            }
                        });
                        if (opts.length > 0) {
                            qs.push({ index: idx + 1, text: qText, type: 'single', options: opts });
                        }
                    }

                    const multi = task.querySelector('.multiSelectTrainerTaskComponent');
                    if (multi) {
                        const opts = [];
                        const options = multi.querySelectorAll(':scope > .multiSelectComponent > .option, :scope > .option');
                        options.forEach((opt, j) => {
                            const textEl = opt.querySelector('.htmlTextComponent');
                            const text = textEl ? textEl.innerText.trim() : '';
                            if (text && !opts.find(o => o.text === text)) {
                                opts.push({ num: j + 1, text });
                            }
                        });
                        if (opts.length > 0) {
                            qs.push({ index: idx + 1, text: qText, type: 'multi', options: opts });
                        }
                    }
                });
                return qs;
            }''')

            if questions:
                all_questions.append({
                    "task_num": i + 1,
                    "questions": questions
                })
                print(f"  [TASK {i+1}] {len(questions)} question(s)")
            else:
                print(f"  [TASK {i+1}] No questions (maybe code task)")

        data = { "url": page.url, "tasks": all_questions }
        with open(OUTPUT, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"\n[OK] Scanned {len(nav_items)} tasks, found questions in {len(all_questions)} tasks")
        print(f"[SAVE] {OUTPUT}")

        # Print all questions
        print("\n========== ALL QUESTIONS ==========\n")
        for t in all_questions:
            print(f"--- Задание {t['task_num']} ---")
            for q in t['questions']:
                q_type = "[Один вариант]" if q['type'] == 'single' else "[Несколько]"
                print(f"  Вопрос {q['index']} {q_type}")
                print(f"  {q['text']}")
                for o in q['options']:
                    print(f"    {o['num']}. {o['text']}")
                print()

        print("[WAIT] Browser open for 60s...")
        await asyncio.sleep(60)
        await browser.close()

asyncio.run(main())
