import { useState, useEffect, useCallback } from 'react';
import Slide from './components/Slide';

const aOpen = '<a>';
const imgTag = '<img />';
const brTag = '<br />';
const fragment = '<>...</>';

const slides = [
  {
    title: 'Обзорный доклад по React.js',
    content: (
      <div className="text-center">
        <p className="text-2xl mb-4">Презентация с устной защитой</p>
        <p className="text-lg text-slate-400">Вайман, Билялова — 2026</p>
        <div className="mt-12 text-slate-500">Нажмите → или пробел для перехода к следующему слайду</div>
      </div>
    ),
  },
  {
    title: 'Содержание',
    content: (
      <ul className="space-y-2 text-lg">
        <li>1. Назначение React. Виртуальный DOM. Императивный и декларативный подходы</li>
        <li>2. Структура проекта (CRA / Vite). Точка входа, процесс сборки, dev и production</li>
        <li>3. Связь JSX и React.createElement. Правила написания. Проблема без фрагмента</li>
        <li>4. Функциональные и классовые компоненты. SRP. Декомпозиция</li>
        <li>5. Однонаправленный поток данных. Пропсы. Деструктуризация</li>
        <li>6. Хук useState. Состояние vs пропсы. Асинхронность. Мутация</li>
        <li>7. Хук useEffect. Массив зависимостей. Cleanup. Бесконечный цикл</li>
        <li>8. Роутинг в SPA. BrowserRouter, Routes, Route. Link vs {aOpen}</li>
        <li>9. Запросы к API. Где выполнять. Состояния loading / data / error</li>
      </ul>
    ),
  },
  {
    title: '1. Назначение React. Виртуальный DOM',
    content: (
      <div className="space-y-4">
        <p>
          <span className="highlight">React</span> — библиотека JavaScript для построения пользовательских интерфейсов.
          Решает проблему сложности управления DOM при частых обновлениях.
        </p>
        <p>
          <span className="highlight">Виртуальный DOM</span> — легковесная копия реального DOM в виде JS-объектов.
          React сравнивает новое дерево со старым через <span className="highlight">реконсиляцию</span> и применяет минимальные изменения.
        </p>
        <div className="bg-slate-800 p-4 rounded-lg">
          <p className="text-sky-300 font-semibold mb-2">Аналогия</p>
          <p>Архитектор вносит правки в макет, сравнивает старый и новый, и только потом меняет реальное здание.</p>
        </div>
        <p>
          <span className="highlight">Императивный подход</span> — «как сделать» (пошаговые инструкции).<br/>
          <span className="highlight">Декларативный подход</span> — «что должно быть» (описание результата).
          React — декларативен.
        </p>
      </div>
    ),
  },
  {
    title: '2. Структура проекта',
    content: (
      <div className="space-y-4">
        <p><span className="highlight">CRA</span> — инструмент от Meta на Webpack. <span className="highlight">Vite</span> — современная альтернатива на ES-модулях и Rollup.</p>
        <p><span className="highlight">Точка входа</span> — index.jsx/main.jsx: импорт ReactDOM, createRoot(), рендер App.</p>
        <p><span className="highlight">div#root</span> — контейнер в index.html, куда React монтирует всё приложение.</p>
        <p className="font-semibold">Dev vs Production:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Dev: карты исходного кода, подробные ошибки, горячая замена модулей</li>
          <li>Production: минификация, удаление неиспользуемого кода, разделение на чанки</li>
        </ul>
      </div>
    ),
  },
  {
    title: '3. JSX и React.createElement',
    content: (
      <div className="space-y-4">
        <p><span className="highlight">JSX</span> — синтаксическое расширение JS, транспилируется в React.createElement().</p>
        <div className="code-block">
          {`<div className="app">Hello</div>\n// транспилируется в:\nReact.createElement("div", { className: "app" }, "Hello")`}
        </div>
        <p className="font-semibold">Правила JSX:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Один корневой элемент</li>
          <li>camelCase атрибуты: className, onClick, htmlFor</li>
          <li>Все теги закрыты: {imgTag}, {brTag}</li>
        </ul>
        <p><span className="highlight">Проблема без фрагмента:</span> функция не может вернуть несколько элементов. Решение — {fragment} (React.Fragment).</p>
      </div>
    ),
  },
  {
    title: '4. Компоненты',
    content: (
      <div className="space-y-4">
        <p><span className="highlight">Компонент</span> — независимый блок интерфейса, принимающий пропсы и возвращающий JSX.</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800 p-4 rounded">
            <p className="font-semibold text-sky-300">Классовые (устаревшие)</p>
            <p>Наследуют React.Component. Имеют render(), this.state, методы жизненного цикла.</p>
          </div>
          <div className="bg-slate-800 p-4 rounded">
            <p className="font-semibold text-sky-300">Функциональные (современные)</p>
            <p>Обычные функции JS + хуки. Стандарт с React 16.8.</p>
          </div>
        </div>
        <p><span className="highlight">SRP</span> — каждый компонент отвечает за одну задачу.</p>
        <p><span className="highlight">Декомпозиция</span> — разбиение монолита на мелкие компоненты.</p>
        <div className="error-box">
          <p className="font-semibold text-red-400">Ошибка</p>
          <p>Не объявляй компонент внутри другого — при каждом рендере создаётся новый тип, DOM пересоздаётся с нуля.</p>
        </div>
      </div>
    ),
  },
  {
    title: '5. Поток данных и пропсы',
    content: (
      <div className="space-y-4">
        <p><span className="highlight">Пропсы</span> — данные от родителя к ребёнку через атрибуты JSX. Только для чтения в дочернем компоненте.</p>
        <p><span className="highlight">Однонаправленный поток:</span> данные текут сверху вниз — от родителя к потомкам. Это делает приложение предсказуемым.</p>
        <div className="code-block">
          {`<Child name="Ivan" age={25} />\n\n// Дочерний:\nconst { name, age } = props;  // деструктуризация\nfunction Button({ text = "Нажми" }) {}  // значение по умолчанию`}
        </div>
        <p><span className="highlight">Подъём состояния:</span> если несколько компонентов разделяют данные — состояние поднимается к общему предку.</p>
      </div>
    ),
  },
  {
    title: '6. Хук useState',
    content: (
      <div className="space-y-4">
        <p><span className="highlight">useState</span> — хук для добавления состояния в функциональные компоненты. Возвращает [значение, установщик].</p>
        <div className="code-block">
          {`const [count, setCount] = useState(0);`}
        </div>
        <p><span className="highlight">Состояние vs пропсы:</span> пропсы — внешние, состояние — внутренние. Состояние изменяется через установщик.</p>
        <p><span className="highlight">Асинхронность:</span> React группирует обновления. Сразу после setCount() значение ещё старое.</p>
        <p><span className="highlight">Функция-обновитель:</span> вместо setCount(count + 1) используйте setCount(prev ={'>'} prev + 1) — гарантия актуальности.</p>
        <div className="error-box">
          <p className="font-semibold text-red-400">Ошибка: прямая мутация</p>
          <p>state.push(item) — плохо. React сравнивает по ссылке. Нужно: setState([...state, item]).</p>
        </div>
      </div>
    ),
  },
  {
    title: '7. Хук useEffect',
    content: (
      <div className="space-y-4">
        <p><span className="highlight">useEffect</span> — хук для побочных эффектов: запросы, подписки, таймеры.</p>
        <p className="font-semibold">Массив зависимостей:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Нет массива — после каждого рендера (редко)</li>
          <li>[] — только при монтировании (загрузка данных)</li>
          <li>[userId] — при монтировании и изменении зависимости</li>
        </ul>
        <p><span className="highlight">Cleanup:</span> функция, которую возвращает эффект. Отменяет подписки, таймеры при размонтировании. Без неё — утечки памяти.</p>
        <div className="error-box">
          <p className="font-semibold text-red-400">Ошибка: бесконечный цикл</p>
          <p>Если внутри useEffect обновляется состояние, которое в deps — эффект запускается снова и снова.</p>
        </div>
      </div>
    ),
  },
  {
    title: '8. Роутинг в SPA',
    content: (
      <div className="space-y-4">
        <p><span className="highlight">SPA</span> — одностраничное приложение. Код загружается один раз, навигация без перезагрузки.</p>
        <p><span className="highlight">Роутинг</span> — сопоставление URL с компонентами. Стандарт: react-router-dom.</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><span className="highlight">BrowserRouter</span> — обёртка через History API</li>
          <li><span className="highlight">Routes</span> — контейнер маршрутов</li>
          <li><span className="highlight">Route</span> — шаблон пути + компонент</li>
        </ul>
        <p><span className="highlight">Link vs {aOpen}:</span> {aOpen} перезагружает страницу. Link меняет URL через History API без перезагрузки.</p>
        <p><span className="highlight">Динамические параметры:</span> /user/:id — доступны через useParams().</p>
        <div className="error-box">
          <p className="font-semibold text-red-400">Ошибка: использование {aOpen} в SPA</p>
          <p>Каждый клик по {aOpen} разрушает состояние и перезагружает приложение.</p>
        </div>
      </div>
    ),
  },
  {
    title: '9. Запросы к API',
    content: (
      <div className="space-y-4">
        <p><span className="highlight">API</span> — интерфейс взаимодействия фронтенда с бэкендом. Формат данных — JSON.</p>
        <p><span className="highlight">Где выполнять:</span> внутри useEffect с пустым массивом []. Запрос — побочный эффект, нельзя в теле компонента.</p>
        <p className="font-semibold">Три состояния:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><span className="text-yellow-400">loading</span> — идёт загрузка, показываем спиннер</li>
          <li><span className="text-emerald-400">data</span> — данные получены, показываем контент</li>
          <li><span className="text-red-400">error</span> — ошибка сети/сервера, показываем сообщение</li>
        </ul>
        <div className="code-block">
          {`useEffect(() => {\n  const fetchData = async () => {\n    try {\n      setLoading(true);\n      const res = await fetch('/api/data');\n      const result = await res.json();\n      setData(result);\n    } catch (err) {\n      setError(err.message);\n    } finally {\n      setLoading(false);\n    }\n  };\n  fetchData();\n}, []);`}
        </div>
      </div>
    ),
  },
  {
    title: 'Спасибо за внимание!',
    content: (
      <div className="text-center space-y-6">
        <p className="text-2xl">Вопросы?</p>
        <div className="text-slate-400">
          <p>React.js — декларативная библиотека для построения интерфейсов</p>
          <p>Основные концепции: компоненты, пропсы, состояние, эффекты, роутинг</p>
        </div>
      </div>
    ),
  },
];

function App() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent(c => Math.min(c + 1, slides.length - 1)), []);
  const prev = useCallback(() => setCurrent(c => Math.max(c - 1, 0)), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, prev]);

  return (
    <div className="w-screen h-screen flex flex-col">
      <Slide
        title={slides[current].title}
        slideNumber={current + 1}
        totalSlides={slides.length}
      >
        {slides[current].content}
      </Slide>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
        <button onClick={prev} disabled={current === 0} className="nav-button">← Назад</button>
        <button onClick={next} disabled={current === slides.length - 1} className="nav-button">Вперёд →</button>
      </div>
    </div>
  );
}

export default App;
