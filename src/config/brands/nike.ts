import type { BrandProfile } from './index';

/**
 * Nike — ceiling shape. Tight-tracked uppercase buttons, heavy display weights,
 * gentle 4px-base radii. The reference for the heaviest reasonable brand still
 * expressed as a single sparse object.
 *
 * h5/h6 stay on `--font-weight-medium` per Phase 1.4 — the heading-mixin port
 * stops at h3/h4 reading `--weight-heading`. weightHeading: 900 reaches h3/h4;
 * weightDisplay: 900 reaches h1/h2.
 */
export const nike: BrandProfile = {
  id: 'nike',
  name: 'Nike',

  radii: {
    sm: '2px',
    md: '4px',
    lg: '6px',
    xl: '8px',
  },

  typography: {
    trackingButton: '0.08em',
    trackingHeading: '0.04em',
    transformButton: 'uppercase',
    transformHeading: 'uppercase',
    weightButton: 700,
    weightHeading: 900,
    weightDisplay: 900,
  },
};
