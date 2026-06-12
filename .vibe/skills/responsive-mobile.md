# Skill: Responsive & Mobile-First Development

## When to Use
Ensuring the application works and looks great on all screen sizes: mobile, tablet, desktop.

## Philosophy: Mobile-First
Write base styles for mobile. Use `md:`, `lg:`, `xl:` to enhance for larger screens.

```tsx
// Mobile-first example
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
```

## Breakpoints (Tailwind defaults)
| Name | Min Width | CSS |
|------|-----------|-----|
| `sm` | 640px | `@media (min-width: 640px)` |
| `md` | 768px | `@media (min-width: 768px)` |
| `lg` | 1024px | `@media (min-width: 1024px)` |
| `xl` | 1280px | `@media (min-width: 1280px)` |
| `2xl` | 1536px | `@media (min-width: 1536px)` |

## Layout Patterns

### Sidebar Layout
```tsx
<div className="flex flex-col md:flex-row">
  <aside className="w-full md:w-64 lg:w-72">
    {/* Sidebar */}
  </aside>
  <main className="flex-1">
    {/* Content */}
  </main>
</div>
```

### Card Grid
```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {items.map((item) => (
    <Card key={item.id} data={item} />
  ))}
</div>
```

### Navigation
```tsx
<nav className="hidden md:flex">{/* Desktop nav */}</nav>
<nav className="flex md:hidden">{/* Mobile hamburger or bottom bar */}</nav>
```

## Touch Targets
- Minimum touch target size: **44×44px** (Apple) or **48×48dp** (Material).
- Tailwind: `min-h-11` (44px) or `min-h-12` (48px) for buttons and links on mobile.
- Add padding around small icons to increase hit area without visual bloat.

## Typography Scaling
```tsx
<h1 className="text-2xl font-bold md:text-3xl lg:text-4xl">
<h2 className="text-xl font-semibold md:text-2xl">
<p className="text-sm md:text-base">
```

## Images & Media
```tsx
<img
  src={src}
  className="h-auto w-full object-cover"
  loading="lazy"
  alt="Description"
/>
```
- Always set `width` and `height` attributes to prevent layout shift.
- Use `srcset` or responsive image components for art direction.

## Tables on Mobile
Options:
1. **Horizontal scroll**: `overflow-x-auto` with `min-w-full` table.
2. **Card transformation**: Convert table rows to stacked cards on mobile.
3. **Priority columns**: Hide less important columns on small screens.

```tsx
<div className="overflow-x-auto">
  <table className="min-w-full">
    {/* ... */}
  </table>
</div>
```

## Viewport Meta Tag
Ensure `index.html` has:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

## Testing
- Use browser DevTools device emulation.
- Test actual devices when possible.
- Check touch interactions (hover doesn't exist on touch).
- Verify font sizes don't trigger iOS zoom on inputs (`text-base` minimum).

## Common Pitfalls
- ❌ Using `hover:` for critical actions (no hover on touch).
- ❌ Fixed widths (`w-96`) without responsive overrides.
- ❌ Horizontal overflow caused by unbreakable text (`break-words` or `overflow-wrap: break-word`).
- ❌ Touch targets too small.
- ❌ Images without dimensions causing CLS.

## Checklist
- [ ] Base styles target mobile.
- [ ] Breakpoints used to enhance for larger screens.
- [ ] Touch targets ≥ 44px.
- [ ] Navigation adapted for mobile (hamburger or bottom bar).
- [ ] Tables handle narrow viewports.
- [ ] Images responsive with proper aspect ratios.
- [ ] No horizontal scroll on any screen size.
