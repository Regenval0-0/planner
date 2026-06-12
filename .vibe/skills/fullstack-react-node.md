# Skill: Fullstack React + Node Application Development

## When to Use
Building or modifying features that touch both frontend (React) and backend (Node.js/Express) in the same task.

## Workflow
1. **Design Contract** — Define the Zod schema for the API payload/response first.
2. **Backend Route** — Implement the Express route + service + Prisma query.
3. **Frontend API Hook** — Add the API call wrapper in `src/api/`.
4. **UI Component** — Build the React component using the hook and Tailwind.
5. **Wire Together** — Connect the component to routing/state.

## Patterns
### Zod Shared Schema Pattern
Create `shared/schemas/task.ts`:
```ts
import { z } from 'zod';
export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  completed: z.boolean().default(false),
  createdAt: z.coerce.date(),
});
export type Task = z.infer<typeof TaskSchema>;
```
Import it in both frontend and backend to keep types synchronized.

### API Client Pattern (Frontend)
```ts
import { api } from './client';
import { Task, TaskSchema } from '../../../shared/schemas/task';

export async function getTasks(): Promise<Task[]> {
  const res = await api.get('/tasks');
  return z.array(TaskSchema).parse(res.data);
}
```
Always `.parse()` API responses with Zod.

### Service Layer Pattern (Backend)
```ts
// src/services/taskService.ts
import { prisma } from '../prisma';

export async function listTasks(userId: string) {
  return prisma.task.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
}
```
Routes should be thin; logic lives in services.

## Anti-Patterns
- ❌ Do NOT write SQL queries in controllers.
- ❌ Do NOT call `fetch` directly in components — use the API client.
- ❌ Do NOT share Prisma client types directly to frontend. Use Zod-inferred types.

## Testing Checklist
- [ ] Backend route returns expected shape (Vitest + supertest).
- [ ] Frontend hook handles loading/error states.
- [ ] Zod schema rejects invalid payloads.
- [ ] UI renders empty and error states.
