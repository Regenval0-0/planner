# Skill: React + Tailwind Frontend Development

## When to Use
Building UI components, pages, hooks, or state logic in the React frontend.

## Component Template
```tsx
import { useState } from 'react';

interface Props {
  title: string;
  onAction?: () => void;
}

export function Card({ title, onAction }: Props) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {onAction && (
        <button
          onClick={onAction}
          disabled={loading}
          className="mt-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Action'}
        </button>
      )}
    </div>
  );
}
```

## Styling Rules
- Utility-first Tailwind. No CSS-in-JS (styled-components, etc.).
- Use arbitrary values sparingly: `w-[123px]` only when design demands it.
- Dark mode via `dark:` prefix if enabled in Tailwind config.
- Group related classes logically: layout → sizing → spacing → colors → states.

## State Management Decision Tree
| Scenario | Tool |
|----------|------|
| Server data (fetch, cache, mutate) | TanStack Query (React Query) |
| Global UI state (theme, modals) | Zustand or Context |
| Form state | React Hook Form + Zod resolver |
| Local component state | `useState` / `useReducer` |

## Custom Hook Pattern
```ts
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTasks()
      .then(setTasks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { tasks, loading, error };
}
```

## File Structure
```
/src
  /components
    /ui            # Reusable primitives (Button, Input, Modal)
    /layout        # Navbar, Sidebar, Footer
  /pages
    HomePage.tsx
    LoginPage.tsx
  /hooks
    useAuth.ts
    useTasks.ts
  /context
    AuthContext.tsx
  /api
    client.ts
    tasks.ts
```

## Accessibility
- All inputs need associated `<label>`.
- Buttons must be focusable and have visible focus rings.
- Use semantic HTML (`<nav>`, `<main>`, `<section>`).
- Loading states announced via `aria-live` if dynamic.

## Performance
- Lazy load pages: `const CalendarPage = lazy(() => import('./CalendarPage'));`
- Memoize expensive calculations with `useMemo`.
- Memoize callbacks passed to children with `useCallback`.
- Keep bundle size in mind; avoid importing entire libraries.
