import asyncio
import os
import json
import sys
from playwright.async_api import async_playwright

EMAIL = "dasha10.vaiman@gmail.com"
PASSWORD = "s174392jfwtfn"
URL = sys.argv[1] if len(sys.argv) > 1 else "https://olimpium.ru/courses/671/stage/23557"
OUTPUT = "quiz_extracted.json"

async def login(page):
    print("[AUTH] Логин...")
    await page.goto("https://olimpium.ru/login", timeout=30000)
    await asyncio.sleep(2)
    try:
        await page.fill("input[type='text'], input[type='email']", EMAIL)
        await page.fill("input[type='password']", PASSWORD)
        await page.keyboard.press("Enter")
        await asyncio.sleep(5)
    except Exception as e:
        print(f"[AUTH] Ручной вход: {e}")
        await asyncio.sleep(20)

async def extract_questions(page):
    print("[SCAN] Ищу вопросы...")
    # Подождём, пока Vue отрисует
    await asyncio.sleep(4)

    # Попробуем найти блоки вопросов через JS
    result = await page.evaluate('''() => {
        const questions = [];
        // Ищем все radio/checkbox на странице
        const allInputs = Array.from(document.querySelectorAll('input[type="radio"], input[type="checkbox"]'));

        // Группируем по имени
        const byName = {};
        allInputs.forEach(inp => {
            const name = inp.name || 'unnamed';
            if (!byName[name]) byName[name] = [];

            // Найдём текст варианта
            let text = '';
            const label = inp.closest('label');
            if (label) {
                const clone = label.cloneNode(true);
                const inpInClone = clone.querySelector('input');
                if (inpInClone) inpInClone.remove();
                text = clone.innerText.trim();
            } else {
                const parent = inp.parentElement;
                if (parent) {
                    const clone = parent.cloneNode(true);
                    const inpInClone = clone.querySelector('input');
                    if (inpInClone) inpInClone.remove();
                    text = clone.innerText.trim();
                }
            }
            byName[name].push({
                type: inp.type,
                value: inp.value,
                id: inp.id,
                text: text.substring(0, 500)
            });
        });

        Object.entries(byName).forEach(([name, opts]) => {
            // Уникальные по тексту
            const seen = new Set();
            const unique = [];
            opts.forEach(o => {
                if (!seen.has(o.text)) {
                    seen.add(o.text);
                    unique.push(o);
                }
            });
            if (unique.length > 1) {
                // Попробуем найти текст вопроса
                const first = allInputs.find(i => i.name === name);
                let questionText = '';
                if (first) {
                    const container = first.closest('.question, .task, [class*="question"], [class*="task"], li, .trainerNavigationItemComponent');
                    if (container) {
                        const qEl = container.querySelector('h3, h4, h5, p, .question-text, [class*="question"]');
                        if (qEl) questionText = qEl.innerText.trim().substring(0, 500);
                    }
                    // Если не нашли текст вопроса — возьмём текст родителя без вариантов
                    if (!questionText) {
                        const parent = first.closest('div, li, fieldset');
                        if (parent) {
                            const clone = parent.cloneNode(true);
                            const allInputsInClone = clone.querySelectorAll('input[type="radio"], input[type="checkbox"]');
                            allInputsInClone.forEach(i => {
                                const lbl = i.closest('label');
                                if (lbl) lbl.remove();
                                else i.remove();
                            });
                            questionText = clone.innerText.trim().substring(0, 500);
                        }
                    }
                }
                questions.push({
                    name: name,
                    question: questionText,
                    multiple: unique.some(o => o.type === 'checkbox'),
                    options: unique.map((o, idx) => ({ num: idx + 1, text: o.text, id: o.id, value: o.value, type: o.type }))
                });
            }
        });

        return questions;
    }''')
    return result

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={'width': 1400, 'height': 900})
        page = await context.new_page()

        print(f"[URL] {URL}")
        await login(page)

        await page.goto(URL, timeout=60000)
        await page.wait_for_load_state("domcontentloaded")
        await asyncio.sleep(5)
        print(f"[PAGE] Загружена: {page.url}")

        questions = await extract_questions(page)

        if not questions:
            print("[WARN] Вопросы не найдены. Возможно, это обычное задание.")
            await asyncio.sleep(60)
            return

        data = { "url": page.url, "questions": questions }
        with open(OUTPUT, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"\n[OK] Найдено {len(questions)} вопрос(ов).\n")
        for i, q in enumerate(questions):
            q_type = "[Несколько вариантов]" if q['multiple'] else "[Один вариант]"
            print(f"--- Вопрос {i+1} {q_type} ---")
            print(q.get('question', '').replace('\n', ' '))
            for opt in q['options']:
                print(f"  {opt['num']}. {opt['text'].replace(chr(10), ' ')}")
            print()

        print(f"[SAVE] Сохранено в {OUTPUT}")
        print("[WAIT] Браузер оставлен открытым. Введи ответы здесь в формате: 1=2, 2=1,3")
        print("Для закрытия нажми Ctrl+C в этом окне.")

        # Бесконечное ожидание, чтобы браузер не закрылся
        while True:
            await asyncio.sleep(10)

if __name__ == "__main__":
    asyncio.run(main())
