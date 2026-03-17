---
paths:
  - "src/**/*.scss"
---

# Styling

Use styling files only for app-specific styles that cannot be expressed by composition alone.

## Hybrid Protocol

- Tailwind owns page layout, spacing, responsive structure, and consumer-side geometry
- SCSS owns materials, complex state styling, and primitive-internal behavior

## Starter Bias

- Prefer no new SCSS when page composition can solve the task
- Never move shadows, blur, glow, or border materials into Tailwind utilities
- Never move page layout into SCSS

## Token Law

- No raw px, hex, rgb, or hsl values
- Use semantic CSS variables and shipped utility tokens only

## Warning

If the file you are editing is under `src/styles/`, read `.claude/rules/read-only-system.md` first.
