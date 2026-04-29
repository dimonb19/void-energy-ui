/**
 * Aura Action — Ambient colored glow on a surface.
 *
 * Sets `--aura-color` inline when a color is passed; toggles `data-aura`. All
 * physics gating, transitions, and color crossfade live in SCSS. When `color`
 * is omitted, the SCSS default falls back to `var(--energy-primary)` so the
 * glow tracks the active atmosphere.
 *
 * @example Atmosphere-driven glow
 * <div use:aura>...</div>
 *
 * @example Explicit color
 * <div use:aura={{ color: '#33e2e6' }}>...</div>
 */

interface AuraOptions {
  color?: string;
  enabled?: boolean;
}

function apply(node: HTMLElement, options: AuraOptions) {
  const enabled = options.enabled ?? true;
  if (options.color) {
    node.style.setProperty('--aura-color', options.color);
  } else {
    node.style.removeProperty('--aura-color');
  }
  node.dataset.aura = enabled ? 'on' : 'off';
}

export function aura(node: HTMLElement, options: AuraOptions = {}) {
  apply(node, options);

  return {
    update(next: AuraOptions) {
      apply(node, next);
    },
    destroy() {
      node.style.removeProperty('--aura-color');
      delete node.dataset.aura;
    },
  };
}
