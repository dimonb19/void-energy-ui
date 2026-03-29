# Phase 5 — Host Adapter and Conexus Consumption

## Goal

Wire the premium package into Void Energy hosts through a formal adapter and make Conexus the first consumer without leaking app-specific logic into the package.

## Inputs and dependencies

- Phase 4 effect engine
- Current Void Energy runtime state and design tokens
- Conexus story-step and TTS orchestration requirements

## In scope

- Void Energy host adapter (full implementation)
- Story cue playback contract
- Conexus wrapper shape and contract
- Story-step prop mapping
- TTS-driven cue timing
- Fallback behavior for hosts without TTS
- Non-VE premium consumer path

## Out of scope

- Premium package publishing (Phase 6)
- Final extraction to another repo (Phase 6)
- Conexus scene authoring UX
- TTS provider integration (Conexus app concern)

## Decisions already locked

- Conexus consumes the package through a wrapper.
- The premium package never imports Conexus-specific code.
- Host apps supply all runtime state through public props and adapter outputs.

## Implementation tasks

### Void Energy host adapter (`src/adapters/void-energy-host.ts`)

1. Expand `createVoidEnergyTextStyleSnapshot` into the real host adapter:
   ```typescript
   export function createVoidEnergyTextStyleSnapshot(
     element: HTMLElement,
     overrides?: Partial<VoidEnergyTextStyleSnapshotInput>,
   ): TextStyleSnapshot {
     const html = document.documentElement;
     const computed = getComputedStyle(element);

     return {
       font: overrides?.font ?? `${computed.fontSize} ${computed.fontFamily}`,
       lineHeight: overrides?.lineHeight ?? parseFloat(computed.lineHeight),
       physics: (overrides?.physics ?? html.dataset.physics ?? 'glass') as PhysicsPreset,
       mode: (overrides?.mode ?? html.dataset.mode ?? 'dark') as ModePreset,
       density: overrides?.density ?? 1,
       scale: overrides?.scale ?? 1,
       vars: overrides?.vars ?? resolveRequiredVars(computed),
     };
   }
   ```
2. Implement `resolveRequiredVars` to extract CSS variable values from computed styles:
   ```typescript
   function resolveRequiredVars(computed: CSSStyleDeclaration): Record<string, string> {
     const varNames = [
       '--speed-fast', '--speed-base', '--speed-slow',
       '--ease-spring-gentle', '--ease-spring-snappy', '--ease-flow',
       '--energy-primary', '--text-main', '--text-dim',
       '--delay-cascade', '--delay-sequence',
       '--physics-blur',
     ];
     const vars: Record<string, string> = {};
     for (const name of varNames) {
       vars[name] = computed.getPropertyValue(name).trim();
     }
     return vars;
   }
   ```
3. Add `system-ui` font warning:
   - If resolved `fontFamily` starts with `system-ui`, log a console warning
   - Explain that Canvas measurement may mismatch; recommend named fonts
4. Document which CSS variables must be forwarded and why.

### Reactive snapshot (app-wrapper concern, NOT package-exported)

5. The premium package does NOT export a reactive snapshot helper. The adapter is a pure function — consumers call it reactively in their own Svelte components. Example pattern in a Conexus wrapper:
   ```svelte
   <!-- ConexusStoryText.svelte (app code, NOT in the package) -->
   <script lang="ts">
     import { createVoidEnergyTextStyleSnapshot } from '@dgrslabs/void-energy-story-text/adapters/void-energy-host';

     let containerEl = $state<HTMLElement>();

     // Re-derive snapshot when VoidEngine state changes
     const snapshot = $derived(
       containerEl ? createVoidEnergyTextStyleSnapshot(containerEl) : null
     );
   </script>
   ```
   Rationale: `$derived` and `$effect` are Svelte runes that can only live in `.svelte` or `.svelte.ts` files. The adapter is a plain `.ts` module and must stay framework-agnostic. Reactive wiring is the consumer's responsibility.

### Conexus wrapper contract

6. Define the Conexus wrapper interface (documented, not implemented in the package):
   ```typescript
   // This lives in the Conexus app, NOT in the premium package
   interface ConexusStoryTextProps {
     step: StoryStep;             // Conexus story step (text + metadata)
     revealMode?: RevealMode;     // Override, or derived from atmosphere
     revealStyle?: RevealStyle;   // Override, or derived from atmosphere
     activeEffect?: StoryTextEffect | null;  // Continuous effect for this step
     cues?: StoryCue[];           // TTS-synced one-shot cues
     onrevealcomplete?: () => void;   // All text visible, cues dispatched
     oneffectscomplete?: () => void;  // All completion-triggered effects finished — safe unmount point
   }
   ```
7. Document the mapping from Conexus story step to `StoryText` props:
   - `step.text` → `text`
   - `step.seed` (or `step.id` hash) → `seed`
   - Atmosphere-derived → `revealMode`, `revealStyle`, `staggerPattern`
   - VoidEngine state → `styleSnapshot` (via host adapter)
   - `step.narrativeEffect` → `activeEffect` (continuous) or → `cues` (one-shot)
   - TTS word boundaries → `cues` with `atMs` timestamps

### TTS cue playback

8. Document the TTS cue authoring contract:
   - TTS providers expose word-level timestamps (Web Speech API `onboundary`, or server-side TTS alignment)
   - The Conexus wrapper converts TTS timestamps to `StoryCue[]`
   - Each cue has `trigger: 'at-time'` with `atMs` relative to reveal start, plus `effect`, `scope`, and optional `range`
   - Completion-triggered cues use `trigger: 'on-complete'` (no `atMs` needed)
   - The premium timeline dispatches cues as playback progresses
9. Timeline cue dispatch:
   - Time-triggered cues sorted by `atMs` ascending, followed by completion-triggered cues
   - On each RAF tick: check if any pending time-triggered cues have `atMs <= elapsed`
   - Dispatch in order; mark as fired by `id` (no double-fire)
   - `trigger: 'at-time'` with `atMs: 0` fires at reveal start
   - `trigger: 'on-complete'` fires when all units are revealed
   - No `Infinity` sentinel — the `trigger` field is the stable contract for JSON-safe cue storage

### Fallback behavior

10. When no TTS track exists:
    - Reveal progresses at standard speed (no TTS-synced pacing)
    - One-shot effects fire on reveal completion (current OSS behavior: `onComplete` → effect)
    - Continuous effects start immediately (current OSS behavior)
11. When TTS is present but text length mismatches cue ranges:
    - Gracefully ignore out-of-range cues
    - Log a dev-mode warning for debugging

### Non-VE premium consumer path

12. Document the minimal setup for a non-VE host:
    - Construct `TextStyleSnapshot` manually (no adapter needed)
    - Pass physics/mode as literal strings
    - Forward any needed CSS variables in `vars`
    - Example in README

## Public APIs or types added or changed

- `createVoidEnergyTextStyleSnapshot` (expanded signature: element + overrides)
- `TextStyleSnapshot` (no change to shape)
- `StoryCue` (no change to shape)
- `StoryTextProps` (no change — already includes all needed fields)

## Tests required

- Host snapshot resolves correct font, physics, mode from live DOM
- Host snapshot invalidates when VoidEngine switches atmosphere
- CSS variable extraction includes all required vars
- `system-ui` warning fires when detected
- TTS cue timing: cues fire at correct `atMs` moments
- Multiple cues on same frame are dispatched in order
- Out-of-range cues are gracefully ignored
- Fallback: reveal works correctly without any cues
- Non-VE consumer: manual `TextStyleSnapshot` produces correct behavior
- Conexus wrapper contract: step mapping is documented and type-safe

## Exit criteria

- Conexus can consume premium `StoryText` without reaching into package internals.
- TTS can trigger one-shot effects at the intended moments.
- Another premium host could adopt the package using only the documented adapter and prop contracts.
- The host adapter resolves all Void Energy runtime state correctly.

## Risks and rollback notes

- Risk: pushing story authoring decisions into the package API.
  Rollback: move scene logic back into the Conexus wrapper and keep package props generic.
- Risk: reactive snapshot creates tight coupling to VoidEngine internals.
  Mitigation: the adapter reads only public DOM state (`data-*` attributes, computed styles), not VoidEngine class internals.
- Risk: TTS boundary events are inconsistent across browsers/providers.
  Mitigation: Conexus wrapper normalizes TTS events before converting to `StoryCue[]`; the package just consumes the cue array.
