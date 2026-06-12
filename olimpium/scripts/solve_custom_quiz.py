import asyncio
import json
import sys
from playwright.async_api import async_playwright

EMAIL = "dasha10.vaiman@gmail.com"
PASSWORD = "s174392jfwtfn"

async def login_and_open_test(page):
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
        return False

    print(f"[PAGE] {page.url}")
    return True

async def extract_questions(page):
    print("[SCAN] Extracting questions...")
    await asyncio.sleep(2)

    questions = await page.evaluate('''() => {
        const qs = [];
        const tasks = document.querySelectorAll('.trainerTaskComponent');
        tasks.forEach((task, idx) => {
            const descEl = task.querySelector('.description');
            const qText = descEl ? descEl.innerText.trim() : '';

            // Single select
            const single = task.querySelector('.singleSelectTrainerTaskComponent');
            if (single) {
                const opts = [];
                const options = single.querySelectorAll(':scope > .radioSelectComponent > .option, :scope > .option');
                options.forEach((opt, i) => {
                    const textEl = opt.querySelector('.htmlTextComponent');
                    const text = textEl ? textEl.innerText.trim() : '';
                    if (text && !opts.find(o => o.text === text)) {
                        opts.push({ num: i + 1, text });
                    }
                });
                if (opts.length > 0) {
                    qs.push({ index: idx + 1, text: qText, type: 'single', options: opts });
                }
            }

            // Multi select
            const multi = task.querySelector('.multiSelectTrainerTaskComponent');
            if (multi) {
                const opts = [];
                const options = multi.querySelectorAll(':scope > .multiSelectComponent > .option, :scope > .option');
                options.forEach((opt, i) => {
                    const textEl = opt.querySelector('.htmlTextComponent');
                    const text = textEl ? textEl.innerText.trim() : '';
                    if (text && !opts.find(o => o.text === text)) {
                        opts.push({ num: i + 1, text });
                    }
                });
                if (opts.length > 0) {
                    qs.push({ index: idx + 1, text: qText, type: 'multi', options: opts });
                }
            }
        });
        return qs;
    }''')

    return questions

async def apply_answers(page, questions, answers_str):
    ans_map = {}
    parts = answers_str.replace(';', ',').split(',')
    for part in parts:
        part = part.strip()
        if '=' in part:
            q_num_str, opts_str = part.split('=', 1)
            try:
                q_num = int(q_num_str.strip())
                opts = [int(x.strip()) for x in opts_str.split(',') if x.strip().isdigit()]
                ans_map[q_num] = opts
            except ValueError:
                continue

    print(f"[APPLY] Answers: {ans_map}")

    tasks = await page.query_selector_all('.trainerTaskComponent')
    for q_num, opts in ans_map.items():
        if q_num < 1 or q_num > len(questions):
            print(f"[WARN] No question {q_num}")
            continue

        q = questions[q_num - 1]
        task = tasks[q_num - 1] if q_num - 1 < len(tasks) else None
        if not task:
            print(f"[WARN] Task element not found for {q_num}")
            continue

        if q['type'] == 'single':
            opt_els = await task.query_selector_all('.singleSelectTrainerTaskComponent .radioSelectComponent > .option')
            if not opt_els:
                opt_els = await task.query_selector_all('.singleSelectTrainerTaskComponent > .option')
        else:
            opt_els = await task.query_selector_all('.multiSelectTrainerTaskComponent .multiSelectComponent > .option')
            if not opt_els:
                opt_els = await task.query_selector_all('.multiSelectTrainerTaskComponent > .option')

        for opt_num in opts:
            if opt_num < 1 or opt_num > len(opt_els):
                print(f"[WARN] No option {opt_num} in question {q_num}")
                continue
            el = opt_els[opt_num - 1]
            try:
                await el.scroll_into_view_if_needed()
                await el.click()
                print(f"[OK] Selected option {opt_num} for question {q_num}")
                await asyncio.sleep(0.5)
            except Exception as e:
                print(f"[ERR] Click failed: {e}")

        # Submit this task
        try:
            submit = await task.query_selector('button:has-text("Ответить")')
            if submit:
                # Check if button is disabled
                disabled = await submit.get_attribute("disabled")
                if disabled:
                    print(f"[WARN] Submit button disabled for question {q_num} (maybe need to wait)")
                else:
                    await submit.click()
                    print(f"[OK] Submitted question {q_num}")
                    await asyncio.sleep(3)
            else:
                print(f"[WARN] No submit button for question {q_num}")
        except Exception as e:
            print(f"[WARN] Submit failed: {e}")

    print("[DONE] Answers applied.")

async def navigate_to_task(page, task_num):
    """Click on task number in navigation."""
    nav_items = await page.query_selector_all('.trainerNavigationItemComponent')
    if task_num - 1 < len(nav_items):
        await nav_items[task_num - 1].click()
        print(f"[NAV] Clicked task {task_num}")
        await asyncio.sleep(3)
        return True
    return False

async def main():
    if len(sys.argv) < 2:
        print("Usage: python solve_custom_quiz.py extract")
        print("       python solve_custom_quiz.py apply '1=2, 2=1'")
        return

    mode = sys.argv[1]

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page(viewport={'width': 1400, 'height': 900})

        ok = await login_and_open_test(page)
        if not ok:
            await browser.close()
            return

        if mode == "extract":
            questions = await extract_questions(page)
            data = { "url": page.url, "questions": questions }
            with open("quiz_23557.json", "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

            print(f"\n[OK] Found {len(questions)} question(s)\n")
            for q in questions:
                q_type = "[Один вариант]" if q['type'] == 'single' else "[Несколько]"
                print(f"--- Вопрос {q['index']} {q_type} ---")
                print(q['text'])
                for o in q['options']:
                    print(f"  {o['num']}. {o['text']}")
                print()
            print("[SAVE] quiz_23557.json")
            print("[WAIT] Browser stays open. Run with apply to submit answers.")
            await asyncio.sleep(120)

        elif mode == "apply":
            if len(sys.argv) < 3:
                print("Usage: python solve_custom_quiz.py apply '1=2, 2=1'")
                await browser.close()
                return
            answers = sys.argv[2]
            questions = await extract_questions(page)
            await apply_answers(page, questions, answers)
            print("[WAIT] Browser stays open for 30s...")
            await asyncio.sleep(30)

        elif mode == "navigate":
            if len(sys.argv) < 3:
                print("Usage: python solve_custom_quiz.py navigate 5")
                await browser.close()
                return
            task_num = int(sys.argv[2])
            await navigate_to_task(page, task_num)
            questions = await extract_questions(page)
            print(f"\n[OK] Task {task_num} loaded, {len(questions)} question(s)")
            for q in questions:
                q_type = "[Один вариант]" if q['type'] == 'single' else "[Несколько]"
                print(f"--- Вопрос {q['index']} {q_type} ---")
                print(q['text'])
                for o in q['options']:
                    print(f"  {o['num']}. {o['text']}")
                print()
            await asyncio.sleep(60)

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
