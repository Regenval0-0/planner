# Skill: Accessibility (a11y)

## When to Use
Ensuring the application is usable by everyone, including people using screen readers, keyboard navigation, or assistive technologies.

## Foundations

### Semantic HTML
Use the right element for the job:
- `<button>` for clickable actions (not `<div onClick>`).
- `<a>` for navigation (not `<span>` with `onClick`).
- `<nav>`, `<main>`, `<aside>`, `<section>`, `<article>` for page structure.
- Headings hierarchy: `h1` → `h2` → `h3`, never skip levels.

### Keyboard Navigation
- All interactive elements must be focusable (`tabIndex` only when necessary, native elements are preferred).
- Visible focus rings: `focus-visible:ring-2 focus-visible:ring-primary-500`.
- Escape key closes modals and dropdowns.
- Enter/Space activates buttons.
- Arrow keys navigate within menus, tabs, and lists.

### ARIA Attributes
Use ARIA only when HTML semantics are insufficient:
```tsx
<button aria-label="Close dialog" onClick={onClose}>
  <XIcon /></button>

<div role="alert" aria-live="polite">
  {errorMessage}
</div>

<nav aria-label="Main navigation">
  {/* links */}
</nav>
```

Common roles:
- `role="dialog"` + `aria-modal="true"` for modals.
- `role="alert"` + `aria-live="assertive"` for critical errors.
- `role="status"` + `aria-live="polite"` for success messages.
- `role="tablist"`, `role="tab"`, `role="tabpanel"` for tabs.

### Forms
```tsx
<label htmlFor="email">Email</label>
<input id="email" type="email" aria-required="true" aria-invalid={!!error} aria-describedby={error ? 'email-error' : undefined} />
{error && <span id="email-error" role="alert">{error}</span>}
```

### Images
```tsx
<img src={avatar} alt={`${user.name}'s profile picture`} />
```
- Decorative images: `alt=""` (empty string, not missing).
- Never omit `alt` unless genuinely unknown (rare).

### Color & Contrast
- Minimum contrast ratio: **4.5:1** for normal text, **3:1** for large text.
- Don't rely on color alone to convey meaning. Add icons or text labels.
- Example: error state should have text + red border + icon, not just red border.

## Focus Management

### Focus Trap (Modals)
Keep focus inside modal when open. Return focus to trigger when closed.

### Skip Links
```tsx
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2">
  Skip to main content
</a>
```

## Screen Reader Helpers
```tsx
// Visually hidden but available to screen readers
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```
Tailwind: `sr-only` class included by default.

## Testing Accessibility
- Keyboard-only navigation test.
- Screen reader test (NVDA, JAWS, VoiceOver).
- Automated: `axe-core` (via `@axe-core/react` or Playwright).
- Lighthouse accessibility audit.

## Anti-Patterns
- ❌ `<div onClick>` without `role`, `tabIndex`, and keyboard handler.
- ❌ Missing form labels.
- ❌ Auto-playing media without controls or pause mechanism.
- ❌ Using color alone for error indicators.
- ❌ Focus rings removed without replacement (`outline-none` without `focus-visible`).

## Checklist
- [ ] All images have meaningful `alt` text.
- [ ] All interactive elements are keyboard accessible.
- [ ] Focus order is logical and visible.
- [ ] Forms have associated labels and error announcements.
- [ ] Color contrast meets WCAG AA (4.5:1 for normal text).
- [ ] Page has a single `h1` and logical heading hierarchy.
- [ ] ARIA used only when HTML semantics insufficient.
- [ ] Modals trap focus and return it on close.
