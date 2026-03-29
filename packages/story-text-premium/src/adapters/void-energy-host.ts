import type {
  TextStyleSnapshot,
  VoidEnergyTextStyleSnapshotInput,
} from '../types';

export function createVoidEnergyTextStyleSnapshot(
  input: VoidEnergyTextStyleSnapshotInput,
): TextStyleSnapshot {
  return {
    font: input.font,
    lineHeight: input.lineHeight,
    physics: input.physics,
    mode: input.mode,
    density: input.density ?? 1,
    scale: input.scale ?? 1,
    vars: input.vars ?? {},
  };
}
