/**
 * =====================================================================
 *  VOID ENERGY — BRAND PROFILES (overlay axis on top of atmospheres)
 * =====================================================================
 *
 *  A brand profile carries identity overrides — radii policy, motion
 *  signature, type-treatment, per-role weights — on top of the active
 *  physics and atmosphere palette. Sparse-by-default: most profiles
 *  override only 2-3 fields.
 *
 *  Cascade order (locked, Option B):
 *    global tokens -> physics -> brand overlay -> atmosphere palette
 *
 *  See .claude/rules/theme-creation.md for authoring discipline and
 *  plans/atmosphere-brand-overlay.md for the full architecture.
 *
 *  Phase 1.2 ships the directory + interface + empty registry only.
 *  Reference profiles (Nike, Stripe, Lamborghini) land in Phase 1.5;
 *  catalog profiles in Phase 3.0c.
 * =====================================================================
 */

export interface BrandProfile {
  id: string;
  name: string;

  radii?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    full?: string;
  };

  motion?: {
    speedFast?: number;
    speedBase?: number;
    speedSlow?: number;
    easeSpringGentle?: string;
    easeSpringSnappy?: string;
    easeSpringBounce?: string;
    easeFlow?: string;
  };

  typography?: {
    trackingDisplay?: string;
    trackingHeading?: string;
    trackingBody?: string;
    trackingButton?: string;
    transformButton?: 'none' | 'uppercase' | 'lowercase';
    transformHeading?: 'none' | 'uppercase' | 'lowercase';
    weightButton?: number;
    weightHeading?: number;
    weightDisplay?: number;
  };
}

import { stripe } from './stripe';
import { nike } from './nike';
import { lamborghini } from './lamborghini';

export { stripe, nike, lamborghini };

export const BRANDS: Record<string, BrandProfile> = {
  stripe,
  nike,
  lamborghini,
};
