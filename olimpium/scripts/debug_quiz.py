import asyncio
import os
from playwright.async_api import async_playwright

EMAIL = "dasha10.vaiman@gmail.com"
PASSWORD = "s174392jfwtfn"
URL = "https://olimpium.ru/courses/671/stage/23557"

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

        await page.goto(URL, timeout=60000)
        await page.wait_for_load_state("domcontentloaded")

        # Ждем до 60 секунд пока пропадет loader
        for i in range(60):
            await asyncio.sleep(1)
            loader = await page.query_selector(".loaderComponent")
            if not loader:
                print(f"[OK] Loader gone after {i+1}s")
                break
            visible = await loader.is_visible()
            if not visible:
                print(f"[OK] Loader hidden after {i+1}s")
                break
            # Проверим URL
            if "login" in page.url:
                print(f"[WARN] Redirected to login!")
                break
        else:
            print("[WARN] Loader still there after 60s")

        await asyncio.sleep(3)
        print(f"[PAGE] {page.url}")

        # Скриншот
        await page.screenshot(path="quiz_screenshot.png", full_page=True)
        print("[SAVE] Screenshot saved")

        # Проверим есть ли контент
        html = await page.content()
        has_radio = 'type="radio"' in html
        has_checkbox = 'type="checkbox"' in html
        print(f"[CHECK] radio={has_radio}, checkbox={has_checkbox}, len={len(html)}")

        # Консольные ошибки
        logs = []
        page.on("console", lambda msg: logs.append(f"{msg.type}: {msg.text}"))
        await asyncio.sleep(2)
        for log in logs[-20:]:
            print(f"[CONSOLE] {log}")

        # Сохраним html если есть что-то интересное
        with open("quiz_debug.html", "w", encoding="utf-8") as f:
            f.write(html)

        print("[WAIT] Browser stays open for 60s...")
        await asyncio.sleep(60)
        await browser.close()

asyncio.run(main())
