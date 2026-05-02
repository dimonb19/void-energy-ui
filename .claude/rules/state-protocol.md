---
paths:
  - "src/**/*.svelte"
  - "src/**/*.scss"
---

# State Protocol (Law 4)

State visible to CSS is expressed via `data-*` attributes or ARIA. Never via utility classes like `is-active`, `open`, `selected`, `loading`.

## Why

ARIA and `data-state` carry semantics — assistive tech and SCSS both read them. Class-name flags carry no semantics; they are CSS-only conventions that drift across files. The system's SCSS toolkit (`when-state`, `[aria-pressed="true"]`, `[data-state="open"]`) targets the semantic surface directly, which means the same selector handles a11y and styling at once.

## Always

```svelte
<button data-state={open ? 'open' : 'closed'} aria-expanded={open}>
<button aria-pressed={active}>
<input role="switch" aria-checked={checked}>
<div data-state="loading">
<li aria-selected={selected}>
```

## Never

```svelte
<button class="is-open">                <!-- WRONG -->
<button class={active ? 'active' : ''}> <!-- WRONG -->
<div class="loading">                   <!-- WRONG -->
<li class="selected">                   <!-- WRONG -->
```

## SCSS Targets the Semantic Surface

```scss
.my-component {
  @include when-state('active') { border-color: var(--energy-primary); }
  @include when-state('open')   { box-shadow: var(--shadow-float); }
  @include when-state('loading'){ opacity: 0.6; }

  &[aria-pressed='true'] { background: var(--energy-primary); }
  &[aria-checked='true'] { /* switch knob position, etc. */ }
}
```

## `when-state` Vocabulary

The `when-state` mixin only knows: `active | open | loading | disabled | error | met`. Anything else compiles cleanly with a Sass `@warn` but emits zero CSS. For other states write the literal selector:

```scss
&[data-state='ready']    { /* ... */ }
&[data-state='paused']   { /* ... */ }
```

## When You Need a Class

Class names are still appropriate for **structural variants** that don't represent reactive state — e.g., `.btn-cta`, `.btn-icon`, `.surface-raised`. The forbidden pattern is using class names to encode **runtime state** (open/closed, active/inactive, loading/idle).
