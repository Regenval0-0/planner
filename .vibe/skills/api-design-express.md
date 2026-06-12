# Skill: REST API Design with Express

## When to Use
Creating or modifying backend API endpoints.

## Route Structure
```
/src
  /routes
    auth.ts      # POST /auth/login, POST /auth/register
    tasks.ts     # CRUD for tasks
    users.ts     # User management
  /services
    authService.ts
    taskService.ts
  /middleware
    auth.ts      # JWT verification
    error.ts     # Global error handler
    validate.ts  # Zod request validation
```

## Endpoint Conventions
- Use plural nouns: `/tasks`, not `/task`.
- Version prefix optional for now: `/api/v1/tasks`.
- HTTP verbs: GET (list/read), POST (create), PATCH (partial update), DELETE (remove).
- Query params for filtering/sorting: `?completed=true&sort=createdAt:desc`.

## Response Envelope
Always return a consistent shape:
```ts
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: { page: number; total: number };
}
```

Example:
```ts
res.json({ success: true, data: tasks });
// or
res.status(400).json({ success: false, error: 'Invalid input' });
```

## Error Handling
Use an async wrapper to catch errors:
```ts
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```
Central error middleware maps errors to status codes (Zod → 400, Prisma P2002 → 409, etc.).

## Auth Middleware Pattern
```ts
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
}
```

## Validation Middleware Pattern
```ts
export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error.flatten() });
    }
    req.body = result.data;
    next();
  };
}
```

## Checklist for New Routes
- [ ] Zod schema for request body/params.
- [ ] Service function for business logic.
- [ ] Route handler using async wrapper.
- [ ] Added to main router in `server.ts`.
- [ ] Tested with curl / Vitest / Playwright.
