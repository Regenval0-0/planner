# Skill: Animations & Micro-Interactions

## When to Use
Adding polish to UI through motion: page transitions, feedback on actions, loading states, micro-interactions.

## Principles
- **Purposeful**: Every animation should guide attention or provide feedback.
- **Fast**: Most UI animations should be 150–300ms.
- **Smooth**: Use `ease-out` for elements entering, `ease-in` for leaving, `ease-in-out` for loops.
- **Respect preferences**: Honor `prefers-reduced-motion`.

## Tailwind Transitions
```tsx
<button className="transition-all duration-200 ease-out hover:scale-105 active:scale-95">
```

Common properties to transition:
- `colors` — background, border, text color.
- `opacity` — fade in/out.
- `transform` — scale, translate, rotate.
- `shadow` — elevation changes.

## Utility Patterns

### Button Press
```tsx
<button className="transform transition-transform active:scale-95">
  Click me
</button>
```

### Hover Lift (Card)
```tsx
<div className="transition-shadow duration-200 hover:shadow-lg">
```

### Fade In
```tsx
<div className="animate-fade-in">
  {/* Content */}
</div>
```

With custom animation in Tailwind config:
```js
animation: {
  'fade-in': 'fadeIn 0.3s ease-out',
},
keyframes: {
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
},
```

## Framer Motion (Recommended for React)
Install: `npm install framer-motion`

### Animate Presence (mount/unmount)
```tsx
import { AnimatePresence, motion } from 'framer-motion';

<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      Dropdown content
    </motion.div>
  )}
</AnimatePresence>
```

### Staggered List
```tsx
<motion.ul
  initial="hidden"
  animate="visible"
  variants={{
    visible: { transition: { staggerChildren: 0.05 } },
  }}
>
  {items.map((item) => (
    <motion.li
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

### Page Transitions
```tsx
<motion.div
  key={pathname}
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -20 }}
  transition={{ duration: 0.25 }}
>
  <Outlet />
</motion.div>
```

### Layout Animations
```tsx
<motion.div layout className="rounded-lg bg-white p-4 shadow">
  {/* Content changes size smoothly */}
</motion.div>
```

## Skeleton Loading
```tsx
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
  );
}

// Usage
<div className="space-y-3">
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
  <Skeleton className="h-32 w-full" />
</div>
```

## Reduced Motion
```tsx
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// In Framer Motion
<motion.div
  initial={prefersReduced ? false : { opacity: 0 }}
  animate={{ opacity: 1 }}
/>
```

## Loading Spinners
```tsx
<div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
```

## Checklist
- [ ] Animations are fast (< 300ms for UI feedback).
- [ ] `prefers-reduced-motion` respected.
- [ ] No layout thrashing (animate `transform` and `opacity` only when possible).
- [ ] Loading states animated smoothly.
- [ ] Modal/dropdown enter/exit animations implemented.
- [ ] List items stagger in when appearing.
