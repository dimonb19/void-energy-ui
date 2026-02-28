# Phase 6 — Debounce / Throttle Utilities

Foundational timing primitives that SearchField and future components need.

---

## Problem

No reusable `debounce()` or `throttle()` exists. SearchField fires `oninput` on every keystroke — consumers must bring their own debounce. PullRefresh has a hardcoded cooldown (`COOLDOWN_MS = 500`) that acts as a throttle but isn't extracted. A design system should provide these timing primitives.

---

## Files

- **New:** `src/lib/timing.ts`
- `src/components/ui/SearchField.svelte` (lines 29-38 props, lines 62-65 input handler)

---

## Implementation

### `src/lib/timing.ts`

Two pure utility functions — no Svelte dependency, no reactivity:

```typescript
/**
 * Returns a debounced version of `fn` that delays invocation until
 * `ms` milliseconds after the last call.
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  ms: number,
): T & { cancel(): void } {
  let timer: ReturnType<typeof setTimeout>;
  const debounced = (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced as T & { cancel(): void };
}

/**
 * Returns a throttled version of `fn` that invokes at most once
 * per `ms` milliseconds. Trailing call is guaranteed.
 */
export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  ms: number,
): T & { cancel(): void } {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  const throttled = (...args: Parameters<T>) => {
    lastArgs = args;
    if (timer) return;
    fn(...args);
    lastArgs = null;
    timer = setTimeout(() => {
      timer = null;
      if (lastArgs) fn(...lastArgs);
    }, ms);
  };
  throttled.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    lastArgs = null;
  };
  return throttled as T & { cancel(): void };
}
```

### SearchField Integration

Add optional `debounce` prop to SearchField. When set, `oninput` callback is debounced:

```typescript
// In SearchFieldProps interface:
interface SearchFieldProps {
  // ...existing props...
  /** Debounce oninput callback by this many ms. 0 = no debounce (default). */
  delay?: number;
}
```

In the component:
- Import `debounce` from `@lib/timing`
- Create debounced handler: `const debouncedInput = $derived(delay ? debounce(oninput, delay) : oninput)`
- Wire `oninput` on `<input>` to call `debouncedInput` instead of `oninput` directly
- Clean up on destroy (cancel pending debounce)

**Usage after:**
```svelte
<SearchField value={query} oninput={(v) => search(v)} delay={300} />
```

---

## Verification

```bash
npm run check   # TypeScript
```

Manual tests:
- SearchField with `delay={300}` — type rapidly, callback fires only after 300ms pause
- SearchField without `delay` — fires on every keystroke (backward compatible)
- Verify `debounce.cancel()` works (no stale invocations after teardown)
