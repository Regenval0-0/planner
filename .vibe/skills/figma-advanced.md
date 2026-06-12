# Skill: Advanced Figma for Developers

## When to Use
Deep work with Figma files: extracting design tokens, understanding component systems, preparing handoff, or reverse-engineering existing designs into code.

## Dev Mode Deep Dive
- Toggle Dev Mode with `Shift + D`.
- Select any layer to see:
  - **CSS** properties (copiable).
  - **Measurements** to neighboring elements (`Option/Alt + hover`).
  - **Assets** panel for exported images/icons.
  - **Variables** (Design Tokens) in the right sidebar.

## Figma Structure for Developers

### Pages Organization
| Page | Purpose |
|------|---------|
| 🎨 **Cover** | Project thumbnail and description. |
| 🧩 **Design System** | Colors, typography, effects, grid styles, icons. |
| 🧱 **Components** | Reusable components and variants. |
| 📱 **Mobile** | Mobile screens. |
| 💻 **Desktop** | Desktop screens. |
| 🔄 **Flows** | Prototype connections and user journeys. |
| 🗑 **Archive** | Old iterations. |

### Components & Variants
- **Component** = reusable UI element (like a React component).
- **Variant** = states of a component (like props).
- Structure: `Component Name / State / Size`
  - Example: `Button / Primary / Default`, `Button / Primary / Hover`, `Button / Primary / Disabled`.
- In Dev Mode, inspect the variant properties panel to understand all possible states.

### Auto Layout
The core layout engine in Figma. Map to CSS Flexbox:

| Auto Layout | CSS Equivalent |
|-------------|---------------|
| Direction: Vertical | `flex-direction: column` |
| Direction: Horizontal | `flex-direction: row` |
| Hug contents | `width: auto` / `height: auto` |
| Fill container | `flex: 1` / `width: 100%` |
| Fixed width | `width: 123px` |
| Spacing between items | `gap: 16px` |
| Padding | `padding: 16px` |
| Alignment (Top-Left) | `align-items: flex-start` |
| Alignment (Center) | `align-items: center; justify-content: center` |

**Nested Auto Layout** = nested Flexbox containers. Every frame with Auto Layout becomes a `div` with `display: flex`.

### Constraints
Define how elements behave when their parent resizes:
- **Left/Top** → Fixed position relative to left/top edges.
- **Right/Bottom** → Fixed position relative to right/bottom edges.
- **Left & Right** → `width: 100%` (stretches).
- **Top & Bottom** → `height: 100%`.
- **Scale** → Scales proportionally (useful for background images).
- **Center** → `margin: auto` / `align-self: center`.

## Design Tokens (Variables)
Figma Variables = source of truth for design tokens.

### Token Types
- **Color** → CSS variables / Tailwind colors.
- **Number** → Spacing, sizing, border-radius.
- **String** → Font families.
- **Boolean** → Toggle states (less common).

### Exporting Tokens
1. Use Figma API or plugins:
   - **Tokens Studio** → exports JSON tokens.
   - **Style Dictionary** → transforms tokens to CSS/Tailwind/SCSS.
2. Example token JSON:
```json
{
  "color": {
    "primary": {
      "500": { "value": "#3b82f6", "type": "color" },
      "600": { "value": "#2563eb", "type": "color" }
    }
  },
  "spacing": {
    "md": { "value": "16px", "type": "spacing" }
  }
}
```
3. Convert to Tailwind config using Style Dictionary or manually.

## Inspecting Like a Pro

### Measurements
- `Option/Alt + hover` over an element → distances to siblings/parent.
- Click while holding to pin measurements.

### Copy Properties
- Copy single CSS property (e.g., `background: #fff`).
- Copy all CSS for selected layer.
- Copy SVG code for icons (paste directly into React component).

### Inspect Typography
- Font family → install if needed, or map to closest web-safe / Google Font.
- Font size → map to Tailwind scale (`text-sm`, `text-base`).
- Line height → map to Tailwind (`leading-relaxed`).
- Letter spacing → map to Tailwind (`tracking-wide`).

### Inspect Effects
- **Drop Shadow** → Tailwind `shadow-md` or custom `box-shadow`.
- **Inner Shadow** → not directly in Tailwind, use arbitrary value or custom CSS.
- **Layer Blur** → `backdrop-blur-sm` (on parent) or `filter: blur(8px)`.

## Plugins for Developers

| Plugin | Purpose |
|--------|---------|
| **Tailwind CSS** | Copy Tailwind classes directly from Figma layers. |
| **Figma to Code** | Generates React/Vue/HTML from frames. |
| **HTML to Figma** | Reverse: import existing web pages into Figma. |
| **Tokens Studio** | Manage and export design tokens. |
| **Color Contrast** | Check WCAG contrast ratios. |
| **Content Reel** | Populate designs with realistic data. |

## Best Practices for Handoff
1. **Lock published components** — developers shouldn't accidentally edit the design system.
2. **Use consistent naming** — component names should match code component names.
3. **Document spacing scale** — list the spacing values used (4px, 8px, 16px, etc.).
4. **Mark exportable assets** — set export settings on icons/images.
5. **Provide mobile frames** — always design for mobile, not just desktop.
6. **Annotate interactions** — use prototype connections or sticky notes for complex flows.

## Reverse Engineering Checklist
When receiving a Figma file without documentation:
- [ ] Identify the design system page and extract tokens.
- [ ] List all components and their variants.
- [ ] Map Auto Layout frames to Flexbox structure.
- [ ] Note responsive behavior (constraints, breakpoints).
- [ ] Extract all exportable assets (icons, images).
- [ ] Check for interactive states (hover, active, disabled).
- [ ] Verify accessibility (contrast, touch targets).
