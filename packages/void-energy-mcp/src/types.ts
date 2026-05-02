/*
 * Local type aliases — kept narrow so the package never imports L1 ambient
 * types. The shapes mirror src/types/void-ui.d.ts (VoidThemeDefinition,
 * PartialThemeDefinition, VoidPalette) but stay local for runtime isolation.
 */

export type VoidPhysics = 'glass' | 'flat' | 'retro';
export type VoidMode = 'dark' | 'light';

export type VoidPalette = Record<string, string>;

export interface ThemeFont {
  name: string;
  url: string;
}

export interface VoidThemeDefinition {
  id?: string;
  label?: string;
  tagline?: string;
  mode: VoidMode;
  physics: VoidPhysics;
  palette: VoidPalette;
  fonts?: ThemeFont[];
}

export type PartialThemeDefinition = {
  id?: string;
  label?: string;
  tagline?: string;
  mode?: VoidMode;
  physics?: VoidPhysics;
  palette?: Partial<VoidPalette>;
  fonts?: ThemeFont[];
};

export interface AtmosphereSnapshot {
  id: string;
  label: string;
  mode: VoidMode;
  physics: VoidPhysics;
  tagline: string;
  palette: VoidPalette;
}

export type AtmospheresSnapshot = Record<string, AtmosphereSnapshot>;
