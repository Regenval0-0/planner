import asyncio
from playwright.async_api import async_playwright

EMAIL = "dasha10.vaiman@gmail.com"
PASSWORD = "s174392jfwtfn"

async def test_url(page, url, name):
    print(f"\n=== {name}: {url} ===")
    await page.goto(url, timeout=60000)
    await page.wait_for_load_state("domcontentloaded")

    # Click cookie agree if present
    try:
        btn = await page.query_selector('button:has-text("Соглашаюсь")')
        if btn:
            await btn.click()
            print("[COOKIE] Clicked agree")
            await asyncio.sleep(2)
    except:
        pass

    # Wait up to 30s for loader to disappear or content to appear
    for i in range(30):
        await asyncio.sleep(1)
        loader = await page.query_selector(".loaderComponent")
        if not loader:
            print(f"[OK] Loader gone after {i+1}s")
            break
        visible = await loader.is_visible()
        if not visible:
            print(f"[OK] Loader hidden after {i+1}s")
            break
    else:
        print("[WARN] Loader still there after 30s")

    await asyncio.sleep(3)
    html = await page.content()
    has_nav = ".trainerNavigationItemComponent" in html
    has_radio = 'type="radio"' in html
    has_checkbox = 'type="checkbox"' in html
    print(f"[RESULT] nav={has_nav}, radio={has_radio}, checkbox={has_checkbox}, len={len(html)}")
    await page.screenshot(path=f"test_{name}.png", full_page=True)
    print(f"[SAVE] test_{name}.png")

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

        await test_url(page, "https://olimpium.ru/courses/671/stage/23539", "old_start")
        await test_url(page, "https://olimpium.ru/courses/671/stage/23557", "target_23557")
        await test_url(page, "https://olimpium.ru/courses/671", "course_page")

        print("\n[WAIT] Browser open for 30s...")
        await asyncio.sleep(30)
        await browser.close()

asyncio.run(main())
