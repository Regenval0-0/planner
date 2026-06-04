import asyncio
import os
from playwright.async_api import async_playwright

# User credentials
EMAIL = "dasha10.vaiman@gmail.com"
PASSWORD = "s174392jfwtfn"

# Starting URL (the stage where you currently are)
START_URL = "https://olimpium.ru/courses/671/stage/23539"

# Output folder
OUTPUT_DIR = "olimpium_automation/tasks"
os.makedirs(OUTPUT_DIR, exist_ok=True)


async def find_next_stage_button(page):
    """
    Tries multiple strategies to find the 'Next Stage' button.
    Returns the element handle if found, else None.
    """
    strategies = [
        # 1. By exact class names observed in HTML
        'button.button._next',
        'button.buttonComponent._next',
        'button[class*="_next"]',
        # 2. Exact text match for common Russian labels (inside buttons/links)
        'button:has-text("Следующий этап")',
        'a:has-text("Следующий этап")',
        'button:has-text("Далее")',
        'a:has-text("Далее")',
        'button:has-text("Следующий урок")',
        'a:has-text("Следующий урок")',
        # 3. Common CSS class fragments
        '[class*="next-stage"]',
        '[class*="courseNavigationNext"]',
        # 4. Links that contain /stage/ in href and look like navigation
        'a[href*="/stage/"]',
    ]

    for selector in strategies:
        try:
            elements = await page.query_selector_all(selector)
            for el in elements:
                if not await el.is_visible():
                    continue
                # Fast path: known next button classes
                if selector in ('button.button._next', 'button.buttonComponent._next', 'button[class*="_next"]'):
                    return el
                text = await el.inner_text()
                text = text.strip().lower()
                href = await el.get_attribute("href") or ""
                if any(k in text for k in ["следующий", "далее", "next", "вперёд"]):
                    return el
                if "/stage/" in href:
                    return el
        except Exception:
            continue
    return None


async def scrape_stage(page, stage_url, task_counter):
    """
    Scrapes tasks from a single stage URL.
    Returns (next_stage_url_or_None, updated_task_counter).
    """
    print(f"\n[SCAN] Navigating to stage: {stage_url}")
    await page.goto(stage_url, timeout=60000)
    await page.wait_for_load_state("domcontentloaded")

    # Wait for the Vue app to render content (loader disappears or task nav appears)
    print("[WAIT] Waiting for page content to load...")
    try:
        await page.wait_for_selector(".trainerNavigationItemComponent", timeout=15000)
    except Exception:
        # If no tasks appear, maybe it's a lecture. Wait a bit more for any nav buttons.
        await asyncio.sleep(3)

    # Check if we got redirected to login
    if "login" in page.url.lower() or "auth" in page.url.lower():
        print("[WARN]  Redirected to login. Session may have expired.")
        return None, task_counter

    # Save stage HTML for debug
    stage_html = await page.content()
    stage_filename = os.path.join(OUTPUT_DIR, f"stage_{task_counter}.html")
    with open(stage_filename, "w", encoding="utf-8") as f:
        f.write(stage_html)

    # Look for task navigation items
    nav_items = await page.query_selector_all(".trainerNavigationItemComponent")

    if nav_items:
        print(f"[OK] Found {len(nav_items)} task(s) on this stage.")

        for i in range(len(nav_items)):
            # Re-query items because DOM may change after clicks
            current_nav_items = await page.query_selector_all(".trainerNavigationItemComponent")
            if i >= len(current_nav_items):
                break

            try:
                print(f"  -> Clicking task {i + 1}/{len(nav_items)} (global #{task_counter})...")
                await current_nav_items[i].click()
                await asyncio.sleep(2)

                content = await page.content()
                filename = os.path.join(OUTPUT_DIR, f"task_{task_counter}.html")
                with open(filename, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"     [SAVED] Saved {filename}")
                task_counter += 1
            except Exception as e:
                print(f"     [ERR] Could not scrape task {i + 1}: {e}")
    else:
        print("[LECTURE] No tasks found on this stage (likely a lecture). Skipping...")

    # --- Navigate to next stage ---
    print("[SCAN] Looking for 'Next Stage' button...")
    next_btn = await find_next_stage_button(page)
    if next_btn:
        href = await next_btn.get_attribute("href")
        if href:
            next_url = href if href.startswith("http") else f"https://olimpium.ru{href}"
            print(f"[NEXT]  Found 'Next Stage' link -> {next_url}")
            return next_url, task_counter
        else:
            # Button without href: click it and catch navigation
            print("[NEXT]  Button has no href. Clicking it...")
            try:
                # Capture current URL to detect change
                old_url = page.url
                await next_btn.click()
                # Wait up to 10s for URL to change
                for _ in range(20):
                    await asyncio.sleep(0.5)
                    if page.url != old_url and "stage" in page.url:
                        print(f"[NEXT]  Navigation detected -> {page.url}")
                        return page.url, task_counter
                print("[WARN]  Clicked but URL did not change. Staying on same page.")
            except Exception as e:
                print(f"[ERR]  Could not click next button: {e}")
    else:
        print("[WARN]  No 'Next Stage' button found.")

    print("[END] End of course or manual navigation needed.")
    return None, task_counter


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        page = await context.new_page()

        print("\n--- OLYMPIUM FULL COURSE SCRAPER ---")

        # Step 1: Log in
        print("Navigating to login page...")
        await page.goto("https://olimpium.ru/login", timeout=30000)

        try:
            login_selector = "input[type='text'], input[type='email'], input[name='username'], input[name='login']"
            await page.wait_for_selector(login_selector, timeout=10000)
            print("Filling credentials...")

            inputs = await page.query_selector_all(login_selector)
            for input_field in inputs:
                placeholder = await input_field.get_attribute("placeholder") or ""
                name = await input_field.get_attribute("name") or ""
                if "email" in placeholder.lower() or "логин" in placeholder.lower() or "login" in name.lower():
                    await input_field.fill(EMAIL)
                    break
            else:
                if inputs:
                    await inputs[0].fill(EMAIL)

            await page.fill("input[type='password']", PASSWORD)
            await page.keyboard.press("Enter")
            print("Login submitted. Waiting for redirect...")
            await asyncio.sleep(3)
        except Exception as e:
            print(f"Auto-login issue: {e}")
            print("Please log in manually in the browser, then press ENTER here.")
            await asyncio.to_thread(input, "👉 Press Enter after manual login...")

        # Step 2: Verify login and start scraping
        if "login" in page.url.lower() or "auth" in page.url.lower():
            print("[ERR] Still on login page. Please complete login manually and press ENTER.")
            await asyncio.to_thread(input, "👉 Press Enter after you are logged in...")

        # Step 3: Loop through stages
        current_url = START_URL
        task_counter = 1
        visited_stages = set()

        while current_url:
            if current_url in visited_stages:
                print(f"[STOP] Already visited {current_url}. Stopping to avoid loop.")
                break
            visited_stages.add(current_url)

            next_url, task_counter = await scrape_stage(page, current_url, task_counter)
            current_url = next_url

            # Safety break: if we've collected an absurd number of stages, stop
            if len(visited_stages) > 200:
                print("[STOP] Safety break: visited over 200 stages. Stopping.")
                break

        print(f"\n--- SCRAPING COMPLETE ---")
        print(f"Total tasks saved: {task_counter - 1}")
        print(f"Stages visited: {len(visited_stages)}")
        print(f"Files are in: {os.path.abspath(OUTPUT_DIR)}")

        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
