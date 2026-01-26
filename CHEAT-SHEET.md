# 📘 Void Energy UI — Developer Cheat Sheet

> **Quick Reference Guide** for developers working with the Void Energy UI design system.

---

## Table of Contents

1. [Architectural Constitution](#1-architectural-constitution)
2. [The Triad (Context Engine)](#2-the-triad-context-engine)
3. [Responsive & Spacing (Density Engine)](#3-responsive--spacing-density-engine)
4. [Component Catalog](#4-component-catalog)
   - [Surfaces](#a-surfaces-the-skin)
   - [Composites](#b-composites-skin--bone)
   - [Overlays](#c-overlays-the-ether)
   - [Gestures](#d-gestures)
   - [Icons](#e-icons)
5. [Mixin Reference](#5-mixin-reference)
6. [Quick Patterns (Copy-Paste)](#6-quick-patterns-copy-paste)

---

## 1. Architectural Constitution

### The Hybrid Protocol (Separation of Concerns)

The Void Energy UI separates **Layout** (Geometry) from **Material** (Physics).

```mermaid
graph LR
    A[HTML/Svelte] -->|Layout| B[Tailwind CSS]
    A -->|Material| C[SCSS Physics]
    B --> D["flex, gap-md, p-lg, w-full"]
    C --> E[".surface-glass, .btn-cta"]
```

#### Rules

| Layer        | Technology | Responsibility            | Examples                                             |
| ------------ | ---------- | ------------------------- | ---------------------------------------------------- |
| **Layout**   | Tailwind   | Geometry, Spacing, Sizing | `flex`, `gap-md`, `p-lg`, `w-full`                   |
| **Material** | SCSS       | Visuals, Physics, States  | `.surface-glass`, `.btn-cta`, `@include glass-float` |

#### ✅ Correct Usage

```svelte
<!-- Layout = Tailwind, Material = SCSS -->
<div class="flex flex-col gap-md p-lg surface-glass">
  <h2 class="text-main">Title</h2>
</div>
```

#### ❌ Incorrect Usage

```scss
/* NEVER put layout rules in SCSS */
.surface-glass {
  width: 300px; /* ❌ Layout bleed */
  margin-bottom: 20px; /* ❌ Layout bleed */
  @include glass-float; /* ✅ OK */
}
```

```svelte
<!-- NEVER put physics rules in inline styles or Tailwind -->
<div style="box-shadow: 0 4px 12px rgba(0,0,0,0.5)">  <!-- ❌ Physics bleed -->
```

---

### The Token Law (No Magic Numbers)

All values must use semantic tokens from [design-tokens.ts](src/config/design-tokens.ts).

#### ✅ Correct Usage

```svelte
<div class="gap-md p-lg">
  <!-- Semantic spacing -->
  <p class="text-main">Content</p>
  <!-- Semantic color -->
</div>
```

```scss
.custom-component {
  padding: var(--space-lg);
  color: var(--text-main);
  border-radius: var(--radius-md);
}
```

#### ❌ Incorrect Usage

```svelte
<div class="gap-[20px] p-[32px]">  <!-- ❌ Magic numbers -->
```

```scss
.custom-component {
  padding: 32px; /* ❌ Magic number */
  color: #ffffff; /* ❌ Hardcoded color */
  border-radius: 8px; /* ❌ Magic number */
}
```

---

### The State Protocol (DOM-Driven State)

State lives in **attributes**, not classes. This ensures CSS transitions trigger correctly via the Physics Engine.

#### ✅ Correct Usage

```svelte
<button data-state="open" aria-pressed="true">Toggle</button>
```

```scss
.dropdown {
  opacity: 0;

  &[data-state='open'] {
    /* ✅ State via attribute */
    opacity: 1;
  }
}
```

#### ❌ Incorrect Usage

```svelte
<button class="active is-open">Toggle</button> <!-- ❌ State via class -->
```

```scss
.dropdown.show {
  /* ❌ State via class */
  opacity: 1;
}
```

---

## 2. The Triad (Context Engine)

The UI is a material that reacts to three environmental variables set on `<html>`.

```mermaid
graph TD
    A[Void Energy UI] --> B[Atmosphere]
    A --> C[Physics]
    A --> D[Mode]
    B --> E[Colors + Fonts]
    C --> F[Texture + Motion + Blur]
    D --> G[Light / Dark]
```

### 1. Atmosphere (The Soul) — `data-atmosphere`

Defines: **Color Palettes** and **Font Families**

| Atmosphere   | Mood                | Fonts          | Primary Color     |
| ------------ | ------------------- | -------------- | ----------------- |
| `void`       | Tech / Sci-Fi       | Hanken Grotesk | Cyan (#33e2e6)    |
| `onyx`       | Stealth / Cinema    | Inter          | White (#ffffff)   |
| `terminal`   | Retro / Hacker      | Courier Prime  | Amber (#f5c518)   |
| `crimson`    | Horror / Aggressive | Merriweather   | Red (#ff6b6b)     |
| `overgrowth` | Nature / Organic    | Lora           | Green (#39ff14)   |
| `velvet`     | Romance / Soft      | Caveat         | Pink (#ff80a0)    |
| `solar`      | Royal / Gold        | Cinzel         | Gold (#ffaa00)    |
| `nebula`     | Synthwave / Mystery | Exo 2          | Magenta (#d946ef) |
| `paper`      | Light / Print       | PT Serif       | Navy (#2c3e50)    |
| `laboratory` | Clinical / Science  | Open Sans      | Blue (#005bb5)    |
| `playground` | Fun / Kids          | Comic Neue     | Pink (#ff4081)    |
| `focus`      | Distraction Free    | Inter          | Black (#000000)   |

**Usage:**

```html
<html data-atmosphere="void"></html>
```

---

### 2. Physics (The Laws) — `data-physics`

Defines: **Motion**, **Blur**, **Texture**

| Physics | Blur | Borders   | Motion                      | Use Cases                |
| ------- | ---- | --------- | --------------------------- | ------------------------ |
| `glass` | 20px | 1px Glow  | Organic (0.3s cubic-bezier) | Premium UI, Modern Apps  |
| `flat`  | 0px  | 1px Solid | Clean (0.2s ease-out)       | Professional, Accessible |
| `retro` | 0px  | 2px Hard  | Instant (0s steps)          | Retro Games, Terminals   |

**Usage:**

```html
<html data-physics="glass"></html>
```

---

### 3. Mode (The Polarity) — `data-mode`

Defines: **Luminosity** and **Contrast** handling

| Mode    | Background  | Text       |
| ------- | ----------- | ---------- |
| `dark`  | Dark tones  | Light text |
| `light` | Light tones | Dark text  |

**Usage:**

```html
<html data-mode="dark"></html>
```

---

### ⚠️ The Law of Immutability (Physics Constraints)

The Void Engine enforces these rules to prevent broken UI states:

| Constraint                         | Correction              | Reason                                     |
| ---------------------------------- | ----------------------- | ------------------------------------------ |
| `physics="glass"` + `mode="light"` | Forces `physics="flat"` | Glass glows require darkness to be visible |
| `physics="retro"` + `mode="light"` | Forces `mode="dark"`    | CRT phosphor effects require black canvas  |

See [THEME-GUIDE.md](./THEME-GUIDE.md) for details.

---

## 3. Responsive & Spacing (Density Engine)

### A. Breakpoints (Layout Only)

Mobile-first approach with 6 breakpoints.

| Prefix          | Min Width | Target Devices   |
| --------------- | --------- | ---------------- |
| `mobile`        | 0px       | Phones           |
| `tablet`        | 768px     | Tablets          |
| `small-desktop` | 1024px    | Laptops          |
| `large-desktop` | 1440px    | Desktops         |
| `full-hd`       | 1920px    | Full HD displays |
| `quad-hd`       | 2560px    | 4K displays      |

**Usage:**

```svelte
<div class="flex-col tablet:flex-row large-desktop:gap-xl">
  <!-- Stacks on mobile, rows on tablet+ -->
</div>
```

---

### B. Spacing Scale (Harmonic & Dense)

All spacing is dynamic and scales based on user density preference (0.75x - 1.25x).

| Token | Base Size (1x) | Formula | Use Cases                   |
| ----- | -------------- | ------- | --------------------------- |
| `xs`  | 8px            | 0.5rem  | Icon gaps, tight padding    |
| `sm`  | 16px           | 1rem    | Button padding, small gaps  |
| `md`  | 24px           | 1.5rem  | Card padding, standard gaps |
| `lg`  | 32px           | 2rem    | Section padding, large gaps |
| `xl`  | 48px           | 3rem    | Page margins, hero spacing  |
| `2xl` | 64px           | 4rem    | Section dividers            |
| `3xl` | 96px           | 6rem    | Layout spacing              |
| `4xl` | 128px          | 8rem    | Hero sections               |
| `5xl` | 160px          | 10rem   | Mega spacing                |

**Usage:**

```svelte
<div class="gap-md p-lg my-xl">
  <!-- Tailwind utilities -->
  <p>Content</p>
</div>
```

```scss
.custom {
  padding: var(--space-lg); /* SCSS variable */
  gap: var(--space-md);
}
```

---

### B.1. Spacing Philosophy & Mathematical Reasoning

#### Why 4px as the Base Unit?

The Void Energy UI uses **4px (0.25rem)** as the foundational unit for all spacing calculations.

**Technical Justification:**

1. **Pixel-Perfect Rendering**
   - All modern displays render in whole pixels
   - 4px aligns perfectly with pixel grids, preventing subpixel antialiasing artifacts
   - Ensures crisp edges on all components across all screen densities

2. **WCAG Compliance**
   - Minimum touch target size: 44px (WCAG 2.1 Level AAA)
   - 44px ÷ 4px = 11 (perfect divisibility, no fractional pixels)
   - All interactive elements built from this base meet accessibility standards

3. **Mathematical Harmony**
   - 4 = 2² (powers of 2 create natural visual rhythm)
   - Enables proportional scaling without rounding errors
   - Aligns with CSS rem system (1rem = 16px = 4 × 4px)

4. **Industry Standard**
   - Used by Material Design (8px grid, but often subdivides to 4px)
   - iOS Human Interface Guidelines (4pt base for spacing)
   - Tailwind CSS (0.25rem = 4px base unit)

---

#### The Dual-Speed Progression

Our spacing scale uses **two different progression strategies** for different use cases:

**🎯 Component Level (xs → lg): Tight Progression**

```
xs:   8px  (×2)  ← Minimal gap
sm:   16px (×4)  ← Doubles from xs
md:   24px (×6)  ← +8px step (optimal card padding)
lg:   32px (×8)  ← Doubles from sm (section padding)
```

**Why tight progression?**

- Fine-grained control for UI components (buttons, cards, inputs)
- Small 8px increments allow precise visual tuning
- Prevents "spacing jumps" that feel unnatural in compact layouts

**📐 Layout Level (xl → 5xl): Accelerated Progression**

```
lg:   32px  (×8)   ← Foundation
xl:   48px  (×12)  ← Golden Ratio jump (32 × 1.5)
2xl:  64px  (×16)  ← Double lg (visual "block")
3xl:  96px  (×24)  ← Triple lg (layout spacing)
4xl:  128px (×32)  ← Quadruple lg (hero sections)
5xl:  160px (×40)  ← Quintuple lg (mega spacing)
```

**Why accelerated progression?**

- Large whitespace areas benefit from dramatic jumps
- Creates clear visual hierarchy between sections
- Prevents too many similar spacing values (reduces decision fatigue)

---

#### The "Magic Numbers" Explained

Each spacing value was chosen for specific ergonomic and mathematical reasons:

| Token   | Value | Why This Exact Number?                                                                                                                                               |
| ------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **xs**  | 8px   | **Minimum comfortable gap** - Smallest spacing that feels intentional, not cramped. Used for icon gaps, chip spacing, tight padding.                                 |
| **sm**  | 16px  | **Industry standard** - 1rem (default font-size). Universal button padding in Material Design, Bootstrap, Tailwind. Most familiar value to developers.               |
| **md**  | 24px  | **Optimal card padding** - 1.5rem. Most popular card padding value across all design systems (Material, Ant Design, Chakra UI). Balances density and breathing room. |
| **lg**  | 32px  | **Typographic baseline** - 2rem. Divisible by 16px (standard font-size). Creates strong visual sections. Foundation for larger spacing values.                       |
| **xl**  | 48px  | **Golden Ratio step** - 32 × 1.5 ≈ 48 (3rem). Classic "large step" in typography. Creates harmonious jump from lg without feeling too aggressive.                    |
| **2xl** | 64px  | **Visual block unit** - 32 × 2 (4rem). Natural doubling from lg. Perfect for section dividers, major layout boundaries.                                              |
| **3xl** | 96px  | **Layout rhythm** - 32 × 3 (6rem). Matches typographic modular scales. Used for separating distinct page sections.                                                   |
| **4xl** | 128px | **Hero spacing** - 32 × 4 (8rem). Dramatic spacing for landing pages, hero sections. Creates strong visual impact.                                                   |
| **5xl** | 160px | **Mega whitespace** - 32 × 5 (10rem). Largest spacing value for expansive hero areas, full-bleed sections.                                                           |

---

#### Density Engine: Dynamic Scaling

All spacing values **multiply by a density factor** to respect user preferences:

```scss
// Implementation in /src/styles/base/_reset.scss
:root {
  --unit: 0.25rem; // 4px base
  --density: 1; // Default (user-configurable: 0.75 / 1 / 1.25)

  // Example: md spacing
  --space-md: calc(6 * var(--unit) * var(--density, 1));
  //               ↑     ↑            ↑
  //            24px   4px         scaling factor
}
```

**Density Factors:**

| Setting                | Factor | md Example | Use Case                                         |
| ---------------------- | ------ | ---------- | ------------------------------------------------ |
| **High** (Compact)     | 0.75x  | 18px       | Power users, dense information displays          |
| **Standard** (Default) | 1x     | 24px       | Balanced spacing for most users                  |
| **Low** (Relaxed)      | 1.25x  | 30px       | Accessibility, motor disabilities, large screens |

**Accessibility Benefits:**

- ✅ **Motor disabilities**: Larger spacing = easier touch/click targets
- ✅ **Visual disabilities**: More breathing room improves scannability
- ✅ **Cognitive disabilities**: Consistent spacing reduces cognitive load

**Implementation:**

- User sets preference via UI (`voidEngine.setDensity('low')`)
- CSS variable `--density` updates globally
- All components automatically reflow (no code changes needed)
- Proportions remain consistent (ratio between xs/sm/md/lg stays identical)

---

#### Alignment with Tailwind CSS

Our spacing scale is **100% compatible** with Tailwind CSS:

| Void Energy         | Tailwind          | Value | Notes                   |
| ------------------- | ----------------- | ----- | ----------------------- |
| `gap-xs` / `p-xs`   | `gap-2` / `p-2`   | 8px   | Tailwind's `2` = 0.5rem |
| `gap-sm` / `p-sm`   | `gap-4` / `p-4`   | 16px  | Tailwind's `4` = 1rem   |
| `gap-md` / `p-md`   | `gap-6` / `p-6`   | 24px  | Tailwind's `6` = 1.5rem |
| `gap-lg` / `p-lg`   | `gap-8` / `p-8`   | 32px  | Tailwind's `8` = 2rem   |
| `gap-xl` / `p-xl`   | `gap-12` / `p-12` | 48px  | Tailwind's `12` = 3rem  |
| `gap-2xl` / `p-2xl` | `gap-16` / `p-16` | 64px  | Tailwind's `16` = 4rem  |
| `gap-3xl` / `p-3xl` | `gap-24` / `p-24` | 96px  | Tailwind's `24` = 6rem  |

**Why this alignment matters:**

- ✅ Developers familiar with Tailwind can transfer knowledge instantly
- ✅ Easy integration with Tailwind utilities (we use Tailwind for layout)
- ✅ Large ecosystem of examples, tutorials, and best practices
- ✅ Reduces learning curve for new contributors

---

#### Quick Reference: When to Use Each Value

| Spacing          | Common Use Cases                                          | Visual Weight    |
| ---------------- | --------------------------------------------------------- | ---------------- |
| **xs** (8px)     | Icon gaps, chip spacing, tight list items, compact tables | Minimal          |
| **sm** (16px)    | Button padding, input padding, small card gaps            | Light            |
| **md** (24px)    | Card padding, modal padding, standard gaps                | Medium (Default) |
| **lg** (32px)    | Section padding, container padding, large gaps            | Strong           |
| **xl** (48px)    | Page margins, hero padding, dramatic gaps                 | Very Strong      |
| **2xl** (64px)   | Section dividers, major layout boundaries                 | Dramatic         |
| **3xl+** (96px+) | Hero sections, landing pages, full-bleed content          | Mega             |

---

#### Examples

**Compact Button (sm padding):**

```svelte
<button class="btn p-sm">Click Me</button>
<!-- 16px padding = comfortable but not wasteful -->
```

**Standard Card (md padding):**

```svelte
<div class="surface-glass p-md">
  <h3>Card Title</h3>
  <p>Card content with optimal 24px breathing room.</p>
</div>
```

**Hero Section (xl+ padding):**

```svelte
<section class="py-4xl px-xl">
  <h1>Welcome to Void Energy</h1>
  <!-- Vertical: 128px, Horizontal: 48px = Dramatic impact -->
</section>
```

---

**📚 Related Documentation:**

- **Implementation**: [/src/styles/base/\_reset.scss:9-79](../src/styles/base/_reset.scss) (Density Engine)
- **Token Definitions**: [/src/config/design-tokens.ts:20-66](../src/config/design-tokens.ts) (Spacing scale)
- **Tailwind Integration**: [/tailwind.config.mjs](../tailwind.config.mjs) (Spacing utilities)

---

## 4. Component Catalog

### A. Surfaces (The Skin)

Base surface classes for applying physics.

#### `.surface-glass`

**Description:** Static floating glass (Cards, containers)
**Physics:** Blur, subtle shadow, border glow
**Interactive:** No hover effects

**Usage:**

```svelte
<div class="surface-glass p-lg">
  <p>Static card content</p>
</div>
```

---

#### `.surface-glass-action`

**Description:** Interactive glass (Clickable cards, buttons)
**Physics:** Blur, shadow, border glow
**Interactive:** Lifts on hover, border brightens

**Usage:**

```svelte
<a href="/detail" class="surface-glass-action p-md">
  <h3>Click Me</h3>
</a>
```

---

#### `.surface-sunk`

**Description:** Recessed depth (Inputs, wells, sidebars)
**Physics:** Inset shadow, carved appearance
**Interactive:** Focus ring on `:focus-visible`

**Usage:**

```svelte
<input class="surface-sunk p-sm" type="text" />
```

---

#### `.surface-void`

**Description:** Opaque canvas (Modals, masking overlays)
**Physics:** Solid background, no blur
**Interactive:** None

**Usage:**

```svelte
<div class="surface-void">
  <p>Opaque background</p>
</div>
```

---

### B. Composites (Skin + Bone)

Preset components with built-in layout and physics.

#### `.btn` / `.btn-cta`

**Description:** Interactive buttons with physics states
**`.btn`:** Standard button
**`.btn-cta`:** Call-to-action with rotating gradient border (Gemini Laser)

**Usage:**

```svelte
<button class="btn">Standard Button</button>
<button class="btn-cta">Call to Action</button>
```

---

#### `.dropzone`

**Description:** Dashed sunk surface for file inputs
**Physics:** Dashed border, recessed appearance
**Interactive:** Border brightens on hover

**Usage:**

```svelte
<div class="dropzone flex-center">
  <p>Drop files here</p>
</div>
```

---

#### `.chip`

**Description:** Data chips (Premium, System, Success variants)
**Variants:** `.chip-premium`, `.chip-system`, `.chip-success`

**Usage:**

```svelte
<span class="chip chip-premium">Premium</span>
<span class="chip chip-system">System</span>
<span class="chip chip-success">Active</span>
```

---

### C. Overlays (The Ether)

Floating UI elements with special positioning.

#### `.void-tooltip`

**Description:** Headless floating capsule (Use with Floating UI)
**Physics:** Small surface, high z-index
**Positioning:** Managed by Floating UI library

**Usage:**

```svelte
<div class="void-tooltip" role="tooltip">Tooltip content</div>
```

See [tooltip.ts](src/actions/tooltip.ts) for Svelte action.

---

#### `.toast-message`

**Description:** Notification capsule (Success, Error, Info)
**Variants:** `.toast-success`, `.toast-error`, `.toast-info`
**Physics:** Slides in from edge, auto-dismisses

**Usage:**

```svelte
<div class="toast-message toast-success">
  <p>Success!</p>
</div>
```

See [toast.svelte.ts](src/stores/toast.svelte.ts) for state management.

---

#### `dialog[data-size="..."]`

**Description:** Native modal with materialize animation
**Sizes:** `sm`, `md`, `lg`, `xl`
**Physics:** Fade + scale animation

**Usage:**

```html
<dialog data-size="md" data-state="closed">
  <div class="flex flex-col gap-lg p-xl">
    <h2>Modal Title</h2>
    <p>Modal content</p>
    <button class="btn-cta">Confirm</button>
  </div>
</dialog>
```

See [modal-manager.svelte.ts](src/lib/modal-manager.svelte.ts) for programmatic control.

---

### D. Gestures

Touch and pointer-based interaction components.

#### `<PullRefresh>` (Pull-to-Refresh)

**Description:** Touch/wheel gesture to trigger data refresh
**Location:** [src/components/ui/PullRefresh.svelte](src/components/ui/PullRefresh.svelte)

**Props:**

| Prop        | Type                       | Default | Description                   |
| ----------- | -------------------------- | ------- | ----------------------------- |
| `children`  | `Snippet`                  | req     | Content to wrap               |
| `onrefresh` | `() => Promise<void>`      | req     | Async refresh callback        |
| `onerror`   | `(error: unknown) => void` | —       | Error handler                 |
| `threshold` | `number`                   | `48`    | Pull distance (px) to trigger |
| `disabled`  | `boolean`                  | `false` | Disable gesture               |

**States:** `idle` → `pulling` → `threshold` → `refreshing` → `done`/`error` → `idle`

**Usage:**

```svelte
<PullRefresh onrefresh={handleRefresh} onerror={handleError}>
  <main class="feed-container">
    <!-- Feed content -->
  </main>
</PullRefresh>
```

**Handler Example (Redis Cache Invalidation):**

```typescript
async function handleRefresh() {
  await api.getData({ refresh: true }); // Invalidates Redis cache
}
```

**Architecture Notes:**

| Decision                                 | Rationale                                                                                                   |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Selective PTR**                        | Only on pages where "refresh" has semantic meaning (feeds, dashboards). No global fallback.                 |
| **Global `overscroll-behavior-y: none`** | Set on `html` in [\_reset.scss:107](src/styles/base/_reset.scss). Disables native browser PTR app-wide.     |
| **No reload fallback**                   | PTR = "invalidate cache + refetch." A generic page reload would dilute this semantic and destroy SPA state. |
| **Industry pattern**                     | Twitter, Instagram, Discord: PTR on feeds, nothing on settings/profile pages. Users adapt.                  |

**Interaction Model:**

- **Touch:** Pull down → release at threshold → triggers refresh
- **Wheel:** Scroll up at top → instant trigger when threshold crossed
- **Haptic:** Vibration pulse at threshold crossing (touch only)

**Physics:**

- Rubber-band resistance: `2.0` (pull distance / resistance)
- Activation threshold: `6px` (prevents accidental triggers)
- Cooldown: `500ms` between refreshes

---

### E. Icons

All icons are in `src/components/icons/`. Two strict categories exist (see README.md Rule #6):

#### Button Icons (`Btn*.svelte`)

Interactive wrappers with `onclick`, `state`, `text`, `disabled` props.

| Icon | Description | States |
| :--- | :--- | :--- |
| `BtnDoor` | Sign in/out with label | `inside` / `outside` |

**Usage:**

```svelte
<BtnDoor state="outside" text="Sign In" onclick={handleAuth} />
```

---

#### Pure Icons (`Name.svelte`)

SVG elements only. Use `HTMLAttributes<SVGElement>` spread pattern.

**Status Icons:**

| Icon | Description | Animated |
| :--- | :--- | :--- |
| `Checkmark` | Success indicator | — |
| `XMark` | Error/close | — |
| `Warning` | Alert triangle | — |
| `Info` | Information circle | — |
| `SpinLoader` | Loading spinner | Yes |

**Navigation/UI Icons:**

| Icon | Description | Animated |
| :--- | :--- | :--- |
| `Home` | Home/dashboard | — |
| `Burger` | Hamburger menu | Yes (transforms to X via `data-state="active"`) |
| `Search` | Search/magnifier | Yes (rotates via `data-state="active"`) |

**Theme Icons:**

| Icon | Description | Animated |
| :--- | :--- | :--- |
| `Sun` | Light mode | — |
| `Moon` | Dark mode | — |

**Brand Icons:**

| Icon | Description | Animated |
| :--- | :--- | :--- |
| `Logo` | CoNexus logo | — |
| `Quill` | Writing/author | — |
| `Dream` | Dream mode | — |

**Usage:**

```svelte
<!-- Basic -->
<Checkmark />

<!-- With size -->
<SpinLoader data-size="lg" />

<!-- With custom class -->
<Warning class="text-error" />

<!-- All SVG attributes supported -->
<Info aria-label="More information" onclick={showHelp} />
```

**Sizing via `data-size`:**

| Value | Font Size |
| :--- | :--- |
| `sm` | `--font-size-caption` |
| `lg` | `--font-size-h5` |
| `xl` | `--font-size-h4` |
| `2xl` | `--font-size-h3` |
| `3xl` | `--font-size-h2` |
| `4xl` | `--font-size-h1` |

---

## 5. Mixin Reference

### Surface Mixins

#### `@include glass-float($interactive: false)`

**Purpose:** Floating surface physics (Cards, Modals)
**Context:** Positive Z-Index, floats above the void
**Parameter:** `$interactive` — Set to `true` for clickable elements (lifts on hover)

**Features:**

- Background with blur (if supported)
- Border with physics-driven color
- Box shadow (floats or lifts)
- Smooth transitions

**Usage:**

```scss
.my-card {
  @include glass-float(); // Static card
}

.my-button {
  @include glass-float(true); // Interactive (hover lift)
}
```

---

#### `@include glass-sunk`

**Purpose:** Recessed surface physics (Inputs, Wells)
**Context:** Negative Z-Index, carved into the canvas
**Auto-features:** Focus ring on `:focus-visible`

**Features:**

- Background with sink color
- Inset shadow
- Border color from theme
- Focus state with energy-primary

**Usage:**

```scss
.my-input {
  @include glass-sunk;
}
```

---

#### `@include gemini-laser`

**Purpose:** Rotating gradient border (CTA buttons)
**Visual:** Creates animated rainbow border via `::before` pseudo-element

**Features:**

- Animated conic gradient
- Rotation on hover
- Works with transparent backgrounds

**Usage:**

```scss
.btn-cta {
  @include gemini-laser;
}
```

---

#### `@include text-truncate($lines)`

**Purpose:** Clamp text to N lines with ellipsis
**Parameter:** `$lines` — Number of visible lines

**Usage:**

```scss
.card-description {
  @include text-truncate(3); // Max 3 lines
}
```

---

### State Mixins

#### `@include state-active { ... }`

**Targets:** `[aria-pressed="true"]`, `[data-state="active"]`
**Use for:** Toggle buttons, active tabs

**Usage:**

```scss
.my-toggle {
  background: var(--bg-surface);

  @include state-active {
    background: var(--energy-primary);
  }
}
```

---

#### `@include state-open { ... }`

**Targets:** `[data-state="open"]`
**Use for:** Dropdowns, accordions, expanded panels

**Usage:**

```scss
.my-dropdown {
  opacity: 0;
  max-height: 0;

  @include state-open {
    opacity: 1;
    max-height: 500px;
  }
}
```

---

### Typography Mixins

#### `@include typography('scale-name')`

**Scales:** `caption`, `small`, `body`, `h5`, `h4`, `h3`, `h2`, `h1`
**Auto-applies:** font-size (fluid with clamp), line-height, font-weight

**Usage:**

```scss
h2 {
  @include typography('h2');
}

.small-text {
  @include typography('caption');
}
```

---

## 6. Quick Patterns (Copy-Paste)

### A. Standard Page Layout

```svelte
<div class="container flex flex-col gap-md">
  <h1>Page Title</h1>
  <p>Content...</p>
</div>
```

---

### B. Static Glass Card

```svelte
<div class="surface-glass flex flex-col gap-md p-lg">
  <h2 class="text-main">Card Title</h2>
  <p class="text-dim">Description text here.</p>
</div>
```

---

### C. Interactive Glass Card (Clickable)

```svelte
<a href="/detail" class="surface-glass-action flex flex-col gap-sm p-md">
  <h3 class="text-main">Click Me</h3>
  <span class="text-mute">Hover for lift effect</span>
</a>
```

---

### D. Form Input (Sunk Surface)

```svelte
<input
  type="text"
  class="w-full p-sm surface-sunk text-main"
  placeholder="Enter text..."
/>
```

---

### E. CTA Button with Laser Border

```svelte
<button class="btn-cta px-lg py-md">
  <span>Take Action</span>
</button>
```

---

### F. Modal Dialog

```html
<dialog data-size="md" data-state="closed">
  <div class="flex flex-col gap-lg p-xl">
    <h2>Modal Title</h2>
    <p>Content here</p>
    <div class="flex gap-md">
      <button class="btn">Cancel</button>
      <button class="btn-cta">Confirm</button>
    </div>
  </div>
</dialog>
```

---

### G. Truncated Text Card

```svelte
<div class="surface-glass p-md flex flex-col gap-sm">
  <h4 class="text-main">Article Title</h4>
  <p class="text-dim truncate-3-lines">
    Long description that will be clamped to 3 lines with an ellipsis at the
    end...
  </p>
</div>
```

```scss
.truncate-3-lines {
  @include text-truncate(3);
}
```

---

### H. Toast Notification (Programmatic)

```typescript
import { toast } from '@stores/toast.svelte';

// Basic toasts (auto-dismiss after 4s)
toast.show('Operation completed!', 'success');
toast.show('Something went wrong.', 'error');
toast.show('FYI: System update available.', 'info');
toast.show('Careful here!', 'warning');

// Loading toast with controller (persists until resolved)
const loader = toast.loading('Processing...');
loader.update('Step 2 of 3...'); // Update message
loader.success('Done!'); // Transition to success
// or: loader.error('Failed!');
// or: loader.close();                  // Close without transition

// Promise wrapper (automatic loading → success/error)
await toast.promise(fetchData(), {
  loading: 'Fetching data...',
  success: 'Data loaded!',
  error: 'Failed to load data',
});

// With dynamic messages
await toast.promise(saveItems(items), {
  loading: 'Saving...',
  success: (result) => `Saved ${result.count} items`,
  error: (err) => `Error: ${err.message}`,
});
```

---

### I. Grid Layout with Responsive Columns

```svelte
<div
  class="grid grid-cols-1 tablet:grid-cols-2 large-desktop:grid-cols-3 gap-md"
>
  <div class="surface-glass p-md">Item 1</div>
  <div class="surface-glass p-md">Item 2</div>
  <div class="surface-glass p-md">Item 3</div>
</div>
```

---

## 📚 Related Documentation

- **[THEME-GUIDE.md](./THEME-GUIDE.md)** — How to create custom themes
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — Contribution guidelines
- **[README.md](./README.md)** — Project overview and architecture

---

## 🛠️ Source Files

- **Tokens:** [src/config/design-tokens.ts](src/config/design-tokens.ts)
- **Global Styles:** [src/styles/global.scss](src/styles/global.scss)
- **Mixins:** [src/styles/abstracts/\_mixins.scss](src/styles/abstracts/_mixins.scss)
- **Components:** [src/styles/components/](src/styles/components/)
