# Skill: Zod Validation & Schema Design

## When to Use
Validating API payloads, forms, environment variables, or any external data boundary.

## Why Zod
- Single source of truth for runtime validation + static types.
- Works identically on frontend and backend.
- Great error messages out of the box.

## Patterns
### Request Body Schema
```ts
import { z } from 'zod';

export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  dueDate: z.coerce.date().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
```

### Form Integration (React Hook Form)
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateTaskSchema } from '../schemas/task';

function TaskForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(CreateTaskSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <span>{errors.title.message}</span>}
    </form>
  );
}
```

### Environment Variables
```ts
import { z } from 'zod';

const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = EnvSchema.parse(process.env);
```

### Parsing API Responses
```ts
const res = await fetch('/api/tasks');
const json = await res.json();
const tasks = z.array(TaskSchema).parse(json.data);
```

## Error Handling
```ts
const result = schema.safeParse(data);
if (!result.success) {
  console.error(result.error.flatten().fieldErrors);
  // Return 400 with structured errors
}
```

## Refinement & Custom Checks
```ts
const PasswordSchema = z.string().min(8).refine((val) => /[A-Z]/.test(val), {
  message: 'Must contain at least one uppercase letter',
});
```

## Checklist
- [ ] Schema covers all required fields.
- [ ] Optional fields marked with `.optional()` or `.default()`.
- [ ] Types exported for reuse.
- [ ] `.parse()` or `.safeParse()` called before using data.
