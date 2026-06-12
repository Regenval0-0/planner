# Skill: Prisma + PostgreSQL Database Management

## When to Use
Any task involving schema design, migrations, queries, or data modeling.

## Commands
```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create a migration
npx prisma migrate dev --name add_user_profile

# Reset dev database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Seed database
npx tsx prisma/seed.ts

# Validate schema
npx prisma validate
```

## Schema Design Rules
1. Use `cuid()` or `uuid()` for IDs, not auto-increment integers in public-facing tables.
2. Always add `createdAt` and `updatedAt` timestamps.
3. Use enums for fields with a closed set of values: `role Role @default(USER)`.
4. Index fields used in `where`, `orderBy`, and relation lookups.
5. Use `@map` and `@@map` to keep PostgreSQL naming snake_case.

## Example Model
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  tasks     Task[]
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
}

enum Role {
  USER
  ADMIN
}
```

## Query Patterns
### Fetch with Relations
```ts
prisma.user.findUnique({
  where: { id },
  include: { tasks: { orderBy: { createdAt: 'desc' } } },
});
```

### Transaction
```ts
await prisma.$transaction([
  prisma.task.create({ data: { ... } }),
  prisma.user.update({ where: { id }, data: { taskCount: { increment: 1 } } }),
]);
```

### Upsert
```ts
prisma.user.upsert({
  where: { email },
  update: { name },
  create: { email, name },
});
```

## Seeding
Place seed data in `prisma/seed.ts` and run it via `npx tsx prisma/seed.ts`.

## Migrations Checklist
- [ ] Schema validates (`prisma validate`).
- [ ] Migration name is descriptive.
- [ ] Migration is committed to git.
- [ ] `.env.example` updated if new env vars needed.
