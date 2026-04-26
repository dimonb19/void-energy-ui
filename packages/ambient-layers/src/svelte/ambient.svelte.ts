/**
 * 🌫️ AMBIENT SINGLETON
 *
 * Reactive state coordinator for the ambient layer system. Mount
 * `<AmbientHost />` once in your app shell, then drive it from anywhere:
 *
 * ```ts
 * import { ambient } from '@void-energy/ambient-layers';
 *
 * // Persistent layer — returns a handle; call release(handle) to remove.
 * const h = ambient.push('atmosphere', 'rain', 'medium');
 * ambient.release(h);
 *
 * // One-shot burst — auto-clears when the animation completes.
 * ambient.fire('impact', 'high');
 *
 * // Scoped usage via $effect cleanup:
 * $effect(() => {
 *   const h = ambient.push('environment', 'night');
 *   return () => ambient.release(h);
 * });
 * ```
 *
 * The three persistent categories are multi-stack: multiple entries may be
 * active simultaneously. Use stacking to combine tints/moods, or push once
 * per category for single-entry behavior.
 */

import type {
  AmbientIntensity,
  AtmosphereLayer,
  PsychologyLayer,
  EnvironmentLayer,
  ActionLayer,
} from '../types';

export type PersistentCategory = 'atmosphere' | 'psychology' | 'environment';

export interface AtmosphereEntry {
  handle: number;
  variant: AtmosphereLayer;
  intensity: AmbientIntensity;
  // 0 = pinned at intensity (default). undefined = decay using the variant's
  // built-in duration. Any positive number overrides the per-step duration.
  durationMs?: number;
  // When set (via `release(handle, ms)`), the layer falls to 0 over this
  // many ms flat and self-releases. Aborts any in-flight rise/decay.
  fadeMs?: number;
}
export interface PsychologyEntry {
  handle: number;
  variant: PsychologyLayer;
  intensity: AmbientIntensity;
  durationMs?: number;
  fadeMs?: number;
}
export interface EnvironmentEntry {
  handle: number;
  variant: EnvironmentLayer;
  intensity: AmbientIntensity;
  fadeMs?: number;
}
export interface ActionEntry {
  id: number;
  variant: ActionLayer;
  intensity: AmbientIntensity;
}

export class Ambient {
  // $state.raw: mutations reassign the array reference; reads inside the host's
  // `{#each}` track the handle, not individual entries. This avoids
  // self-referential tracking when consumers push inside $effect.
  atmosphere = $state.raw<AtmosphereEntry[]>([]);
  psychology = $state.raw<PsychologyEntry[]>([]);
  environment = $state.raw<EnvironmentEntry[]>([]);
  actions = $state.raw<ActionEntry[]>([]);

  #handle = 0;
  #actionId = 0;

  push(
    category: 'atmosphere',
    variant: AtmosphereLayer,
    intensity?: AmbientIntensity,
    decay?: boolean,
  ): number;
  push(
    category: 'psychology',
    variant: PsychologyLayer,
    intensity?: AmbientIntensity,
    decay?: boolean,
  ): number;
  push(
    category: 'environment',
    variant: EnvironmentLayer,
    intensity?: AmbientIntensity,
  ): number;
  push(
    category: PersistentCategory,
    variant: AtmosphereLayer | PsychologyLayer | EnvironmentLayer,
    intensity: AmbientIntensity = 'medium',
    decay: boolean = false,
  ): number {
    const handle = ++this.#handle;
    // decay=false → durationMs:0 (pinned, default). decay=true → undefined,
    // which AtmosphereLayer/PsychologyLayer resolve to the variant default.
    const durationMs = decay ? undefined : 0;
    if (category === 'atmosphere') {
      this.atmosphere = [
        ...this.atmosphere,
        { handle, variant: variant as AtmosphereLayer, intensity, durationMs },
      ];
    } else if (category === 'psychology') {
      this.psychology = [
        ...this.psychology,
        { handle, variant: variant as PsychologyLayer, intensity, durationMs },
      ];
    } else {
      this.environment = [
        ...this.environment,
        { handle, variant: variant as EnvironmentLayer, intensity },
      ];
    }
    return handle;
  }

  /**
   * Mutate an existing entry's variant/intensity in place. Render
   * continuity is preserved while the handle stays the same (keyed by
   * handle in AmbientHost). `durationMs` is preserved — use `decay()` to
   * change the auto-decay lifecycle independently.
   *
   * Returns false if the handle is stale.
   */
  update(
    handle: number,
    variant: AtmosphereLayer | PsychologyLayer | EnvironmentLayer,
    intensity?: AmbientIntensity,
  ): boolean {
    const a = this.atmosphere.findIndex((e) => e.handle === handle);
    if (a >= 0) {
      const next = [...this.atmosphere];
      const cur = next[a];
      next[a] = {
        ...cur,
        variant: variant as AtmosphereLayer,
        intensity: intensity ?? cur.intensity,
      };
      this.atmosphere = next;
      return true;
    }
    const p = this.psychology.findIndex((e) => e.handle === handle);
    if (p >= 0) {
      const next = [...this.psychology];
      const cur = next[p];
      next[p] = {
        ...cur,
        variant: variant as PsychologyLayer,
        intensity: intensity ?? cur.intensity,
      };
      this.psychology = next;
      return true;
    }
    const env = this.environment.findIndex((e) => e.handle === handle);
    if (env >= 0) {
      const next = [...this.environment];
      next[env] = {
        ...next[env],
        variant: variant as EnvironmentLayer,
        intensity: intensity ?? next[env].intensity,
      };
      this.environment = next;
      return true;
    }
    return false;
  }

  /**
   * Convert a pinned atmosphere/psychology entry into a decaying one. The
   * entry's `durationMs` flips to `undefined` (or the override), which
   * AtmosphereLayer/PsychologyLayer pick up and animate to zero — when the
   * fade completes, AmbientHost's `onEnd` releases the handle.
   *
   * Returns `false` if the handle is stale or points to an environment
   * entry (Environment layers don't decay — caller should `release()`
   * those directly).
   */
  decay(handle: number, durationMs?: number): boolean {
    const a = this.atmosphere.findIndex((e) => e.handle === handle);
    if (a >= 0) {
      const next = [...this.atmosphere];
      next[a] = { ...next[a], durationMs };
      this.atmosphere = next;
      return true;
    }
    const p = this.psychology.findIndex((e) => e.handle === handle);
    if (p >= 0) {
      const next = [...this.psychology];
      next[p] = { ...next[p], durationMs };
      this.psychology = next;
      return true;
    }
    return false;
  }

  /**
   * Remove a persistent entry by handle. Fades the layer out smoothly
   * (default 1000ms) and self-cleans when the fade completes — so callers
   * just say "release this" and the visual transition happens automatically.
   *
   * Pass `totalMs: 0` to remove the entry immediately (no fade). This is
   * what AmbientHost uses internally after a fade finishes.
   *
   * Idempotent — safe on stale handles. Aborts any in-flight rise/decay.
   */
  release(handle: number, totalMs: number = 1000): boolean {
    if (totalMs <= 0) return this._releaseImmediate(handle);
    const a = this.atmosphere.findIndex((e) => e.handle === handle);
    if (a >= 0) {
      const next = [...this.atmosphere];
      next[a] = { ...next[a], fadeMs: totalMs };
      this.atmosphere = next;
      return true;
    }
    const p = this.psychology.findIndex((e) => e.handle === handle);
    if (p >= 0) {
      const next = [...this.psychology];
      next[p] = { ...next[p], fadeMs: totalMs };
      this.psychology = next;
      return true;
    }
    const env = this.environment.findIndex((e) => e.handle === handle);
    if (env >= 0) {
      const next = [...this.environment];
      next[env] = { ...next[env], fadeMs: totalMs };
      this.environment = next;
      return true;
    }
    return false;
  }

  /**
   * Hard-remove an entry from the store. Used by AmbientHost when a layer
   * has finished its fade-out and is ready to truly unmount. Not for public
   * use — call `release(handle)` instead.
   *
   * @internal
   */
  _releaseImmediate(handle: number): boolean {
    const a = this.atmosphere.filter((e) => e.handle !== handle);
    if (a.length !== this.atmosphere.length) {
      this.atmosphere = a;
      return true;
    }
    const p = this.psychology.filter((e) => e.handle !== handle);
    if (p.length !== this.psychology.length) {
      this.psychology = p;
      return true;
    }
    const env = this.environment.filter((e) => e.handle !== handle);
    if (env.length !== this.environment.length) {
      this.environment = env;
      return true;
    }
    return false;
  }

  /** Fire a one-shot action layer. Auto-clears when the animation ends. */
  fire(variant: ActionLayer, intensity: AmbientIntensity = 'medium'): void {
    this.actions = [
      ...this.actions,
      { id: ++this.#actionId, variant, intensity },
    ];
  }

  /** Clear all entries in a category (or every category if omitted). */
  clear(category?: PersistentCategory | 'action' | 'all'): void {
    if (!category || category === 'all') {
      this.atmosphere = [];
      this.psychology = [];
      this.environment = [];
      this.actions = [];
      return;
    }
    if (category === 'atmosphere') this.atmosphere = [];
    else if (category === 'psychology') this.psychology = [];
    else if (category === 'environment') this.environment = [];
    else this.actions = [];
  }

  /** Internal: AmbientHost calls this when an action's animation completes. */
  _removeAction(id: number): void {
    this.actions = this.actions.filter((a) => a.id !== id);
  }
}

export const ambient = new Ambient();
