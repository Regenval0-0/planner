import asyncio
from playwright.async_api import async_playwright

EMAIL = "dasha10.vaiman@gmail.com"
PASSWORD = "s174392jfwtfn"

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

        print("[NAV] Opening course page...")
        await page.goto("https://olimpium.ru/courses/671", timeout=60000)
        await page.wait_for_load_state("domcontentloaded")
        await asyncio.sleep(5)

        # Click cookie agree if present
        try:
            btn = await page.query_selector('button:has-text("Соглашаюсь")')
            if btn:
                await btn.click()
                await asyncio.sleep(2)
        except:
            pass

        await page.screenshot(path="course_before_click.png", full_page=True)
        print("[SAVE] course_before_click.png")

        # Find "Продолжить обучение" button
        selectors = [
            'button:has-text("Продолжить обучение")',
            'a:has-text("Продолжить обучение")',
            'button:has-text("Продолжить")',
            'a:has-text("Продолжить")',
        ]
        for sel in selectors:
            btn = await page.query_selector(sel)
            if btn:
                text = await btn.inner_text()
                href = await btn.get_attribute("href")
                print(f"[FOUND] Button: '{text.strip()[:50]}' href={href}")
                await btn.click()
                await asyncio.sleep(8)
                print(f"[PAGE] After click: {page.url}")
                await page.screenshot(path="after_continue.png", full_page=True)
                print("[SAVE] after_continue.png")

                html = await page.content()
                has_nav = ".trainerNavigationItemComponent" in html
                has_radio = 'type="radio"' in html
                has_checkbox = 'type="checkbox"' in html
                print(f"[RESULT] nav={has_nav}, radio={has_radio}, checkbox={has_checkbox}, len={len(html)}")
                break
        else:
            print("[NOT FOUND] No continue button found")

        print("[WAIT] Browser open for 60s...")
        await asyncio.sleep(60)
        await browser.close()

asyncio.run(main())
