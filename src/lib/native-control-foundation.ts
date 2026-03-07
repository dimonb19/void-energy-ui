/*
 * Shared foundation for native-backed UI controls.
 * Component-rendered IDs come from Svelte's $props.id() for hydration safety.
 * The runtime counter below is reserved for client-only DOM created after mount.
 */

let stableIdCounter = 0;

export function createStableId(prefix: string, explicitId?: string) {
  return explicitId ?? `${prefix}-${++stableIdCounter}`;
}

export function toNativeControlState(isActive: boolean) {
  return isActive ? 'active' : undefined;
}

export function toNativeControlValue(
  value: string | number | null | undefined,
) {
  return value == null ? '' : String(value);
}
