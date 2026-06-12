import asyncio
import os
from playwright.async_api import async_playwright

EMAIL = "dasha10.vaiman@gmail.com"
PASSWORD = "s174392jfwtfn"
START_URL = "https://olimpium.ru/courses/671/stage/23539"

async def login(page):
    print("[AUTH] Переход на страницу входа...")
    await page.goto("https://olimpium.ru/login", timeout=30000)
    await asyncio.sleep(2)
    try:
        await page.fill("input[type='text'], input[type='email']", EMAIL)
        await page.fill("input[type='password']", PASSWORD)
        await page.keyboard.press("Enter")
        print("[AUTH] Данные отправлены. Ожидание редиректа...")
        await asyncio.sleep(5)
    except Exception as e:
        print(f"[AUTH WARN] {e}")
        print("Войди вручную в открывшемся браузере.")
        await asyncio.to_thread(input, "Нажми ENTER после входа...")

async def find_next_stage_button(page):
    selectors = [
        'button.button._next',
        'button.buttonComponent._next',
        'button[class*="_next"]',
        'button:has-text("Следующий этап")',
        'a:has-text("Следующий этап")',
        'button:has-text("Далее")',
        'a:has-text("Далее")',
    ]
    for sel in selectors:
        try:
            btn = await page.query_selector(sel)
            if btn and await btn.is_visible():
                return btn
        except:
            continue
    return None

async def extract_questions(page):
    """Извлекает вопросы с вариантами (radio/checkbox) со страницы."""
    questions = []

    groups = await page.evaluate('''() => {
        const inputs = Array.from(document.querySelectorAll('input[type="radio"], input[type="checkbox"]'));
        const map = {};
        inputs.forEach(el => {
            // Группируем по name или по ближайшему родителю-вопросу
            const container = el.closest('.question, .task, [class*="question"], [class*="answer"], [class*="option"], li, label');
            let groupKey = el.name || '';
            if (!groupKey && container) {
                groupKey = container.getAttribute('data-id') || container.className || 'group_' + Math.random();
            }
            if (!groupKey) groupKey = 'unknown';

            if (!map[groupKey]) map[groupKey] = [];

            let text = '';
            // Пробуем найти текст варианта
            const label = el.closest('label');
            if (label) {
                // Клонируем, убираем input, берем текст
                const clone = label.cloneNode(true);
                const inp = clone.querySelector('input');
                if (inp) inp.remove();
                text = clone.innerText.trim();
            } else {
                const parent = el.parentElement;
                if (parent) {
                    const clone = parent.cloneNode(true);
                    const inp = clone.querySelector('input');
                    if (inp) inp.remove();
                    text = clone.innerText.trim();
                }
            }
            map[groupKey].push({type: el.type, value: el.value, id: el.id, text: text.substring(0,300)});
        });
        return Object.entries(map).map(([name, options]) => ({name, options}));
    }''')

    for g in groups:
        opts = g['options']
        if len(opts) > 1:
            # Убираем дубликаты текста
            seen = set()
            unique = []
            for o in opts:
                if o['text'] not in seen:
                    seen.add(o['text'])
                    unique.append(o)
            questions.append({
                'name': g['name'],
                'options': unique,
                'multiple': any(o['type'] == 'checkbox' for o in unique)
            })

    return questions

async def solve_quiz(page):
    print("\n[QUIZ] Сканирую вопросы с вариантами ответов...")
    questions = await extract_questions(page)

    if not questions:
        print("[QUIZ] Вопросы с вариантами не найдены на этой странице.")
        return False

    print(f"\n[QUIZ] Найдено {len(questions)} вопрос(а/ов).\n")

    for i, q in enumerate(questions):
        q_type = "Несколько вариантов" if q['multiple'] else "Один вариант"
        print(f"--- Вопрос {i+1} ({q_type}) ---")
        for j, opt in enumerate(q['options']):
            text = opt['text'].replace('\n', ' ')
            print(f"  {j+1}. {text}")
        print()

    print("Введи ответы в формате: номер_вопроса=номер_варианта(ов)")
    print("Примеры: 1=2   или   1=1,3   или   1=2, 2=1")
    print("Для пропуска введи: skip")
    try:
        raw = await asyncio.to_thread(input, "Ответы: ")
    except EOFError:
        return False

    raw = raw.strip()
    if raw.lower() == 'skip':
        return False

    # Парсим ответы
    answers = {}
    # Убираем пробелы, разбиваем по запятой или точке с запятой
    parts = raw.replace(';', ',').split(',')
    for part in parts:
        part = part.strip()
        if '=' in part:
            q_num_str, opts_str = part.split('=', 1)
            try:
                q_num = int(q_num_str.strip())
                opts = [int(x.strip()) for x in opts_str.split(',') if x.strip().isdigit()]
                if q_num not in answers:
                    answers[q_num] = []
                answers[q_num].extend(opts)
            except ValueError:
                continue

    # Кликаем по вариантам
    for q_num, opts in answers.items():
        if q_num < 1 or q_num > len(questions):
            print(f"[WARN] Нет вопроса №{q_num}")
            continue
        q = questions[q_num - 1]
        for opt_num in opts:
            if opt_num < 1 or opt_num > len(q['options']):
                print(f"[WARN] Нет варианта №{opt_num} в вопросе №{q_num}")
                continue
            opt = q['options'][opt_num - 1]
            selector = None
            if opt.get('id'):
                selector = f'#{opt["id"]}'
            else:
                # Ищем по value и type
                q_type_sel = 'checkbox' if q['multiple'] else 'radio'
                selector = f'input[type="{q_type_sel}"][value="{opt["value"]}"]'
            try:
                el = await page.query_selector(selector)
                if el:
                    await el.scroll_into_view_if_needed()
                    await el.click()
                    print(f"[OK] Выбран вариант {opt_num} в вопросе {q_num}")
                    await asyncio.sleep(0.3)
                else:
                    # Fallback: click label text
                    labels = await page.query_selector_all('label')
                    for lab in labels:
                        text = await lab.inner_text()
                        if opt['text'] in text:
                            await lab.click()
                            print(f"[OK] Выбран (через label) вариант {opt_num} в вопросе {q_num}")
                            break
            except Exception as e:
                print(f"[ERR] Не удалось кликнуть: {e}")

    # Ищем кнопку отправки
    submit_selectors = [
        'button:has-text("Ответить")',
        'button:has-text("Отправить")',
        'button[type="submit"]',
        'button:has-text("Проверить")',
        'button:has-text("Сохранить")',
        'button[class*="submit"]',
    ]
    for sel in submit_selectors:
        try:
            btn = await page.query_selector(sel)
            if btn and await btn.is_visible():
                await btn.click()
                print("[QUIZ] Ответ отправлен!")
                await asyncio.sleep(4)
                return True
        except:
            continue
    print("[QUIZ] Кнопка отправки не найдена. Ответы выбраны, отправь вручную.")
    return True

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={'width': 1400, 'height': 900})
        page = await context.new_page()

        print("=" * 50)
        print("  АССИСТЕНТ ТЕСТОВ ОЛИМПИУМ")
        print("=" * 50)

        await login(page)

        print(f"\n[NAV] Переход на стартовый URL: {START_URL}")
        await page.goto(START_URL, timeout=60000)
        await page.wait_for_load_state("domcontentloaded")
        await asyncio.sleep(5)
        print(f"[NAV] Текущая страница: {page.url}")

        print("\n[ИНФО] Если нужен другой этап — перейди вручную в браузере.")
        print("Скрипт автоматически найдет вопросы с вариантами.\n")

        visited = set()
        while True:
            current = page.url
            if current in visited:
                print("[STOP] Обнаружен цикл. Остановка.")
                break
            visited.add(current)

            print(f"\n{'='*50}")
            print(f"[STAGE] {current}")

            had_quiz = await solve_quiz(page)

            if not had_quiz:
                print("[INFO] Здесь нет теста. Ищу кнопку 'Следующий этап'...")
                next_btn = await find_next_stage_button(page)
                if next_btn:
                    await next_btn.click()
                    print("[NEXT] Переход...")
                    await asyncio.sleep(5)
                else:
                    print("[END] Кнопка 'Следующий этап' не найдена. Конец курса или перейди вручную.")
                    break
            else:
                await asyncio.sleep(3)
                next_btn = await find_next_stage_button(page)
                if next_btn:
                    print("[NEXT] Переход к следующему этапу...")
                    await next_btn.click()
                    await asyncio.sleep(5)
                else:
                    print("[INFO] Кнопка 'Далее' не найдена после теста. Проверь страницу.")
                    break

            if len(visited) > 300:
                print("[STOP] Лимит безопасности.")
                break

        print("\n[Done] Работа ассистента завершена.")
        await asyncio.to_thread(input, "Нажми ENTER, чтобы закрыть браузер...")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
