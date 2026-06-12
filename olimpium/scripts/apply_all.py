import asyncio
import sys
from playwright.async_api import async_playwright

sys.stdout.reconfigure(encoding='utf-8')

EMAIL = "dasha10.vaiman@gmail.com"
PASSWORD = "s174392jfwtfn"

ANSWERS = {
    1: 2,
    2: 3,
    3: 3,
    4: 2,
}

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

        nav_items = await page.query_selector_all('.trainerNavigationItemComponent')
        print(f"[NAV] {len(nav_items)} tasks total")

        for task_num, opt_num in ANSWERS.items():
            if task_num > len(nav_items):
                print(f"[WARN] Task {task_num} doesn't exist")
                continue

            nav_items = await page.query_selector_all('.trainerNavigationItemComponent')
            await nav_items[task_num - 1].click()
            print(f"\n[NAV] Task {task_num}")
            await asyncio.sleep(4)

            # Click option via JS
            success = await page.evaluate(f'''() => {{
                const task = document.querySelector('.trainerTaskComponent');
                if (!task) return false;
                const single = task.querySelector('.singleSelectTrainerTaskComponent');
                const multi = task.querySelector('.multiSelectTrainerTaskComponent');
                const container = single || multi;
                if (!container) return false;
                const options = container.querySelectorAll('.checkboxComponent.option');
                if (options.length < {opt_num}) return false;
                const target = options[{opt_num - 1}];
                target.scrollIntoView({{ block: 'center' }});
                const box = target.querySelector('.box');
                (box || target).click();
                return true;
            }}''')

            if success:
                print(f"  [OK] Clicked option {opt_num} via JS")
                await asyncio.sleep(2)
            else:
                print(f"  [WARN] Could not click option {opt_num}")
                continue

            # Submit via JS - find button by text content
            submit_ok = await page.evaluate('''() => {
                const task = document.querySelector('.trainerTaskComponent');
                if (!task) return false;
                const buttons = task.querySelectorAll('button');
                const btn = Array.from(buttons).find(b => b.textContent.includes('Ответить'));
                if (!btn) return false;
                btn.scrollIntoView({ block: 'center' });
                btn.removeAttribute('disabled');
                btn.click();
                return true;
            }''')

            if submit_ok:
                print(f"  [OK] Submit clicked")
                await asyncio.sleep(3)
            else:
                print(f"  [WARN] Submit not found")

        print("\n[DONE] All answers applied!")
        print("[WAIT] Browser open for 30s...")
        await asyncio.sleep(30)
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
