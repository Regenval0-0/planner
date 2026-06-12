# Skill: UI/UX Design Principles for Developers

## When to Use
Designing or refining user interfaces, component layouts, navigation, and overall user experience.

## Core Principles

### Visual Hierarchy
- Size: Larger elements attract more attention.
- Color: High contrast draws the eye; use brand colors for CTAs.
- Spacing: Group related items with proximity; separate sections with whitespace.
- Typography: Headings → Subheadings → Body → Captions. Maximum 2 font families per project.

### Layout Patterns
- **F-Pattern**: Users scan top-to-bottom, left-to-right. Place key info along the top and left edges.
- **Z-Pattern**: For minimal pages (landing). Eye moves top-left → top-right → diagonal → bottom-left → bottom-right.
- **Grid System**: Use 12-column grid. Tailwind: `grid grid-cols-12 gap-4`.
- **Container max-width**: `max-w-7xl` (1280px) for content, `max-w-prose` (65ch) for reading text.

### Color Theory
- **60-30-10 Rule**: 60% neutral/background, 30% primary, 10% accent.
- Never rely on color alone to convey meaning (accessibility).
- Use `slate`, `gray`, or `zinc` for neutrals. Avoid pure black (`#000`) — use `slate-950` or `zinc-950`.
- Status colors: `emerald` (success), `amber` (warning), `rose` (error), `blue` (info).

### Typography
- Base size: `16px` (Tailwind default). Never go below `14px` for body text.
- Line height: `leading-relaxed` (1.625) for body, `leading-tight` (1.25) for headings.
- Measure: Keep line length 45–75 characters for readability.
- Tailwind scale: `text-sm` (14), `text-base` (16), `text-lg` (18), `text-xl` (20), `text-2xl` (24), `text-3xl` (30).

### Spacing Scale
- Use Tailwind's 4px base scale (`1 = 4px`).
- Section padding: `py-16` to `py-24`.
- Card internal padding: `p-4` to `p-6`.
- Gap between cards/items: `gap-4` to `gap-6`.

### Navigation & IA
- Keep primary nav to 5–7 items.
- Use breadcrumbs for deep hierarchies (>3 levels).
- Search should be reachable within 1 click on content-heavy apps.
- Mobile: hamburger menu only if >5 primary items. Consider bottom tab bar for mobile apps.

## Common UI Patterns

### Empty States
```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <InboxIcon className="h-12 w-12 text-gray-400" />
  <h3 className="mt-4 text-lg font-semibold text-gray-900">No tasks yet</h3>
  <p className="mt-2 text-sm text-gray-500">Create your first task to get started.</p>
  <Button className="mt-6">Create Task</Button>
</div>
```

### Loading States
- Skeleton screens preferred over spinners for content blocks.
- Inline spinners for buttons and small actions.
- Never show a blank white screen while loading.

### Error States
- Inline validation near the input field.
- Toast notifications for async operation errors.
- Full-page error boundary for crashes.

### Cards
- White background on light gray page (`bg-white` on `bg-gray-50`).
- Subtle border (`border-gray-200`) or shadow (`shadow-sm`).
- Rounded corners (`rounded-lg` or `rounded-xl`).
- Clear title, meta info, and action area separation.

## Anti-Patterns
- ❌ **Clutter**: Too many actions visible at once. Progressive disclosure: hide secondary actions behind menus.
- ❌ **Inconsistent spacing**: Mixing `p-3`, `p-4`, `p-5` arbitrarily. Stick to the scale.
- ❌ **Mystery meat navigation**: Icons without labels (unless universally understood: home, search, settings).
- ❌ **Low contrast text**: Gray on slightly less gray. Minimum 4.5:1 contrast for normal text.
- ❌ **Modal chains**: Opening a modal inside a modal.

## Checklist
- [ ] Visual hierarchy guides the eye to the primary action.
- [ ] Consistent spacing and sizing across all screens.
- [ ] Color used purposefully, not decoratively.
- [ ] Empty states handled gracefully.
- [ ] Mobile layout considered from the start (mobile-first).
