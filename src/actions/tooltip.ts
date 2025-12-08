import tippy, { type Props, type Instance } from 'tippy.js';

interface TooltipParams {
  content: string;
  placement?: Props['placement'];
}

export function tooltip(node: HTMLElement, params: string | TooltipParams) {
  // 1. Normalize params
  let config: TooltipParams =
    typeof params === 'string' ? { content: params } : params;

  // 2. Initialize Tippy
  const tip: Instance = tippy(node, {
    content: config.content,
    theme: 'void', // Maps to components/_tooltips.scss
    animation: 'materialize', // The custom Void physics animation
    placement: config.placement || 'top',
    arrow: false, // Floating glass look
    offset: [0, 8], // Distance from target
    maxWidth: 250,
    interactive: false, // Performance optimization
    appendTo: () => document.body,
  });

  return {
    update(newParams: string | TooltipParams) {
      const newConfig =
        typeof newParams === 'string' ? { content: newParams } : newParams;

      tip.setProps({
        content: newConfig.content,
        placement: newConfig.placement || 'top',
      });
    },
    destroy() {
      tip.destroy();
    },
  };
}
