# 📁 database/

**Назначение:** Схемы баз данных, миграции, Docker-конфиги.

---

## Содержимое

| Папка | База | ORM |
|-------|------|-----|
| `planner/` | PostgreSQL | Prisma |

---

## Planner Database

**Путь:** `database/planner/`

### Модели (Prisma schema)
- `User` — пользователи (email, password, verified)
- `Event` — события (title, datetime, color, userId)
- `Task` — задачи (title, completed, deadline, userId)
- `Payment` — платежи (title, amount, date, recurring, userId)

### Команды
```bash
cd database/planner
npx prisma migrate dev    # Новая миграция
npx prisma studio         # GUI просмотр БД
npx prisma generate       # Обновить клиент
```
