import asyncio
from playwright.async_api import async_playwright

EMAIL = "dasha10.vaiman@gmail.com"
PASSWORD = "s174392jfwtfn"
COURSE_URL = "https://olimpium.ru/courses/671"
TARGET_STAGE = "23557"

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

        print(f"[NAV] Opening course page: {COURSE_URL}")
        await page.goto(COURSE_URL, timeout=60000)
        await page.wait_for_load_state("domcontentloaded")
        await asyncio.sleep(5)

        print(f"[PAGE] {page.url}")
        await page.screenshot(path="course_page.png", full_page=True)
        print("[SAVE] course_page.png saved")

        # Find link to target stage
        selector = f'a[href*="/stage/{TARGET_STAGE}"]'
        link = await page.query_selector(selector)
        if link:
            print(f"[FOUND] Link to stage {TARGET_STAGE} found. Clicking...")
            await link.click()
            await asyncio.sleep(8)
            print(f"[PAGE] After click: {page.url}")
            await page.screenshot(path="stage_after_click.png", full_page=True)
            print("[SAVE] stage_after_click.png saved")

            # Check for quiz
            inputs = await page.query_selector_all('input[type="radio"], input[type="checkbox"]')
            print(f"[QUIZ] Found {len(inputs)} radio/checkbox inputs")

            # Save HTML
            html = await page.content()
            with open("stage_after_click.html", "w", encoding="utf-8") as f:
                f.write(html)
            print("[SAVE] stage_after_click.html saved")
        else:
            print(f"[NOT FOUND] No link to stage {TARGET_STAGE} on course page")
            # Try any stage links
            all_links = await page.query_selector_all('a[href*="/stage/"]')
            print(f"[INFO] Found {len(all_links)} total stage links")
            for i, l in enumerate(all_links[:10]):
                text = await l.inner_text()
                href = await l.get_attribute("href")
                print(f"  {i+1}. {text.strip()[:50]} -> {href}")

        print("[WAIT] Browser stays open for 60s...")
        await asyncio.sleep(60)
        await browser.close()

asyncio.run(main())
