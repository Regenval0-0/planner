# 📁 frontend/

**Назначение:** Клиентские React-приложения.

---

## Содержимое

| Папка | Проект | Стек | Статус |
|-------|--------|------|--------|
| `planner/` | Planner App | React 19, Vite, Tailwind CSS, React Router | 🔥 Активный |
| `bpoo-site/` | BPOO Redesign | React 19, Vite, Tailwind CSS | 🔥 Активный |

---

## Planner Frontend

**Путь:** `frontend/planner/`

### Стек
- React 19.2
- Vite 6
- Tailwind CSS 4
- React Router 7
- Axios
- Electron (desktop build)

### Запуск
```bash
cd frontend/planner
npm install
npm run dev        # localhost:5173
npm run electron:dev  # desktop mode
```

### Структура
```
frontend/planner/
├── src/
│   ├── pages/           # CalendarPage, LoginPage, RegisterPage...
│   ├── components/      # UI компоненты
│   ├── context/         # AuthContext
│   ├── api/             # client.ts
│   └── main.tsx         # Точка входа
├── electron/            # Desktop build
├── public/
└── vite.config.ts
```

---

## BPOO Site

**Путь:** `frontend/bpoo-site/`

Redesign сайта колледжа БПОО. React + Tailwind.

```bash
cd frontend/bpoo-site
npm install
npm run dev
```
