/**
 * Font Registry for Dynamic Preloading
 *
 * Maps each theme to its required font files.
 * Used by ThemeScript.astro to preload only the active theme's fonts,
 * eliminating FOUT without wasting bandwidth on unused fonts.
 */

export const FONT_REGISTRY: Record<string, string[]> = {
  // Dark Themes
  void: [
    '/fonts/HankenGrotesk-Regular.woff2',
    '/fonts/HankenGrotesk-Bold.woff2',
  ],
  onyx: ['/fonts/Inter-Regular.woff2', '/fonts/Inter-Bold.woff2'],
  terminal: [
    '/fonts/CourierPrime-Regular.woff2',
    '/fonts/CourierPrime-Bold.woff2',
  ],
  crimson: [
    '/fonts/Merriweather24pt-Regular.woff2',
    '/fonts/Merriweather24pt-Bold.woff2',
  ],
  overgrowth: ['/fonts/Lora-Regular.woff2', '/fonts/Lora-Bold.woff2'],
  velvet: [
    '/fonts/Caveat-Regular.woff2',
    '/fonts/Caveat-Bold.woff2',
    '/fonts/PTSerifCaption-Regular.woff2',
    '/fonts/PTSerif-Bold.woff2',
  ],
  solar: [
    '/fonts/Cinzel-Regular.woff2',
    '/fonts/Cinzel-Bold.woff2',
    '/fonts/PTSerifCaption-Regular.woff2',
    '/fonts/PTSerif-Bold.woff2',
  ],
  nebula: [
    '/fonts/Exo2-Regular.woff2',
    '/fonts/Exo2-Bold.woff2',
    '/fonts/Inter-Regular.woff2',
    '/fonts/Inter-Bold.woff2',
  ],

  // Light Themes
  paper: ['/fonts/PTSerifCaption-Regular.woff2', '/fonts/PTSerif-Bold.woff2'],
  laboratory: ['/fonts/OpenSans-Regular.woff2', '/fonts/OpenSans-Bold.woff2'],
  playground: ['/fonts/ComicNeue-Regular.woff2', '/fonts/ComicNeue-Bold.woff2'],
  focus: ['/fonts/Inter-Regular.woff2', '/fonts/Inter-Bold.woff2'],
};
