import { describe, expect, it } from 'vitest';

import { VoidTooltip } from '@lib/void-tooltip';

describe('tooltip accessibility wiring', () => {
  it('preserves existing aria-describedby tokens across show and hide', async () => {
    const button = document.createElement('button');
    button.setAttribute('aria-describedby', 'hint error');
    document.body.appendChild(button);

    const tooltip = new VoidTooltip(button, { content: 'Helpful details' });

    button.dispatchEvent(new FocusEvent('focus'));

    const describedBy = button.getAttribute('aria-describedby');
    expect(describedBy).toContain('hint');
    expect(describedBy).toContain('error');
    expect(describedBy?.split(/\s+/)).toHaveLength(3);
    expect(document.body.querySelector('.void-tooltip')).toBeTruthy();

    button.dispatchEvent(new FocusEvent('blur'));

    expect(button.getAttribute('aria-describedby')).toBe('hint error');
    expect(document.body.querySelector('.void-tooltip')).toBeNull();

    tooltip.destroy();
  });
});
