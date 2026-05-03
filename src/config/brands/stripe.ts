import type { BrandProfile } from './index';

/**
 * Stripe — calm shape. The "did we accidentally do too much?" reference profile.
 * Sparse-by-default in action: gentle outer-scale radii, one tracking override
 * tighter than the body default, one mechanical ease over the spring family.
 */
export const stripe: BrandProfile = {
  id: 'stripe',
  name: 'Stripe',

  radii: {
    lg: '6px',
    xl: '8px',
  },

  motion: {
    easeSpringGentle: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  typography: {
    trackingBody: '0',
  },
};
