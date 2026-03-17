---
paths:
  - "src/**/*.svelte"
---

# Component Usage

Before writing markup in any `.svelte` file:

1. Read `src/config/component-registry.json`
2. Find the nearest matching primitive, action, controller, or native-first recipe
3. Reuse it instead of inventing a new wrapper

## Default Bias

- `src/components/app/` composes shipped UI primitives
- `src/components/ui/` is not the place for routine page work
- Native HTML is valid when Void Energy already styles it

## Compose-Only Rules

- Need fields: use `FormField` plus shipped inputs
- Need choices: use `Selector`, `Switcher`, `Tabs`, or `Combobox`
- Need actions: use native `button` with `btn-*`, or `ActionBtn` / `IconBtn`
- Need feedback: use `modal` and `toast`, not new shells
- Need charts or stat displays: use the shipped chart/stat components

## State

- Local UI state: `$state`
- Global/shared state: shipped singletons like `modal`, `toast`, `user`, `voidEngine`
- Do not create new stores for routine page work

If the registry does not cover the need, stop and ask instead of creating a new primitive.
