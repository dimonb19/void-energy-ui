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
}
export interface PsychologyEntry {
  handle: number;
  variant: PsychologyLayer;
  intensity: AmbientIntensity;
}
export interface EnvironmentEntry {
  handle: number;
  variant: EnvironmentLayer;
  intensity: AmbientIntensity;
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
  ): number;
  push(
    category: 'psychology',
    variant: PsychologyLayer,
    intensity?: AmbientIntensity,
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
  ): number {
    const handle = ++this.#handle;
    if (category === 'atmosphere') {
      this.atmosphere = [
        ...this.atmosphere,
        { handle, variant: variant as AtmosphereLayer, intensity },
      ];
    } else if (category === 'psychology') {
      this.psychology = [
        ...this.psychology,
        { handle, variant: variant as PsychologyLayer, intensity },
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
   * Mutate an existing entry in place. Render continuity is preserved while
   * the handle stays the same (keyed by handle in AmbientHost).
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
      next[a] = {
        ...next[a],
        variant: variant as AtmosphereLayer,
        intensity: intensity ?? next[a].intensity,
      };
      this.atmosphere = next;
      return true;
    }
    const p = this.psychology.findIndex((e) => e.handle === handle);
    if (p >= 0) {
      const next = [...this.psychology];
      next[p] = {
        ...next[p],
        variant: variant as PsychologyLayer,
        intensity: intensity ?? next[p].intensity,
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

  /** Remove an entry by handle. Idempotent — safe on stale handles. */
  release(handle: number): void {
    const a = this.atmosphere.filter((e) => e.handle !== handle);
    if (a.length !== this.atmosphere.length) {
      this.atmosphere = a;
      return;
    }
    const p = this.psychology.filter((e) => e.handle !== handle);
    if (p.length !== this.psychology.length) {
      this.psychology = p;
      return;
    }
    const env = this.environment.filter((e) => e.handle !== handle);
    if (env.length !== this.environment.length) {
      this.environment = env;
    }
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
