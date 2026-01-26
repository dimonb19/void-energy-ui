/* Svelte action wrapper for VoidTooltip. */

import { VoidTooltip } from '@lib/void-tooltip';

export function tooltip(
  node: HTMLElement,
  params: string | VoidTooltipOptions,
) {
  // Accept string shorthand or full options object.
  const config: VoidTooltipOptions =
    typeof params === 'string' ? { content: params } : params;

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
