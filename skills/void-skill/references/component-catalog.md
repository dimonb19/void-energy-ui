# Component Catalog

> Generated from `src/config/component-registry.json`. Do not hand-edit. Edit the registry and run `npm run build:skill`.

Every shipped Void Energy primitive, action, utility, controller singleton, container pattern, layout, and physics-participation attribute. Each entry lists import path, props/args, slots, when-to-use, and a starting example.

## Categories

- **field:** `search-field`, `edit-field`, `generate-field`, `password-field`, `color-field`, `copy-field`, `slider-field`, `toggle`, `switcher`, `selector`, `combobox`, `drop-zone`, `edit-textarea`, `generate-textarea`, `media-scrubber`, `media-slider`
- **form:** `form-field`, `password-meter`, `password-checklist`
- **action:** `action-button`, `icon-button`, `themes-button`, `profile-button`
- **overlay:** `dropdown`
- **nav:** `tabs`, `pagination`, `load-more`, `breadcrumbs`, `sidebar`
- **layout:** `settings-row`
- **interaction:** `pull-refresh`
- **feedback:** `skeleton`, `image`, `adaptive-image`, `avatar`, `video`, `markdown`
- **chart:** `progress-ring`, `sparkline`, `stat-card`, `donut-chart`, `line-chart`, `bar-chart`
- **theme:** `atmosphere-scope`, `theme-builder`, `liquid-glass-filter`

## Components

### action

#### ActionBtn `action-button`

Button with an animated icon and optional text label. Icon animates on hover/focus. Use for primary actions like generate, save, or confirm.

- **Import:** `import ActionBtn from '@components/ui/ActionBtn.svelte';`
- **Category:** action
- **Variants:** btn-cta, btn-premium, btn-system, btn-success, btn-error, btn-ghost, btn-loud
- **Props:** `icon`, `text`, `class`, `size`, `disabled`, `...rest:button`
- **Prop types:**
  - `icon`: `Component`
  - `text`: `string`
  - `size`: `string`
  - `disabled`: `boolean`
- **Related:** `icon-button`, `button-native`

**When to use.** Use when you need a styled button with an animated icon and optional label. Prefer this over hand-rolled <button><Icon />Label</button> markup for generate, retry, confirm, undo, and auth actions. Variant classes go on class.

**Example:**

```svelte
<ActionBtn icon={Sparkle} text='Generate' class='btn-cta' onclick={generate} />
```

#### IconBtn `icon-button`

Compact icon-only button for toolbars and inline actions. Icon animates on hover. Always provide an aria-label.

- **Import:** `import IconBtn from '@components/ui/IconBtn.svelte';`
- **Category:** action
- **Variants:** btn-icon
- **Props:** `icon`, `size`, `iconProps`, `class`, `disabled`, `...rest:button`
- **Prop types:**
  - `icon`: `Component`
  - `size`: `string`
  - `iconProps`: `Record<string, unknown>`
  - `disabled`: `boolean`
- **Related:** `action-button`, `themes-button`, `profile-button`

**When to use.** Use for toolbar or inline icon actions. iconProps can override hover-driven data-state for toggles and timers.

**Example:**

```svelte
<IconBtn icon={Undo} aria-label='Reset' onclick={reset} />
```

#### ProfileBtn `profile-button`

Circular avatar button showing the user's photo or role-based fallback. Reads auth state from the user store automatically. Composes <Avatar size='xs'> for the auth-state badge and <Profile> icon for the unauthenticated state.

- **Import:** `import ProfileBtn from '@components/ui/ProfileBtn.svelte';`
- **Category:** action
- **Props:** `size`, `class`, `...rest:button`
- **Related:** `avatar`, `dropdown`, `icon-button`, `themes-button`

**When to use.** Usually use as a Dropdown trigger. It reads auth state from the user store and switches between an Avatar (image or role-letter initials) and the Profile silhouette icon automatically. The auth-state Avatar is pinned to 24px (--space-md); the silhouette icon's data-size is controlled by the size prop (default 'xl').

**Example:**

```svelte
<ProfileBtn onclick={toggleMenu} aria-expanded={menuOpen} />
```

#### ThemesBtn `themes-button`

Button that opens the themes modal. Can render as a full button with label or as a compact icon-only variant.

- **Import:** `import ThemesBtn from '@components/ui/ThemesBtn.svelte';`
- **Category:** action
- **Props:** `icon`, `size`, `class`
- **Related:** `dropdown`, `modal`, `profile-button`

**When to use.** Opens the themes modal via modal.themes(). Use icon={true} to render the btn-icon variant.

**Example:**

```svelte
<ThemesBtn class='btn-cta' />
```

### chart

#### BarChart `bar-chart`

SVG bar chart with axes, grid, tooltips, optional value labels, and reference lines. Supports vertical/horizontal orientation, grouped (clustered) bars, entry animations, legend, and accessible data table.

- **Import:** `import BarChart from '@components/ui/BarChart.svelte';`
- **Category:** chart
- **Props:** `data`, `groups`, `orientation`, `height`, `showValues`, `showGrid`, `formatValue`, `showLegend`, `referenceLines`, `onselect`, `xLabel`, `yLabel`, `animated`, `title`, `id`, `class`
- **Prop types:**
  - `data`: `ChartDataPoint[]`
  - `groups`: `BarChartGroup[]`
  - `orientation`: `'vertical' | 'horizontal'`
  - `formatValue`: `(value: number) => string`
  - `referenceLines`: `ChartReferenceLine[]`
  - `onselect`: `(item: ChartDataPoint, index: number) => void`
- **Related:** `line-chart`, `donut-chart`, `stat-card`

**When to use.** Use data for simple bars or groups for clustered bars. Negative values are not supported.

**Example:**

```svelte
<BarChart data={quarterlyRevenue} showValues />
```

#### DonutChart `donut-chart`

Ring chart with clickable segments (keyboard + mouse), optional center metric, legend, tooltips, and series color theming. Segments animate on mount and highlight on hover. Includes accessible data table.

- **Import:** `import DonutChart from '@components/ui/DonutChart.svelte';`
- **Category:** chart
- **Props:** `data`, `centerMetric`, `showLegend`, `size`, `maxSize`, `thickness`, `formatValue`, `onselect`, `animated`, `title`, `id`, `class`
- **Prop types:**
  - `data`: `ChartDataPoint[]`
  - `centerMetric`: `DonutCenterMetric`
  - `formatValue`: `(value: number) => string`
  - `onselect`: `(item: ChartDataPoint, index: number) => void`
- **Related:** `progress-ring`, `stat-card`, `bar-chart`

**When to use.** Use for share or distribution views. Pair with a surrounding surface-raised card.

**Example:**

```svelte
<DonutChart data={trafficSources} centerMetric={{ label: 'Total', value: '1,250' }} />
```

#### LineChart `line-chart`

SVG line chart with axes, grid, tooltips, and optional fill area. Supports single/multi-series data, reference lines, smooth Catmull-Rom curves, data point dots, entry animations, legend, and accessible data table.

- **Import:** `import LineChart from '@components/ui/LineChart.svelte';`
- **Category:** chart
- **Props:** `data`, `series`, `height`, `filled`, `showDots`, `showGrid`, `smooth`, `showLegend`, `formatValue`, `referenceLines`, `onselect`, `xLabel`, `yLabel`, `animated`, `title`, `id`, `class`
- **Prop types:**
  - `data`: `LineChartPoint[]`
  - `series`: `LineChartSeries[]`
  - `formatValue`: `(value: number) => string`
  - `referenceLines`: `ChartReferenceLine[]`
  - `onselect`: `(item: LineChartPoint, index: number) => void`
- **Related:** `sparkline`, `bar-chart`, `donut-chart`

**When to use.** Use data for a single series or series for multi-series. All series must share labels in the same order.

**Example:**

```svelte
<LineChart data={revenueSeries} filled showDots />
```

#### ProgressRing `progress-ring`

Circular SVG progress indicator with optional center value label. Themed via series color channels. Animates on mount.

- **Import:** `import ProgressRing from '@components/ui/ProgressRing.svelte';`
- **Category:** chart
- **Variants:** sm, md, lg, xl
- **Props:** `value`, `max`, `scale`, `thickness`, `series`, `showValue`, `formatValue`, `animated`, `label`, `id`, `class`
- **Related:** `donut-chart`, `stat-card`

**When to use.** Use for single-metric progress. series maps to themed color channels.

**Example:**

```svelte
<ProgressRing value={75} showValue scale='lg' />
```

#### Sparkline `sparkline`

Tiny inline SVG line chart showing trend shape without axes or labels. Optional fill area beneath the line. Use inside stat cards or table rows.

- **Import:** `import Sparkline from '@components/ui/Sparkline.svelte';`
- **Category:** chart
- **Props:** `data`, `width`, `height`, `series`, `filled`, `fluid`, `label`, `id`, `animated`, `class`
- **Related:** `stat-card`, `line-chart`

**When to use.** Use inside stat cards, tables, or list rows when you only need trend shape and not full axes.

**Example:**

```svelte
<Sparkline data={weeklyTrend} filled series={2} />
```

#### StatCard `stat-card`

KPI card showing label, large value, color-coded trend arrow (up/down/flat), delta percentage, and optional sparkline. Use in dashboard metric grids.

- **Import:** `import StatCard from '@components/ui/StatCard.svelte';`
- **Category:** chart
- **Props:** `label`, `value`, `trend`, `delta`, `sparkline`, `id`, `class`
- **Related:** `sparkline`, `progress-ring`, `donut-chart`

**When to use.** Use inside surface-raised grids for KPI dashboards. trend controls the icon and semantic color.

**Example:**

```svelte
<StatCard label='Revenue' value='$12,450' trend='up' delta='+12.5%' sparkline={weeklyRevenue} />
```

### feedback

#### AdaptiveImage `adaptive-image`

Physics/mode-aware decorative image. Selects which pre-existing source URL to display based on the active atmosphere's physics × mode (4 valid combinations: glass-dark, flat-dark, flat-light, retro-dark). Built on the same .image SCSS surface as <Image> (skeleton, error, aspect-ratio, opacity fade) but holds the previous frame across atmosphere-driven swaps: the next variant is decoded off-DOM via Image().decode() and only then does the visible <img>'s src advance, so the wrapper never returns to the loading state — no skeleton flash, no opacity reset. Resolution precedence: physics-specific prop wins, then mode-specific prop, then the default src fallback. Never transforms pixels — only selects between consumer-provided URLs. SSR / SEO trade-off: the <img> is client-only — pre-rendered HTML contains skeleton markup but no <img> tag (required to avoid locking in the default-atmosphere variant during hydration). For SEO-critical hero imagery without atmosphere variants, use plain <Image> instead.

- **Import:** `import AdaptiveImage from '@components/ui/AdaptiveImage.svelte';`
- **Category:** feedback
- **Props:** `src`, `alt`, `dark`, `light`, `glass`, `flat`, `retro`, `aspectRatio`, `lazy`, `objectFit`, `class`, `...rest:HTMLImgAttributes`
- **Related:** `image`, `skeleton`

**When to use.** Use for decorative content that should adapt across atmospheres — hero photos, marketing imagery, empty-state illustrations, background patterns. Provide at most 5 source URLs (one per axis value plus the default fallback). Resolution keys on physics × mode, never on atmosphere name (atmospheres are unbounded; physics × mode is the finite axis). For per-atmosphere control, wrap AdaptiveImage in app code branching on voidEngine.atmosphere.

**Example:**

```svelte
<AdaptiveImage src='/hero.jpg' dark='/hero-dark.jpg' glass='/hero-glass.jpg' alt='Hero' aspectRatio='16 / 9' />
```

#### Avatar `avatar`

Circular user representation. Renders an <img> when src is provided and loads successfully; falls back to initials derived from the name prop otherwise. Supports an optional presence dot (online/busy/away/offline) anchored to the bottom-right.

- **Import:** `import Avatar from '@components/ui/Avatar.svelte';`
- **Category:** feedback
- **Variants:** xs, sm, md, lg, xl
- **Props:** `src`, `name`, `size`, `presence`, `class`
- **Related:** `image`, `profile-button`, `skeleton`

**When to use.** Use anywhere a person is represented (comments, member lists, mentions, user pickers). The name prop is required — it derives initials (first + last initial, max 2 chars, uppercase) and supplies the accessible name in both image and initials modes. For navbar profile triggers with role badge + chevron, use ProfileBtn instead.

**Example:**

```svelte
<Avatar src='/jane.jpg' name='Jane Doe' size='lg' presence='online' />
```

#### Image `image`

Native <img> wrapper with skeleton fallback during load, muted error state on failure, lazy loading by default, and aspect-ratio wrapper for layout stability. Forwards native <img> attributes (width, height, decoding, srcset, sizes, etc.) via spread. Set progressive={true} to suppress the skeleton + fade-in so the browser's native top-down paint is visible while bytes stream in (baseline JPEG over chunked transfer, or progressive JPEG).

- **Import:** `import Image from '@components/ui/Image.svelte';`
- **Category:** feedback
- **Props:** `src`, `alt`, `aspectRatio`, `lazy`, `objectFit`, `progressive`, `class`, `...rest:HTMLImgAttributes`
- **Related:** `adaptive-image`, `skeleton`

**When to use.** Use for content imagery (hero photos, thumbnails, avatars, illustrations). Pair aspectRatio with object-fit to lock layout. Use progressive={true} when the server streams the image (set aspectRatio to prevent layout shift). Naming: in .astro files where Astro's <Image> from astro:assets is also imported, alias one — `import { Image as VoidImage } from '@components/ui/Image.svelte'`. In .svelte files there is no collision.

**Example:**

```svelte
<Image src='/hero.jpg' alt='Hero' aspectRatio='16 / 9' />
```

#### Markdown `markdown`

Renders a markdown string as styled, sanitized HTML inside a .prose wrapper. Bundles parser (marked + GFM) and sanitizer (sanitize-html) so consumers don't choose per-call. Safe by default; trusted bypasses sanitization for system-authored strings committed in source. External links auto-receive target='_blank' rel='noopener noreferrer'. Inline mode wraps in <span> (no leading <p>) for tooltip / label phrasing.

- **Import:** `import Markdown from '@components/ui/Markdown.svelte';`
- **Category:** feedback
- **Props:** `source`, `class`, `trusted`, `inline`
- **Related:** `image`, `video`

**When to use.** Use whenever content arrives as a markdown string (AI-generated narrative, help text, changelog, CMS field, toast detail body). Default <Markdown source={x} /> for AI/untrusted content. Pass trusted only for strings committed in source — treat the word 'trusted' in a diff as a sanitizer-bypass review surface. Pass inline for phrasing contexts (tooltip body, label text). Empty/null/undefined source renders an empty wrapper without throwing. Complete strings only in v1 — no streaming. Do not hand-roll marked() + {@html}.

**Example:**

```svelte
<Markdown source={aiOutput} />
```

#### Skeleton `skeleton`

Shimmer placeholder blocks for loading states. Variants: text (single line), avatar (circle), card (rectangle), paragraph (multiple lines).

- **Import:** `import Skeleton from '@components/ui/Skeleton.svelte';`
- **Category:** feedback
- **Variants:** text, avatar, card, paragraph
- **Props:** `variant`, `width`, `height`, `lines`, `class`

**When to use.** Use shimmer placeholders during loading. paragraph renders multiple text rows automatically.

**Example:**

```svelte
<Skeleton variant='paragraph' lines={3} />
```

#### Video `video`

Native <video> wrapper with skeleton fallback during metadata load, muted error state on failure, and aspect-ratio container for layout stability. Native browser controls by default (controls=true). Forwards native <video> attributes (autoplay, muted, loop, playsinline, crossorigin, etc.) via spread; <source> and <track> elements pass through as children.

- **Import:** `import Video from '@components/ui/Video.svelte';`
- **Category:** feedback
- **Props:** `src`, `poster`, `controls`, `preload`, `aspectRatio`, `element:bindable`, `paused:bindable`, `clickToPlay`, `class`, `...rest:HTMLVideoAttributes`
- **Slots:** `children()`
- **Related:** `image`, `media-scrubber`, `media-slider`, `skeleton`

**When to use.** Use for embedded clips and hero videos. Default aspectRatio='16 / 9' and preload='metadata' (mobile-data-friendly). For custom playback chrome: set controls={false}, capture the element via bind:element, bind paused (bidirectional sync — autoplay / click-to-play / ended all reflect back), pass clickToPlay so the pixels themselves toggle pause/play (universal web-player convention), and pair with <MediaScrubber element={videoEl} /> on top + <MediaSlider> below. For accessibility, pass <track kind='captions'> as children.

**Example:**

```svelte
<Video src='/clip.mp4' poster='/poster.jpg' />
```

### field

#### ColorField `color-field`

Native color picker input rendered as a circular swatch with a hex label. Opens the OS color dialog on click.

- **Import:** `import ColorField from '@components/ui/ColorField.svelte';`
- **Category:** field
- **Props:** `value:bindable`, `id`, `onchange`, `invalid`, `describedby`, `disabled`, `class`, `...rest:input[color]`
- **Related:** `form-field`, `copy-field`, `selector`

**When to use.** Wrap in FormField when you need label, hint, or error wiring. bind:value reflects the native color input.

**Example:**

```svelte
<ColorField bind:value={brandColor} />
```

#### Combobox `combobox`

Text input with a floating filtered dropdown list. Supports keyboard navigation, custom values, and async filtering. Floating UI positions the panel.

- **Import:** `import Combobox from '@components/ui/Combobox.svelte';`
- **Category:** field
- **Props:** `options`, `value:bindable`, `open:bindable`, `allowCustomValue`, `clearable`, `required`, `name`, `form`, `placeholder`, `autocomplete`, `onchange`, `oninput`, `disabled`, `class`, `id`, `...rest:input`
- **Prop types:**
  - `options`: `ComboboxOption[]`
  - `value`: `string | number | null`
  - `open`: `boolean`
  - `onchange`: `(value: string | number | null) => void`
  - `oninput`: `(query: string) => void`
- **Related:** `selector`, `search-field`, `dropdown`

**When to use.** Wrap in FormField for label or validation. Use bind:value for committed selection and oninput for async filtering.

**Example:**

```svelte
<Combobox options={assignees} bind:value={assignee} placeholder='Select assignee...' clearable />
```

#### CopyField `copy-field`

Readonly text input with a copy-to-clipboard icon button. Shows brief success feedback after copying.

- **Import:** `import CopyField from '@components/ui/CopyField.svelte';`
- **Category:** field
- **Props:** `value`, `id`, `class`
- **Related:** `icon-button`, `form-field`

**When to use.** Use for copy-only secrets or IDs. The field is readonly and already handles clipboard feedback.

**Example:**

```svelte
<CopyField value={apiKey} class='w-full' />
```

#### DropZone `drop-zone`

Dashed-border drop area that accepts dragged files or click-to-browse. Shows file type and size validation feedback via toast.

- **Import:** `import DropZone from '@components/ui/DropZone.svelte';`
- **Category:** field
- **Props:** `accept`, `maxSize`, `multiple`, `onfiles`, `disabled`, `class`
- **Related:** `copy-field`, `load-more`, `toast`

**When to use.** Use for drag-and-drop uploads with click fallback. Validation and toast errors are already built in.

**Example:**

```svelte
<DropZone accept='.json,.csv' maxSize={5 * 1024 * 1024} onfiles={handleFiles} />
```

#### EditField `edit-field`

Single-line inline-edit input with confirm/cancel/undo icon buttons that appear on focus. Renders as plain text when idle.

- **Import:** `import EditField from '@components/ui/EditField.svelte';`
- **Category:** field
- **Props:** `value:bindable`, `id`, `placeholder`, `onconfirm`, `autocomplete`, `disabled`, `class`
- **Related:** `edit-textarea`, `search-field`, `generate-field`

**When to use.** Use for single-line inline edits that require explicit confirm or cancel. It owns the edit, undo, and confirm affordances already.

**Example:**

```svelte
<EditField bind:value={name} onconfirm={saveName} />
```

#### EditTextarea `edit-textarea`

Multiline inline-edit textarea with confirm/cancel/undo icon buttons. Ctrl/Cmd+Enter confirms; Escape cancels.

- **Import:** `import EditTextarea from '@components/ui/EditTextarea.svelte';`
- **Category:** field
- **Props:** `value:bindable`, `id`, `placeholder`, `rows`, `onconfirm`, `disabled`, `class`
- **Related:** `edit-field`, `generate-textarea`

**When to use.** Use for multiline inline edits that require explicit confirm or cancel. Ctrl/Cmd+Enter confirms; Escape cancels.

**Example:**

```svelte
<EditTextarea bind:value={bio} rows={5} onconfirm={saveBio} />
```

#### GenerateField `generate-field`

Single-line text input with an AI sparkle button that triggers async generation. Shows a loading spinner during generation; Escape aborts.

- **Import:** `import GenerateField from '@components/ui/GenerateField.svelte';`
- **Category:** field
- **Props:** `value:bindable`, `id`, `placeholder`, `instructions`, `ongenerate`, `disabled`, `class`, `...rest:input`
- **Prop types:**
  - `value`: `string`
  - `ongenerate`: `(context: GenerateFieldContext) => Promise<string>`
- **Related:** `generate-textarea`, `search-field`, `edit-field`

**When to use.** Provide an async ongenerate handler that returns the final string. Escape aborts generation.

**Example:**

```svelte
<GenerateField bind:value={title} instructions='Generate a project title' ongenerate={generateTitle} />
```

#### GenerateTextarea `generate-textarea`

Multiline textarea with an AI sparkle button for async text generation. Shows loading state during generation; Escape aborts.

- **Import:** `import GenerateTextarea from '@components/ui/GenerateTextarea.svelte';`
- **Category:** field
- **Props:** `value:bindable`, `id`, `placeholder`, `rows`, `instructions`, `ongenerate`, `disabled`, `class`, `...rest:textarea`
- **Prop types:**
  - `value`: `string`
  - `ongenerate`: `(context: GenerateFieldContext) => Promise<string>`
- **Related:** `generate-field`, `edit-textarea`

**When to use.** Provide an async ongenerate handler that returns the final string. Escape aborts generation while loading.

**Example:**

```svelte
<GenerateTextarea bind:value={bio} rows={5} instructions='Write a short bio' ongenerate={generateBio} />
```

#### MediaScrubber `media-scrubber`

Timeline scrubber for <video>/<audio>. Pass an HTMLMediaElement ref via element={...} and the scrubber owns its own timeupdate / durationchange / loadedmetadata listeners and seeks on user input. Tabular monospace time label (00:42 / 03:15) on the right by default.

- **Import:** `import MediaScrubber from '@components/ui/MediaScrubber.svelte';`
- **Category:** field
- **Props:** `element`, `currentTime:bindable`, `duration:bindable`, `showTime`, `disabled`, `class`
- **Related:** `media-slider`, `video`, `slider-field`

**When to use.** Stack above a <MediaSlider> to build a two-row custom control bar (timeline on top, transport + volume below) — mirrors Plyr / Vidstack / Video.js. Pass element={videoEl} from <Video bind:element>. Scrubber wires its own listeners; consumer doesn't need $effect blocks for time. Time label is on by default — set showTime={false} to hide.

**Example:**

```svelte
<MediaScrubber element={videoEl} />
```

#### MediaSlider `media-slider`

Horizontal control bar following the standard video-player layout: transport (play/pause + replay) on the left, volume slider in the middle, mute toggle on the right. Icons animate between states.

- **Import:** `import MediaSlider from '@components/ui/MediaSlider.svelte';`
- **Category:** field
- **Props:** `volume:bindable`, `muted:bindable`, `icon`, `playback`, `paused:bindable`, `replay`, `onchange`, `onmute`, `onpause`, `onreplay`, `disabled`, `class`
- **Related:** `media-scrubber`, `slider-field`, `toggle`, `icon-button`

**When to use.** Use for audio controls or as the bottom row of custom video chrome. Mute, play/pause, and replay buttons are already wired to animated icons. For video, stack a <MediaScrubber> on top for the timeline.

**Example:**

```svelte
<MediaSlider bind:volume bind:muted playback bind:paused icon='music' />
```

#### PasswordField `password-field`

Password input with a show/hide eye toggle button. Pairs with PasswordMeter and PasswordChecklist for strength feedback.

- **Import:** `import PasswordField from '@components/ui/PasswordField.svelte';`
- **Category:** field
- **Props:** `value:bindable`, `id`, `placeholder`, `autocomplete`, `invalid`, `describedby`, `disabled`, `class`, `...rest:input`
- **Related:** `password-meter`, `password-checklist`, `form-field`, `create-password-validation`

**When to use.** Usually pair with FormField plus createPasswordValidation from @lib/password-validation.svelte feeding PasswordMeter and PasswordChecklist.

**Example:**

```svelte
<PasswordField id={fieldId} bind:value={password} describedby={descriptionId} {invalid} autocomplete='new-password' />
```

#### SearchField `search-field`

Text input with a magnifying-glass icon, optional zoom-expand animation, and debounced input. Submits on Enter.

- **Import:** `import SearchField from '@components/ui/SearchField.svelte';`
- **Category:** field
- **Props:** `value:bindable`, `id`, `placeholder`, `autocomplete`, `zoom`, `delay`, `onsubmit`, `oninput`, `disabled`, `class`, `...rest:input`
- **Related:** `edit-field`, `generate-field`, `combobox`

**When to use.** Wrap in FormField for label or validation. Use bind:value for reactivity; onsubmit fires on Enter.

**Example:**

```svelte
<SearchField bind:value={query} placeholder='Search...' />
```

#### Selector `selector`

Styled native <select> dropdown with an optional label. Caret icon indicates expandability. Best for long option lists without filtering.

- **Import:** `import Selector from '@components/ui/Selector.svelte';`
- **Category:** field
- **Props:** `options`, `value:bindable`, `label`, `id`, `placeholder`, `selectClass`, `align`, `onchange`, `disabled`, `class`, `...rest:select`
- **Prop types:**
  - `options`: `SelectorOption[]`
  - `value`: `string | number | null`
  - `onchange`: `(value: string | number | null) => void`
- **Related:** `switcher`, `combobox`, `slider-field`

**When to use.** Use when you want native select semantics or a long option list without filtering.

**Example:**

```svelte
<Selector options={fontOptions} bind:value={font} label='Heading Font' placeholder='Select a font...' />
```

#### SliderField `slider-field`

Labeled range slider with optional snap-point preset buttons above the track. Displays the current numeric value.

- **Import:** `import SliderField from '@components/ui/SliderField.svelte';`
- **Category:** field
- **Props:** `value:bindable`, `id`, `presets`, `min`, `max`, `step`, `label`, `onchange`, `disabled`, `class`
- **Prop types:**
  - `value`: `number`
  - `presets`: `SliderFieldPreset[]`
  - `onchange`: `(value: number) => void`
- **Related:** `selector`, `switcher`, `media-slider`

**When to use.** Use presets for snap-point selection; without presets it behaves like a labeled native range input.

**Example:**

```svelte
<SliderField bind:value={quality} presets={qualityPresets} label='Quality' />
```

#### Switcher `switcher`

Segmented pill-bar where one option is highlighted with an animated sliding indicator. Renders native radio inputs for form submission.

- **Import:** `import Switcher from '@components/ui/Switcher.svelte';`
- **Category:** field
- **Props:** `options`, `value:bindable`, `id`, `label`, `name`, `required`, `form`, `onchange`, `disabled`, `class`
- **Prop types:**
  - `options`: `SwitcherOption[]`
  - `value`: `string | number | null`
  - `onchange`: `(value: string | number | null) => void`
- **Related:** `selector`, `tabs`, `toggle`

**When to use.** Use when choices are few and mutually exclusive. It renders native radio inputs for form submission.

**Example:**

```svelte
<Switcher options={densityOptions} bind:value={density} label='Density' />
```

#### Toggle `toggle`

iOS-style on/off switch with optional custom icons inside the thumb. Renders a native checkbox for form semantics.

- **Import:** `import Toggle from '@components/ui/Toggle.svelte';`
- **Category:** field
- **Variants:** sm, md, lg, xl, 2xl, 3xl, 4xl
- **Props:** `checked:bindable`, `id`, `label`, `size`, `iconOn`, `iconOff`, `hideIcons`, `onchange`, `disabled`, `class`, `...rest:input`
- **Prop types:**
  - `checked`: `boolean`
  - `iconOn`: `string | Component`
  - `iconOff`: `string | Component`
  - `onchange`: `(checked?: boolean) => void`
- **Related:** `switcher`, `selector`, `media-slider`

**When to use.** Use for boolean state. Native checkbox semantics and focus handling are already built in.

**Example:**

```svelte
<Toggle bind:checked={enabled} label='Auto-play' />
```

### form

#### FormField `form-field`

Label + hint + error wrapper that generates stable IDs and ARIA wiring. The actual input is passed through a children snippet.

- **Import:** `import FormField from '@components/ui/FormField.svelte';`
- **Category:** form
- **Props:** `label`, `error`, `hint`, `required`, `fieldId`, `class`
- **Slots:** `children({ fieldId, descriptionId, invalid })`
- **Related:** `search-field`, `password-field`, `color-field`

**When to use.** Pass the actual control through the children snippet and forward fieldId, descriptionId, and invalid into it.

**Example:**

```svelte
<FormField label='Email'>{#snippet children({ fieldId, descriptionId, invalid })}<input id={fieldId} aria-describedby={descriptionId} aria-invalid={invalid} />{/snippet}</FormField>
```

#### PasswordChecklist `password-checklist`

Vertical list of password rules with check/cross icons that update in real-time as the user types.

- **Import:** `import PasswordChecklist from '@components/ui/PasswordChecklist.svelte';`
- **Category:** form
- **Props:** `password`, `validation`, `class`
- **Related:** `password-meter`, `password-field`, `create-password-validation`

**When to use.** Use directly below PasswordField. It expects the validation object returned by createPasswordValidation.

**Example:**

```svelte
<PasswordChecklist password={password} validation={pv} />
```

#### PasswordMeter `password-meter`

Horizontal strength bar that fills and changes color (weak to strong) based on password validation score. Hides when empty.

- **Import:** `import PasswordMeter from '@components/ui/PasswordMeter.svelte';`
- **Category:** form
- **Props:** `password`, `validation`, `class`
- **Related:** `password-checklist`, `password-field`, `create-password-validation`

**When to use.** Feed the same createPasswordValidation result used by PasswordChecklist. It hides automatically when password is empty.

**Example:**

```svelte
<PasswordMeter password={password} validation={pv} />
```

### interaction

#### PullRefresh `pull-refresh`

Pull-to-refresh wrapper supporting touch, pointer, and mouse wheel inputs. Pulling down reveals a spinner and triggers an async refresh callback. Features rubber-band physics and cooldown.

- **Import:** `import PullRefresh from '@components/ui/PullRefresh.svelte';`
- **Category:** interaction
- **Props:** `onrefresh`, `onerror`, `threshold`, `disabled`, `class`
- **Slots:** `children()`
- **Related:** `load-more`, `skeleton`

**When to use.** Wrap the scrollable page content and return a promise from onrefresh. Use for mobile-style refresh affordances.

**Example:**

```svelte
<PullRefresh onrefresh={refreshPage}><div class='container py-2xl'>...</div></PullRefresh>
```

### layout

#### SettingsRow `settings-row`

Two-column row with a label on the left and arbitrary controls on the right. Use inside settings screens for consistent alignment.

- **Import:** `import SettingsRow from '@components/ui/SettingsRow.svelte';`
- **Category:** layout
- **Props:** `label`, `class`
- **Slots:** `children()`
- **Related:** `switcher`, `selector`, `toggle`

**When to use.** Use inside settings screens to align a label column with arbitrary controls instead of hand-rolling a grid.

**Example:**

```svelte
<SettingsRow label='Density'><Switcher options={densityOptions} bind:value={density} /></SettingsRow>
```

### nav

#### Breadcrumbs `breadcrumbs`

Horizontal breadcrumb trail with chevron separators. Active items switch to slash separators for peer-mode navigation.

- **Import:** `import Breadcrumbs from '@components/ui/Breadcrumbs.svelte';`
- **Category:** nav
- **Props:** `items`, `hidden`, `class`
- **Prop types:**
  - `items`: `BreadcrumbItem[]`
  - `hidden`: `boolean`
- **Related:** `sidebar`, `tabs`

**When to use.** Pass BreadcrumbItem[] with label, href?, and active?. Any active item switches separators to peer-mode slashes.

**Example:**

```svelte
<Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Components', href: '/components' }, { label: 'Buttons' }]} />
```

#### LoadMore `load-more`

Intersection-observer trigger that auto-loads the next page when scrolled into view, with a manual 'Load more' button fallback.

- **Import:** `import LoadMore from '@components/ui/LoadMore.svelte';`
- **Category:** nav
- **Props:** `loading`, `hasMore`, `onloadmore`, `rootMargin`, `observer`, `label`, `class`
- **Related:** `pagination`, `skeleton`

**When to use.** Place after the list or grid. Keep the manual button even when IntersectionObserver auto-loading is enabled.

**Example:**

```svelte
<LoadMore loading={loading} hasMore={hasMore} onloadmore={fetchNextPage} />
```

#### Pagination `pagination`

Page number row with prev/next arrows and ellipsis collapsing. Hides when totalPages <= 1. Compact mobile indicator on small screens.

- **Import:** `import Pagination from '@components/ui/Pagination.svelte';`
- **Category:** nav
- **Props:** `currentPage:bindable`, `totalPages`, `siblings`, `showFirstLast`, `showPrevNext`, `onchange`, `label`, `class`
- **Related:** `load-more`, `tabs`

**When to use.** Use for paged collections. It hides itself when totalPages <= 1 and collapses to a compact mobile indicator automatically.

**Example:**

```svelte
<Pagination bind:currentPage={page} totalPages={totalPages} />
```

#### Sidebar `sidebar`

Vertical section nav with grouped items and an active highlight. Supports scroll-spy via IntersectionObserver. Renders as a slide-over overlay on small screens.

- **Import:** `import Sidebar from '@components/ui/Sidebar.svelte';`
- **Category:** nav
- **Props:** `sections`, `activeId:bindable`, `open:bindable`, `trackScroll`, `onclose`, `class`
- **Prop types:**
  - `sections`: `SidebarSection[]`
  - `activeId`: `string`
  - `open`: `boolean`
  - `trackScroll`: `boolean`
  - `onclose`: `() => void`
- **Related:** `tabs`, `breadcrumbs`, `dropdown`

**When to use.** Use for section navigation. It can sync activeId from the URL hash and IntersectionObserver and behaves as an overlay on smaller screens.

**Example:**

```svelte
<Sidebar sections={sections} bind:activeId bind:open={sidebarOpen} onclose={closeSidebar} />
```

#### Tabs `tabs`

Horizontal tab bar with an animated underline indicator. Supports keyboard arrow navigation and roving tabindex. Content rendered via panel snippet.

- **Import:** `import Tabs from '@components/ui/Tabs.svelte';`
- **Category:** nav
- **Props:** `tabs`, `value:bindable`, `onchange`, `class`
- **Prop types:**
  - `tabs`: `TabItem[]`
  - `value`: `string`
  - `onchange`: `(id: string) => void`
- **Slots:** `panel(tab)`
- **Related:** `switcher`, `pagination`, `sidebar`

**When to use.** Pass tab metadata and render content through the panel snippet. Keyboard and roving-tabindex behavior are already implemented.

**Example:**

```svelte
<Tabs tabs={tabs} bind:value={activeTab}>{#snippet panel(tab)}<p>{tab.label}</p>{/snippet}</Tabs>
```

### overlay

#### Dropdown `dropdown`

Floating panel anchored to a trigger button. Positioned via Floating UI. Closes on Escape and click-outside.

- **Import:** `import Dropdown from '@components/ui/Dropdown.svelte';`
- **Category:** overlay
- **Props:** `open:bindable`, `placement`, `offset`, `label`, `triggerClass`, `onchange`, `class`
- **Prop types:**
  - `open`: `boolean`
  - `placement`: `import('@floating-ui/dom').Placement`
  - `offset`: `number`
  - `onchange`: `(open: boolean) => void`
- **Slots:** `trigger()`, `children()`
- **Related:** `combobox`, `profile-button`, `sidebar`

**When to use.** Use a trigger snippet for the button content and arbitrary panel markup in children. Escape and click-outside handling are built in.

**Example:**

```svelte
<Dropdown label='Profile'>{#snippet trigger()}<ProfileBtn />{/snippet}<div class='surface-raised p-md'>Menu</div></Dropdown>
```

### theme

#### AtmosphereScope `atmosphere-scope`

Wraps content in a temporary atmosphere that auto-restores on unmount. Accepts a theme ID string or a partial theme definition object for inline/brand themes. Respects the user's adaptAtmosphere preference.

- **Import:** `import AtmosphereScope from '@components/core/AtmosphereScope.svelte';`
- **Category:** theme
- **Props:** `theme`, `label`
- **Prop types:**
  - `theme`: `string | PartialThemeDefinition`
  - `label`: `string (default: 'Page theme')`
- **Slots:** `children()`

**When to use.** Wrap any section that needs its own atmosphere. Uses pushTemporaryTheme/releaseTemporaryTheme under the hood so nested scopes restore correctly. Pass a string for registered themes or an object for inline/brand themes.

**Example:**

```svelte
<AtmosphereScope theme="crimson" label="Horror story"><StoryContent /></AtmosphereScope>
```

#### LiquidGlassFilter `liquid-glass-filter`

Global SVG filter definitions for glass refraction. Provides a displacement-based distortion filter simulating light bending through curved glass. Place once in Layout.astro — invisible, only defines reusable SVG filter primitives referenced by CSS.

- **Import:** `import LiquidGlassFilter from '@components/core/LiquidGlassFilter.svelte';`
- **Category:** theme
- **Related:** `atmosphere-scope`

**When to use.** Mount once in the app shell (Layout.astro) with client:load. The filter activates automatically when glass physics is active on Chromium browsers. No props needed.

**Example:**

```svelte
<LiquidGlassFilter client:load />
```

#### ThemeBuilder `theme-builder`

Full theme creation surface: AI-generated atmospheres from a vibe description or brand URL, plus an inline palette editor for manual color, opacity, font, and semantic-color tweaking. Drives the ephemeral preview lifecycle (registerEphemeralTheme + pushTemporaryTheme) so the user previews a candidate atmosphere before keeping it. On Keep, the candidate is promoted via registerTheme + setAtmosphere — saved themes show up in voidEngine.customAtmospheres (not builtInAtmospheres). Respects voidEngine.userConfig.adaptAtmosphere: when overrides are disabled, generated atmospheres save and apply immediately with no preview step.

- **Import:** `import ThemeBuilder from '@components/ui/ThemeBuilder.svelte';`
- **Category:** theme
- **Variants:** ai, manual, both
- **Props:** `mode`, `initialVibe`, `onSave`, `onCancel`, `class`
- **Prop types:**
  - `mode`: `'ai' | 'manual' | 'both'`
  - `initialVibe`: `string`
  - `onSave`: `(id: string, definition: PartialThemeDefinition) => void`
  - `onCancel`: `() => void`
- **Related:** `atmosphere-scope`, `themes-button`

**When to use.** Drop into a settings page, onboarding flow, or modal to give users full theme creation. Use mode='ai' for vibe-only flows, mode='manual' for palette-only flows, mode='both' (default) for the combined experience. Pass onCancel only when mounting inside a dismissable container (modal, sheet) — the component does not render exit chrome by default. The Revert button always appears during preview and is independent of onCancel.

**Example:**

```svelte
<ThemeBuilder mode="both" onSave={(id) => navigate(`/themes/${id}`)} />
```

## Actions

### aura `aura` _(action)_

Svelte action that attaches an ambient colored glow to a host element via a ::after pseudo-element. Toggles data-aura on the host; writes --aura-color inline only when a color is provided. When color is omitted, SCSS falls back to var(--energy-primary) so the glow tracks the active atmosphere. Active on dark glass and dark flat only — light mode and retro disable the effect. Hosts that need position: absolute|fixed must wrap aura on a child.

- **Import:** `import { aura } from '@actions/aura';`
- **Category:** motion
- **Signature:** `aura(node, options?)`
- **Args:**
  - `options?: { color?: string; enabled?: boolean }`
- **Returns:**
  - `{ update(newOptions), destroy() }`
- **Related:** `extract-aura`, `adaptive-image`

**When to use.** Attach to image-backed or atmosphere-primary surfaces (story scenes, hero panels, album-cover-style cards). Omit color for atmosphere-driven glow; pass an explicit hex when the upstream already emits one. Pair with extractAura when the color must come from an image. Do not use on dashboard tiles, form fields, navigation chrome, or generic cards — multiple Auras in one region create rainbow-disco pages.

**Example:**

```ts
<div use:aura>...</div> // atmosphere-driven, or use:aura={{ color: '#33e2e6' }}
```

### draggable `draggable` _(action)_

Svelte action that makes an element draggable via pointer and keyboard. Supports axis constraints, handle selectors, and drag groups.

- **Import:** `import { draggable } from '@actions/drag';`
- **Category:** drag
- **Signature:** `draggable(node, options)`
- **Args:**
  - `options: DraggableOptions`
- **Returns:**
  - `{ update(newOptions), destroy() }`
- **Related:** `drop-target`, `reorder-by-drop`

**When to use.** Use with dropTarget for pointer + keyboard drag interactions. Keep IDs stable and group names consistent across the draggable/drop-target pair.

**Example:**

```ts
<div use:draggable={{ id: item.id, group: 'stories', data: item }}>...</div>
```

### dropTarget `drop-target` _(action)_

Svelte action that makes an element a drop zone for draggable items. Supports 'inside' (zone drop) and 'between' (sortable reorder) modes.

- **Import:** `import { dropTarget } from '@actions/drag';`
- **Category:** drag
- **Signature:** `dropTarget(node, options)`
- **Args:**
  - `options: DropTargetOptions`
- **Returns:**
  - `{ update(newOptions), destroy() }`
- **Related:** `draggable`, `resolve-reorder-by-drop`

**When to use.** Use mode='between' for sortable lists and mode='inside' for zone drops. between-mode pairs naturally with reorderByDrop/resolveReorderByDrop.

**Example:**

```ts
<div use:dropTarget={{ id: item.id, group: 'stories', mode: 'between', onDrop: handleDrop }}>...</div>
```

### fontShift `font-shift` _(action)_

Svelte action that ties a variable font's wght axis to scroll position via animation-timeline: view(). Per-instance keyframes are injected into a per-instance <style> tag. The animated custom property --void-font-shift-wght is registered once via CSS.registerProperty with syntax: '<number>' so all browsers interpolate it smoothly (without registration, custom properties flip discretely at 50%). All three physics presets default to a 100 → 900 sweep — only the timing function differs (glass linear, flat linear, retro steps(4, end)). The action queries the resolved font's actual wght axis via document.fonts and auto-clamps the defaults to that axis, so a font like Space Grotesk (300–700) uses its full visible range without dead zones. Explicit from/to values bypass clamping. Physics resolves from the nearest [data-physics] ancestor (closest() lookup), so AtmosphereScope-pinned subtrees and local data-physics regions render correctly. State surfacing via data-font-shift: active, reduced (motion preference), or static (font has no wght axis — dev builds also log a console warning). Reduced motion and static-font elements render at the natural cascade weight. Browsers without view-timeline (Firefox stable) fall back via @supports. Animates wght only — wdth/opsz and scroll() timelines are non-goals for v1.

- **Import:** `import { fontShift } from '@actions/font-shift';`
- **Category:** motion
- **Signature:** `fontShift(node, options?)`
- **Args:**
  - `options?: { from?: number; to?: number; range?: string; enabled?: boolean }`
- **Returns:**
  - `{ update(newOptions), destroy() }`
- **Related:** `kinetic`

**When to use.** Apply to headings or short phrases on tall, scrollable pages — the effect needs viewport runway to be visible. Omit from/to to inherit atmosphere defaults. Use only on variable fonts whose @font-face declares a wght range (Inter, Hanken Grotesk, Raleway, Exo 2, Cinzel, etc.). Avoid stacking on every heading on a page — the effect is most striking when scarce.

**Example:**

```ts
<h1 use:fontShift={{ from: 100, to: 900 }}>Type that breathes</h1>
```

### kinetic `kinetic` _(action)_

Svelte action for declarative text reveal animations: typing, word-by-word, cycling, or scramble-decode. Restarts on config change.

- **Import:** `import { kinetic } from '@actions/kinetic';`
- **Category:** motion
- **Signature:** `kinetic(node, config)`
- **Args:**
  - `config: KineticConfig`
- **Returns:**
  - `{ update(newConfig), destroy() }`
- **Related:** `typewrite`

**When to use.** Use for declarative text reveal effects in markup. The action restarts whenever the config object reference changes. For premium character-level reveals, use @void-energy/kinetic-text instead.

**Example:**

```ts
<span use:kinetic={{ text: 'SYSTEM ONLINE', mode: 'decode' }} />
```

### laserAim `laser-aim` _(action)_

Svelte action for .btn-cta. On hover, the rotating gradient ring's comet head tracks the cursor instead of pausing at a random animation frame. Sets --cta-aim from pointermove and toggles data-aim='on' so SCSS can gate the override. Skipped on coarse-pointer devices (touch). Auto-attached inside ActionBtn and ThemesBtn when their class includes btn-cta — bind manually only on raw <button class="btn-cta"> elements.

- **Import:** `import { laserAim } from '@actions/laser-aim';`
- **Category:** motion
- **Signature:** `laserAim(node, options?)`
- **Args:**
  - `options?: { enabled?: boolean }`
- **Returns:**
  - `{ update(newOptions), destroy() }`

**When to use.** Already auto-bound by ActionBtn and ThemesBtn when their class prop includes btn-cta — consumers using those wrappers don't need to import or apply this action. For raw <button class="btn-cta"> usages in Svelte runes files, bind it explicitly. Astro pages can't use Svelte directives and will fall back to the default paused-on-hover behavior. Apply to primary CTAs only — the magnetic feel is most striking when scarce.

**Example:**

```ts
<button class="btn btn-cta" use:laserAim>Continue</button>
```

### morph `morph` _(action)_

Svelte action that animates an element's width/height when its content changes size. Uses ResizeObserver internally.

- **Import:** `import { morph } from '@actions/morph';`
- **Category:** motion
- **Signature:** `morph(node, options?)`
- **Args:**
  - `options?: MorphOptions`
- **Returns:**
  - `{ update(newOptions), destroy() }`
- **Related:** `dropdown`, `line-chart`

**When to use.** Apply to inner containers whose dimensions change with content. Avoid pairing it with CSS width/height transitions on the same node.

**Example:**

```ts
<div use:morph>{#if expanded}<LargeContent />{:else}<SmallContent />{/if}</div>
```

### navlink `navlink` _(action)_

Svelte action that adds a loading data-attribute to links during navigation, enabling CSS loading indicators on click.

- **Import:** `import { navlink } from '@actions/navlink';`
- **Category:** nav
- **Signature:** `navlink(node)`
- **Returns:**
  - `{ destroy() }`
- **Related:** `sidebar`

**When to use.** Use on links or navigational surfaces that should expose loading state immediately on primary-button navigation.

**Example:**

```ts
<a href='/components' use:navlink>Components</a>
```

### tooltip `tooltip` _(action)_

Svelte action that shows a floating text tooltip on hover/focus. Positioned via Floating UI with configurable placement and delay.

- **Import:** `import { tooltip } from '@actions/tooltip';`
- **Category:** overlay
- **Signature:** `tooltip(node, params)`
- **Args:**
  - `params: string | VoidTooltipOptions`
- **Returns:**
  - `{ update(newParams), destroy() }`
- **Related:** `dropdown`

**When to use.** Use string shorthand for plain text or VoidTooltipOptions when placement, delay, or offset must change.

**Example:**

```ts
<button use:tooltip="Open settings">...</button>
```

## Utilities

### createPasswordValidation `create-password-validation` _(utility)_

Factory that returns a reactive password validation object with strength score, rule checks, and optional confirm-match. Feed into PasswordMeter and PasswordChecklist.

- **Import:** `import { createPasswordValidation } from '@lib/password-validation.svelte';`
- **Category:** form
- **Signature:** `createPasswordValidation(getPassword, getConfirmPassword?, options?)`
- **Args:**
  - `getPassword: () => string`
  - `getConfirmPassword?: () => string`
  - `options?: { minLength?, maxLength?, allowedChars?, allowedCharsDescription?, requireConfirm? }`
- **Returns:**
  - `PasswordValidationState`
  - `Getter-backed reactive object: do not destructure`
  - `fields: error, isValid, rules, score, level, hasLower, hasUpper, hasDigit, hasSpecial, hasRestrictedChars, hasValidLength, passwordsMatch`
- **Related:** `password-field`, `password-meter`, `password-checklist`

**When to use.** Create once at component top level and pass the returned object directly into PasswordMeter and PasswordChecklist. Use requireConfirm when the confirm field must match.

**Example:**

```ts
import { createPasswordValidation } from '@lib/password-validation.svelte'; const pv = createPasswordValidation(() => password, () => confirm, { requireConfirm: true });
```

### extractAura `extract-aura` _(utility)_

Sample a single dominant color from an image and clamp it into a glow-friendly HSL range. Returns a CSS-ready color string for the aura action. Always returns a valid color — never throws on extraction failure (CORS, decode error, missing image).

- **Import:** `import { extractAura } from '@lib/aura';`
- **Category:** motion
- **Signature:** `extractAura(source, options?)`
- **Args:**
  - `source: HTMLImageElement | string`
  - `options?: { clampSaturation?: number; clampLightness?: [number, number]; fallback?: string }`
- **Returns:**
  - `Promise<string>`
- **Related:** `aura`

**When to use.** Pair with use:aura on image-backed surfaces. Call from a $effect when the image element or src changes; pass the resolved color to aura. Consumers whose upstream already emits a validated hex (e.g. a story engine) can pass that directly to use:aura and skip extraction entirely.

**Example:**

```ts
$effect(() => { if (img) extractAura(img).then((c) => (color = c)); });
```

### reorderByDrop `reorder-by-drop` _(utility)_

Pure function that returns a new array with the dropped item moved to its target position. Use after a between-mode drop event.

- **Import:** `import { reorderByDrop } from '@actions/drag';`
- **Category:** drag
- **Signature:** `reorderByDrop(items, detail)`
- **Args:**
  - `items: T[] where T extends { id: string }`
  - `detail: { id, targetId?, position? }`
- **Returns:**
  - `T[]`
- **Related:** `draggable`, `drop-target`, `resolve-reorder-by-drop`

**When to use.** Use after dropTarget between-mode drops when you only need the reordered collection and not the backend payload.

**Example:**

```ts
items = reorderByDrop(items, detail);
```

### resolveReorderByDrop `resolve-reorder-by-drop` _(utility)_

Like reorderByDrop but also returns a backend-ready payload with fromIndex, toIndex, previousId, nextId, and orderedIds.

- **Import:** `import { resolveReorderByDrop } from '@actions/drag';`
- **Category:** drag
- **Signature:** `resolveReorderByDrop(items, detail)`
- **Args:**
  - `items: T[] where T extends { id: string }`
  - `detail: { id, targetId?, position? }`
- **Returns:**
  - `ReorderChange<T> | null`
- **Related:** `draggable`, `drop-target`, `reorder-by-drop`

**When to use.** Use when a sortable drop must also produce a backend-ready payload describing the move.

**Example:**

```ts
const change = resolveReorderByDrop(items, detail); if (change) save(change.request);
```

### typewrite `typewrite` _(utility)_

Imperative function that types text into a DOM element character-by-character. Returns an abortable promise.

- **Import:** `import { typewrite } from '@actions/kinetic';`
- **Category:** motion
- **Signature:** `typewrite(el, text, options?)`
- **Args:**
  - `el: HTMLElement`
  - `text: string`
  - `options?: Omit<KineticConfig, 'text' | 'words'>`
- **Returns:**
  - `KineticHandle (Promise<void> with abort())`
- **Related:** `kinetic`

**When to use.** Use when you need imperative, abortable typing outside Svelte markup or want a promise that resolves when the reveal completes.

**Example:**

```ts
const handle = typewrite(node, 'Loading...', { speed: 30 }); handle.abort();
```

## Controllers (singletons)

Import once. Never re-instantiate.

### layerStack `layer-stack` _(singleton)_

Global escape-key dismissal stack. Tracks open overlays (modals, dropdowns, sidebars) so Escape closes the topmost layer first.

- **Import:** `import { layerStack } from '@lib/layer-stack.svelte';`
- **Category:** overlay
- **API:**
  - `push(dismiss)`
  - `remove(id)`
  - `clear()`
- **State:**
  - `hasLayers: boolean`
- **Related:** `modal`, `dropdown`, `sidebar`, `shortcut-registry`

**When to use.** Prefer higher-level primitives first. Use layerStack only when building a new dismissible surface that must participate in global Escape handling.

**Example:**

```ts
const id = layerStack.push(close); return () => layerStack.remove(id);
```

### modal `modal` _(singleton)_

Global modal manager singleton. Opens confirm, alert, settings, themes, shortcuts, and command palette dialogs. The modal shell is already mounted in Layout.

- **Import:** `import { modal } from '@lib/modal-manager.svelte';`
- **Category:** overlay
- **API:**
  - `open(key, props, size)`
  - `close()`
  - `confirm(title, body, actions)`
  - `alert(title, body)`
  - `settings()`
  - `themes()`
  - `shortcuts()`
  - `palette()`
- **State:**
  - `state: { key: 'alert' | 'confirm' | 'palette' | 'settings' | 'shortcuts' | 'themes' | null, props: object, size: 'sm' | 'md' | 'lg' | 'full' }`
- **Related:** `dropdown`, `toast`

**When to use.** Do not render a new modal shell. Use the modal manager; the global Modal.svelte host resolves fragments from src/config/modal-registry.ts.

**Example:**

```ts
import { modal } from '@lib/modal-manager.svelte'; modal.confirm('Delete?', 'This cannot be undone.', { onConfirm: removeItem });
```

### shortcutRegistry `shortcut-registry` _(singleton)_

Global keyboard shortcut manager. Registered shortcuts auto-appear in the shortcuts modal. Supports meta and alt modifiers.

- **Import:** `import { shortcutRegistry } from '@lib/shortcut-registry.svelte';`
- **Category:** input
- **API:**
  - `register(entry)`
  - `unregister(key, modifier?)`
  - `clear()`
- **State:**
  - `entries: VoidShortcutEntry[]`
  - `grouped: { group: string, items: VoidShortcutEntry[] }[]`
- **Related:** `modal`, `layer-stack`

**When to use.** Register shortcuts from always-mounted components. The shortcuts modal reads shortcutRegistry.grouped automatically, so new entries show up without extra wiring.

**Example:**

```ts
shortcutRegistry.register({ key: 'k', modifier: 'meta', label: 'Command palette', group: 'General', action: () => modal.palette() });
```

### toast `toast` _(singleton)_

Global toast notification store. Shows info, success, error, warning, and loading toasts. Supports undo actions, promise tracking, and loading controllers.

- **Import:** `import { toast } from '@stores/toast.svelte';`
- **Category:** feedback
- **API:**
  - `show(message, type, duration, action)`
  - `undo(message, callback, duration)`
  - `loading(message)`
  - `promise(promise, messages)`
  - `close(id)`
  - `clearAll()`
- **State:**
  - `items: VoidToastItem[]`
- **Related:** `skeleton`

**When to use.** Do not render a new toast region. Use the toast store; the global Toast.svelte host renders items and handles timing.

**Example:**

```ts
import { toast } from '@stores/toast.svelte'; toast.promise(save(), { loading: 'Saving...', success: 'Saved', error: 'Save failed' });
```

### user `user` _(singleton)_

Auth state singleton with login/logout/refresh, role-based helpers (isAdmin, isCreator, etc.), and local persistence. Drives ProfileBtn automatically.

- **Import:** `import { user } from '@stores/user.svelte';`
- **Category:** auth
- **API:**
  - `login(userData)`
  - `logout()`
  - `update(partial)`
  - `refresh(fetcher)`
  - `toggleDeveloperMode()`
- **State:**
  - `current: VoidUser | null`
  - `loading: boolean`
  - `developerMode: boolean`
  - `isAuthenticated: boolean`
  - `isAdmin: boolean`
  - `isCreator: boolean`
  - `isPlayer: boolean`
  - `isGuest: boolean`
  - `approvedTester: boolean`
- **Related:** `profile-button`

**When to use.** Import the singleton; never create a second user store. It owns auth hydration, local persistence, and the root data-auth DOM contract.

**Example:**

```ts
import { user } from '@stores/user.svelte'; if (user.isAuthenticated) console.log(user.current?.name);
```

### voidEngine `void-engine` _(singleton)_

Runtime theme engine singleton. Manages atmosphere switching, density scaling, user preferences, custom theme registration, and temporary theme previews.

- **Import:** `import { voidEngine } from '@adapters/void-engine.svelte';`
- **Category:** theme
- **API:**
  - `setAtmosphere(name)`
  - `setPreferences(prefs)`
  - `registerTheme(id, definition)`
  - `registerEphemeralTheme(id, definition)`
  - `unregisterTheme(id)`
  - `unregisterEphemeralTheme(id)`
  - `loadExternalTheme(url)`
  - `applyTemporaryTheme(themeId, label?)`
  - `restoreUserTheme()`
- **State:**
  - `atmosphere: string`
  - `currentTheme: VoidThemeDefinition`
  - `registry: Record<string, VoidThemeDefinition>`
  - `userConfig: UserConfig`
  - `availableAtmospheres: string[]`
  - `builtInAtmospheres: string[]`
  - `customAtmospheres: string[]`
  - `hasTemporaryTheme: boolean`
  - `temporaryThemeInfo: { id, label, returnTo } | null`
- **Related:** `themes-button`, `modal`

**When to use.** Import the singleton; never instantiate your own engine. Prefer setAtmosphere/setPreferences for normal user flows and the temporary-theme API for previews or story-scoped overrides.

**Example:**

```ts
import { voidEngine } from '@adapters/void-engine.svelte'; voidEngine.setAtmosphere('paper');
```

## Class-Recipe Patterns

### `button-native`

There is no Button.svelte. Native <button> already gets base button styling (sentence case, medium weight); use ActionBtn or IconBtn when you need icon animation wiring. Add btn-loud for opt-in uppercase + semibold treatment.

**Usage:**

```svelte
<button class='btn-cta'>Save</button>
```
- **Variants:** `default`, `btn-cta`, `btn-premium`, `btn-system`, `btn-success`, `btn-error`, `btn-ghost`, `btn-void`, `btn-icon`, `btn-loud`

### `dismiss-button`

Modal dismiss and cancel actions use btn-ghost btn-error, not a plain ghost button.

**Usage:**

```svelte
<button class='btn-ghost btn-error'>Cancel</button>
```

### `shimmer-surface`

Loading shimmer treatment for Skeleton or custom placeholders.

**Usage:**

```svelte
class='shimmer-surface surface-raised'
```

### `surface-raised`

Static floating surface for cards and primary containers.

**Usage:**

```svelte
class='surface-raised p-lg'
```
- **Spacing:** p-lg and gap-lg are the default card recipe

### `surface-raised-action`

Interactive floating surface for clickable cards and tiles.

**Usage:**

```svelte
class='surface-raised-action p-md'
```
- **Spacing:** p-md and gap-md are the usual clickable-card recipe

### `surface-spotlight`

Raised-within-sunk. Default nested fill inside surface-sunk — highlighted content, callouts, emphasized rows. Canonical flow: canvas → raised → sunk → spotlight.

**Usage:**

```svelte
class='surface-spotlight p-md'
```
- **Spacing:** p-md and gap-md work well for highlighted content inside a sunk well

### `surface-sunk`

Recessed surface for inputs, wells, sidebar blocks, and grouped controls.

**Usage:**

```svelte
class='surface-sunk p-md'
```
- **Spacing:** p-md and gap-md are the default inset recipe

### `surface-void`

Sunk-within-sunk. Last-priority surface — use when content should recede further than sunk: scrollable viewports, overflow clippers, solid masking bars, opaque headers. Prefer surface-spotlight for standard nested content.

**Usage:**

```svelte
class='surface-void p-md'
```
- **Spacing:** p-md for scroll/overflow containers; otherwise matches host context

## Layouts

### `inline-actions`

Responsive action row for buttons, toggles, and chips.

**Usage:**

```svelte
class='flex flex-row flex-wrap gap-md justify-center'
```

### `page-stack`

Standard top-level page column used by the homepage and component docs.

**Usage:**

```svelte
class='container flex flex-col gap-2xl py-2xl'
```

### `section-stack`

Default vertical section grouping with generous page rhythm.

**Usage:**

```svelte
class='flex flex-col gap-xl'
```

### `settings-grid`

Prefer the SettingsRow component instead of hand-rolling label and control alignment.

**Usage:**

```svelte
<SettingsRow label='Density'>...</SettingsRow>
```

### `split-grid`

Standard responsive two-column content or stats layout.

**Usage:**

```svelte
class='grid grid-cols-1 tablet:grid-cols-2 gap-lg'
```

### `surface-stack-lg`

Primary card composition for content blocks and demos.

**Usage:**

```svelte
class='surface-raised p-lg flex flex-col gap-lg'
```

### `surface-stack-md`

Inset grouped-controls composition for nested sections.

**Usage:**

```svelte
class='surface-sunk p-md flex flex-col gap-md'
```

## Physics Participation Attributes

Wrapper-only attribute API for foreign markup that needs to opt into Void Energy physics without rewriting through Svelte primitives.

### `data-ve-content`

**Values:** `primary`, `secondary`, `muted`

Sets color to --text-main / --text-dim / --text-mute. Cascades into descendants that don't override their own color. Independent of data-ve-surface — use either or both. Source of truth: src/styles/components/_participation.scss.

**Usage:**

```html
<div data-ve-content='primary'>...</div>
```

### `data-ve-emphasis`

**Values:** `strong`, `subtle`, `none`

Modulates a surface's border + shadow. Requires data-ve-surface on the same element to take effect — without a base surface, there is nothing to modulate. Source of truth: src/styles/components/_participation.scss.

**Usage:**

```html
<div data-ve-surface='raised' data-ve-emphasis='strong'>...</div>
```

### `data-ve-surface`

**Values:** `raised`, `sunk`, `floating`, `flat`

Wrapper-only attribute API for VE surface physics (background, border, radius, shadow). Styles only the element it is set on; surface treatment does not propagate to descendants. Wrapping a foreign design-system component (MUI Card, Chakra Card) produces visible card-in-card — use on your own divs, not as a foreign-component wrapper. Source of truth: src/styles/components/_participation.scss. Full decision tree: packages/void-energy-tailwind/INTEGRATIONS.md (Physics participation contract).

**Usage:**

```html
<div data-ve-surface='raised' class='p-lg'>...</div>
```

## Import Index

Every public import path, in one block. Treat as a copy/paste reference; do not invent alias roots.

```ts
import { aura } from '@actions/aura';
import { createPasswordValidation } from '@lib/password-validation.svelte';
import { draggable } from '@actions/drag';
import { dropTarget } from '@actions/drag';
import { extractAura } from '@lib/aura';
import { fontShift } from '@actions/font-shift';
import { kinetic } from '@actions/kinetic';
import { laserAim } from '@actions/laser-aim';
import { layerStack } from '@lib/layer-stack.svelte';
import { modal } from '@lib/modal-manager.svelte';
import { morph } from '@actions/morph';
import { navlink } from '@actions/navlink';
import { reorderByDrop } from '@actions/drag';
import { resolveReorderByDrop } from '@actions/drag';
import { shortcutRegistry } from '@lib/shortcut-registry.svelte';
import { toast } from '@stores/toast.svelte';
import { tooltip } from '@actions/tooltip';
import { typewrite } from '@actions/kinetic';
import { user } from '@stores/user.svelte';
import { voidEngine } from '@adapters/void-engine.svelte';
import ActionBtn from '@components/ui/ActionBtn.svelte';
import AdaptiveImage from '@components/ui/AdaptiveImage.svelte';
import AtmosphereScope from '@components/core/AtmosphereScope.svelte';
import Avatar from '@components/ui/Avatar.svelte';
import BarChart from '@components/ui/BarChart.svelte';
import Breadcrumbs from '@components/ui/Breadcrumbs.svelte';
import ColorField from '@components/ui/ColorField.svelte';
import Combobox from '@components/ui/Combobox.svelte';
import CopyField from '@components/ui/CopyField.svelte';
import DonutChart from '@components/ui/DonutChart.svelte';
import Dropdown from '@components/ui/Dropdown.svelte';
import DropZone from '@components/ui/DropZone.svelte';
import EditField from '@components/ui/EditField.svelte';
import EditTextarea from '@components/ui/EditTextarea.svelte';
import FormField from '@components/ui/FormField.svelte';
import GenerateField from '@components/ui/GenerateField.svelte';
import GenerateTextarea from '@components/ui/GenerateTextarea.svelte';
import IconBtn from '@components/ui/IconBtn.svelte';
import Image from '@components/ui/Image.svelte';
import LineChart from '@components/ui/LineChart.svelte';
import LiquidGlassFilter from '@components/core/LiquidGlassFilter.svelte';
import LoadMore from '@components/ui/LoadMore.svelte';
import Markdown from '@components/ui/Markdown.svelte';
import MediaScrubber from '@components/ui/MediaScrubber.svelte';
import MediaSlider from '@components/ui/MediaSlider.svelte';
import Pagination from '@components/ui/Pagination.svelte';
import PasswordChecklist from '@components/ui/PasswordChecklist.svelte';
import PasswordField from '@components/ui/PasswordField.svelte';
import PasswordMeter from '@components/ui/PasswordMeter.svelte';
import ProfileBtn from '@components/ui/ProfileBtn.svelte';
import ProgressRing from '@components/ui/ProgressRing.svelte';
import PullRefresh from '@components/ui/PullRefresh.svelte';
import SearchField from '@components/ui/SearchField.svelte';
import Selector from '@components/ui/Selector.svelte';
import SettingsRow from '@components/ui/SettingsRow.svelte';
import Sidebar from '@components/ui/Sidebar.svelte';
import Skeleton from '@components/ui/Skeleton.svelte';
import SliderField from '@components/ui/SliderField.svelte';
import Sparkline from '@components/ui/Sparkline.svelte';
import StatCard from '@components/ui/StatCard.svelte';
import Switcher from '@components/ui/Switcher.svelte';
import Tabs from '@components/ui/Tabs.svelte';
import ThemeBuilder from '@components/ui/ThemeBuilder.svelte';
import ThemesBtn from '@components/ui/ThemesBtn.svelte';
import Toggle from '@components/ui/Toggle.svelte';
import Video from '@components/ui/Video.svelte';
```

## Registry-Level Rules

- There is no generic Button.svelte. Use native <button> with btn-* classes for text-only actions; prefer ActionBtn/IconBtn when an action benefits from an interactive icon.
- AI and generation actions should default to Sparkle via ActionBtn/IconBtn unless a more specific interactive icon is a better semantic match.
- Use FormField for label, hint, error, and ARIA wiring around form controls.
- Modal and toast are manager-driven. Their shells are mounted globally; use the modal/toast APIs instead of rendering new instances.
- Prefer native HTML when the platform already provides the right semantics. A missing wrapper does not imply a missing capability.
