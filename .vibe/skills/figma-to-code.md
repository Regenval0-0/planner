# Skill: Figma to Code Workflow

## When to Use
Translating UI designs from Figma into React/Tailwind components efficiently and accurately.

## Workflow
1. **Inspect in Figma**
   - Open Dev Mode (Shift + D).
   - Select frames/components and copy CSS properties.
   - Note exact colors, spacing, font sizes, border-radius.

2. **Export Assets**
   - Icons: Export as SVG. Use a React icon library (Lucide, Heroicons) when possible instead of custom SVGs.
   - Images: Export as PNG/WebP at 2x for retina.
   - Place assets in `public/` or `src/assets/`.

3. **Structure Mapping**
   - Figma Frame → React Component or Page.
   - Figma Auto Layout → Flexbox (`flex`, `flex-col`, `gap-*`).
   - Figma Constraints → Responsive behavior (`w-full`, `max-w-*`, `md:flex-row`).

4. **Code Generation**
   - Use Figma's Tailwind CSS export plugin (or manual mapping).
   - Never copy-paste absolute pixel values blindly. Map to Tailwind scale.

## Mapping Figma to Tailwind

| Figma Property | Tailwind Class |
|----------------|----------------|
| Auto Layout Vertical | `flex flex-col` |
| Auto Layout Horizontal | `flex flex-row` |
| Gap 8px | `gap-2` |
| Gap 16px | `gap-4` |
| Padding 16px | `p-4` |
| Left align | `items-start` |
| Center align | `items-center justify-center` |
| Hug contents | `w-auto` or inline-block |
| Fill container | `w-full` |
| Fixed width 320px | `w-80` (if close) or `w-[320px]` |
| Corner radius 8px | `rounded-lg` |
| Corner radius 999 | `rounded-full` |
| Shadow style | `shadow-sm`, `shadow-md`, `shadow-lg` |
| Text 14px Regular | `text-sm font-normal` |
| Text 16px Medium | `text-base font-medium` |
| Text 24px Bold | `text-2xl font-bold` |

## Color Extraction
Figma hex colors → Tailwind closest match or custom token.

```
#F8FAFC → slate-50
#E2E8F0 → slate-200
#94A3B8 → slate-400
#0F172A → slate-900
#3B82F6 → blue-500 (primary candidate)
```

If exact brand colors don't match Tailwell palette, add them to `tailwind.config.js` theme.extend.colors.

## Component Breakdown Strategy
For a complex Figma screen:
1. Identify reusable elements (buttons, inputs, cards, avatars).
2. Build primitives first.
3. Compose layout components (header, sidebar, main content).
4. Assemble the page last.

## Automation Tools
- **Figma → Tailwind**: Plugins like "Tailwind CSS" or "Windy".
- **Figma → React**: Anima, Locofy, or CVA (Class Variance Authority) for variant-heavy components.
- **SVG → React**: Use `npx @svgr/cli` to convert SVGs to React components.

## Quality Checklist
- [ ] Colors match Figma exactly (or intentionally mapped to tokens).
- [ ] Spacing follows Tailwind scale (no random pixel values).
- [ ] Typography weights and sizes match design.
- [ ] Interactive states (hover, active, disabled) implemented.
- [ ] Responsive behavior specified if Figma has mobile frames.
- [ ] Icons crisp on retina (SVG preferred).
- [ ] No layout shift on load (fixed heights or aspect ratios for images).
