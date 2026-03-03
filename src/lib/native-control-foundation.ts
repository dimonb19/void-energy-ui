/*
 * Shared foundation for native-backed UI controls.
 * Keeps ID/group generation and state/value normalization consistent.
 */

let nativeControlCounter = 0;

export function createNativeControlIdentity(
  prefix: string,
  explicitId?: string,
) {
  const id = explicitId ?? `${prefix}-${++nativeControlCounter}`;
  return {
    id,
    groupName: `${id}-group`,
  };
}

export function toNativeControlState(isActive: boolean) {
  return isActive ? 'active' : undefined;
}

export function toNativeControlValue(
  value: string | number | null | undefined,
) {
  return value == null ? '' : String(value);
}
