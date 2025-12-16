/*
 * ROLE: Tooltip action for Svelte.
 * RESPONSIBILITY: Bridges Svelte DOM lifecycle to the VoidTooltip logic core.
 */

import { VoidTooltip, type VoidTooltipOptions } from '../lib/void-tooltip';

export function tooltip(
  node: HTMLElement,
  params: string | VoidTooltipOptions,
) {
  // Normalize input
  let config: VoidTooltipOptions =
    typeof params === 'string' ? { content: params } : params;

  // Initialize Logic Core
  const tooltipInstance = new VoidTooltip(node, config);

  return {
    update(newParams: string | VoidTooltipOptions) {
      const newConfig =
        typeof newParams === 'string' ? { content: newParams } : newParams;

      tooltipInstance.update(newConfig);
    },
    destroy() {
      tooltipInstance.destroy();
    },
  };
}
