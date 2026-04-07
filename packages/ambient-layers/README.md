# @dgrslabs/void-energy-ambient-layers

Premium full-viewport ambient overlay layers for Void Energy hosts.

Each layer is a `pointer-events: none` Svelte component that renders a fixed full-viewport
overlay above page content and below UI chrome. Layers adapt to the active physics preset
(glass / flat / retro) and color mode (light / dark) automatically via the host's
`<html data-physics data-mode>` runtime contract.

## Status

`0.1.0` ships **SnowLayer**. Rain, Fog, and Blood arrive in subsequent slices of
[Phase 1 — Ambient Layers](../../plans/phase-1-ambient-layers.md).

## Usage

```svelte
<script lang="ts">
  import { SnowLayer } from '@dgrslabs/void-energy-ambient-layers';
  import '@dgrslabs/void-energy-ambient-layers/styles';
</script>

<SnowLayer intensity={0.7} flakeCount="medium" wind={0.4} />
```

## Common props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `intensity` | `number` | `0.5` | Effect strength, 0..1. Scales opacity. |
| `enabled` | `boolean` | `true` | When false the layer is removed from the DOM. |
| `reducedMotion` | `'respect' \| 'ignore' \| 'auto'` | `'respect'` | Honour `prefers-reduced-motion`. |
| `class` | `string` | `''` | Extra classes on the root layer. |

## SnowLayer-specific props

| Prop | Type | Default |
|---|---|---|
| `wind` | `number` (0..1) | `0.3` |
| `flakeCount` | `'sparse' \| 'medium' \| 'heavy'` | `'medium'` |

## Build

```
npm --workspace @dgrslabs/void-energy-ambient-layers run build
```
