import asyncio
import os
from playwright.async_api import async_playwright

EMAIL = "dasha10.vaiman@gmail.com"
PASSWORD = "s174392jfwtfn"
START_URL = "https://olimpium.ru/courses/671/stage/23539"
SOLUTIONS_DIR = "olimpium_solutions"

async def find_and_click_next(page):
    """Find and click the Next Stage button, return new URL or None."""
    selectors = [
        'button.button._next',
        'button.buttonComponent._next',
        'button[class*="_next"]',
        'button:has-text("Следующий этап")',
        'a:has-text("Следующий этап")',
    ]
    for sel in selectors:
        try:
            btn = await page.query_selector(sel)
            if btn and await btn.is_visible():
                await btn.click()
                await asyncio.sleep(3)
                return True
        except:
            continue
    return False

async def upload_for_current_task(page, task_num):
    """Upload the solution file for the current task."""
    file_path = os.path.abspath(os.path.join(SOLUTIONS_DIR, f"task_{task_num}.py"))
    if not os.path.exists(file_path):
        print(f"[SKIP] No solution file for task {task_num}")
        return False

    print(f"[UPLOAD] Task {task_num}: {file_path}")

    # Wait a bit for the task page to fully render
    await asyncio.sleep(2)

    # Try to find file input
    file_input = await page.query_selector('input[type="file"]')
    if not file_input:
        print(f"[WARN] No file input found for task {task_num}")
        # Save screenshot for debug
        await page.screenshot(path=f"debug_task_{task_num}.png")
        return False

    try:
        await file_input.set_input_files(file_path)
        print(f"[OK] File uploaded")
        await asyncio.sleep(2)
    except Exception as e:
        print(f"[ERR] Upload failed: {e}")
        return False

    # Try to find submit button
    submit_selectors = [
        'button:has-text("Ответить")',
        'button:has-text("Отправить")',
        'button[type="submit"]',
        '.buttonComponent:has-text("Ответить")',
        'button._color_blue',
    ]
    for sel in submit_selectors:
        try:
            btn = await page.query_selector(sel)
            if btn and await btn.is_visible():
                await btn.click()
                print(f"[OK] Submitted task {task_num}")
                await asyncio.sleep(3)
                return True
        except Exception as e:
            print(f"[DEBUG] Selector {sel} failed: {e}")
            continue

    print(f"[WARN] Could not find submit button for task {task_num}")
    return False

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        page = await context.new_page()

        print("--- OLYMPIUM AUTO UPLOADER ---")

        # Login
        print("Navigating to login...")
        await page.goto("https://olimpium.ru/login", timeout=30000)
        try:
            login_input = await page.query_selector("input[type='text'], input[type='email']")
            if login_input:
                await login_input.fill(EMAIL)
            await page.fill("input[type='password']", PASSWORD)
            await page.keyboard.press("Enter")
            print("[LOGIN] Credentials submitted")
            await asyncio.sleep(5)
        except Exception as e:
            print(f"[WARN] Auto-login issue: {e}")
            print("Please log in manually and press ENTER")
            await asyncio.to_thread(input, "Press Enter after login...")

        # Navigate to start
        print(f"[NAV] Going to {START_URL}")
        await page.goto(START_URL, timeout=60000)
        await page.wait_for_load_state("domcontentloaded")
        await asyncio.sleep(5)
        print(f"[NAV] Current URL: {page.url}")

        task_counter = 1
        visited_stages = set()
        current_url = page.url

        while current_url and task_counter <= 103:
            if current_url in visited_stages:
                print("[STOP] Loop detected")
                break
            visited_stages.add(current_url)

            print(f"\n[STAGE] {current_url}")

            # Wait for page content to load
            print("[WAIT] Waiting for task navigation...")
            try:
                await page.wait_for_selector(".trainerNavigationItemComponent", timeout=15000)
                print("[OK] Task navigation found")
            except Exception as e:
                print(f"[WARN] No task navigation found: {e}")
                await asyncio.sleep(3)

            # Check if there are task navigation items
            nav_items = await page.query_selector_all(".trainerNavigationItemComponent")
            print(f"[INFO] Found {len(nav_items)} nav items")

            if nav_items:
                print(f"[OK] Found {len(nav_items)} tasks")
                for i in range(len(nav_items)):
                    items = await page.query_selector_all(".trainerNavigationItemComponent")
                    if i >= len(items):
                        break
                    try:
                        await items[i].click()
                        await asyncio.sleep(2)
                        success = await upload_for_current_task(page, task_counter)
                        task_counter += 1
                    except Exception as e:
                        print(f"[ERR] Task {task_counter}: {e}")
                        task_counter += 1
            else:
                print("[LECTURE] No tasks on this stage")

            # Navigate to next stage
            print("[NEXT] Looking for next stage button...")
            has_next = await find_and_click_next(page)
            if not has_next:
                print("[END] No more stages")
                break

            # Wait for navigation
            for _ in range(10):
                await asyncio.sleep(1)
                if page.url != current_url:
                    current_url = page.url
                    break
            else:
                print("[WARN] URL did not change, retrying...")
                current_url = page.url

            if len(visited_stages) > 200:
                print("[STOP] Safety limit reached")
                break

        print(f"\n--- DONE ---")
        print(f"Processed {task_counter - 1} tasks")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
