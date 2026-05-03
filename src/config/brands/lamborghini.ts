import type { BrandProfile } from './index';

/**
 * Lamborghini — motion-forward shape. Zero radii everywhere (including
 * `--radius-full` so pills square off), snappy speeds and a sharper
 * ease-out over the default spring family, heavy display tracking + weight.
 *
 * Exercises the motion axis (Stripe and Nike don't touch it). Glass blur
 * survives — physics floor still wins on blur compositing. Retro reasserts
 * `--radius-full: 0` and `steps()` motion above any brand override
 * (`emit-physics-retro-floor` in `_engine.scss`).
 */
export const lamborghini: BrandProfile = {
  id: 'lamborghini',
  name: 'Lamborghini',

  radii: {
    sm: '0',
    md: '0',
    lg: '0',
    xl: '0',
    full: '0',
  },

  motion: {
    speedFast: 120,
    speedBase: 240,
    easeSpringSnappy: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },

  typography: {
    trackingDisplay: '0.06em',
    weightDisplay: 900,
  },
};
