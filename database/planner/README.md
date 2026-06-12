# 📁 database/planner/

**Назначение:** Схема базы данных для приложения «Персональный планировщик».

---

## База данных

**Тип:** PostgreSQL  
**ORM:** Prisma

---

## Модели

### User
```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String?
  verified  Boolean  @default(false)
  events    Event[]
  tasks     Task[]
  payments  Payment[]
}
```

### Event
```prisma
model Event {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  datetime    DateTime
  color       String   @default("blue")
  userId      Int
  user        User     @relation(fields: [userId], references: [id])
}
```

### Task
```prisma
model Task {
  id        Int      @id @default(autoincrement())
  title     String
  completed Boolean  @default(false)
  deadline  DateTime?
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
}
```

### Payment
```prisma
model Payment {
  id        Int      @id @default(autoincrement())
  title     String
  amount    Float
  date      DateTime
  recurring Boolean  @default(false)
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
}
```

---

## Команды

```bash
npx prisma migrate dev     # Новая миграция
npx prisma studio          # GUI просмотр
npx prisma generate        # Обновить клиент
npx prisma db seed         # Заполнить тестовыми данными
```
