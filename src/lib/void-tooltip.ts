/*
 * VOID TOOLTIP ENGINE (Floating UI adapter)
 * Role: Compute position, manage DOM lifecycle, and align with physics timing.
 * Architecture: Uses the Popover API to escape stacking contexts; styling is
 * driven by CSS via data-state attributes.
 */

import {
  computePosition,
  autoUpdate,
  offset,
  flip,
  shift,
} from '@floating-ui/dom';

export class VoidTooltip {
  private trigger: HTMLElement;
  private tooltip: HTMLElement | null = null;
  private cleanupPositioning: (() => void) | null = null;
  private options: VoidTooltipOptions;

  // Bound handlers for proper cleanup
  private boundShow: () => void;
  private boundHide: () => void;

  constructor(node: HTMLElement, options: VoidTooltipOptions) {
    this.trigger = node;
    this.options = { placement: 'top', ...options };

    // Bind handlers once for consistent reference
    this.boundShow = this.show.bind(this);
    this.boundHide = this.hide.bind(this);

    this.init();
  }

  private init() {
    const showEvents = ['pointerenter', 'focus'];
    const hideEvents = ['pointerleave', 'blur'];

    showEvents.forEach((evt) =>
      this.trigger.addEventListener(evt, this.boundShow),
    );
    hideEvents.forEach((evt) =>
      this.trigger.addEventListener(evt, this.boundHide),
    );
  }

  private show() {
    if (this.tooltip) return;

    // Create the popover element and content.
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'void-tooltip';
    this.tooltip.textContent = this.options.content;

    // Promote to the Top Layer to bypass z-index stacking contexts.
    this.tooltip.popover = 'manual';

    // Apply a11y attributes; physics styling stays in CSS.
    const id = `tooltip-${Math.random().toString(36).substr(2, 9)}`;
    this.tooltip.setAttribute('id', id);
    this.tooltip.setAttribute('role', 'tooltip');
    this.trigger.setAttribute('aria-describedby', id);

    // Mount to body to escape local stacking contexts.
    document.body.appendChild(this.tooltip);
    this.tooltip.showPopover();

    // Keep position synced with Floating UI.
    this.cleanupPositioning = autoUpdate(this.trigger, this.tooltip, () => {
      if (!this.tooltip) return;
      computePosition(this.trigger, this.tooltip, {
        placement: this.options.placement,
        middleware: [offset(12), flip(), shift({ padding: 10 })],
      }).then(({ x, y }) => {
        Object.assign(this.tooltip!.style, {
          left: `${x}px`,
          top: `${y}px`,
          position: 'absolute',
        });
      });
    });

    // Allow a paint before applying the entry state.
    requestAnimationFrame(() => {
      if (this.tooltip) this.tooltip.setAttribute('data-state', 'open');
    });
  }

  private hide() {
    if (!this.tooltip) return;
    const el = this.tooltip;

    // Trigger CSS exit state.
    el.setAttribute('data-state', 'closed');

    const destroy = () => {
      if (this.cleanupPositioning) this.cleanupPositioning();
      try {
        el.hidePopover();
        el.remove();
      } catch (e) {
        // Ignore race conditions where the element is already gone.
      }
      this.trigger.removeAttribute('aria-describedby');
      this.tooltip = null;
    };

    // Align DOM removal with CSS transition duration (retro returns 0).
    const styles = getComputedStyle(el);
    const duration = parseFloat(styles.transitionDuration);

    if (duration === 0) {
      destroy();
    } else {
      el.addEventListener('transitionend', destroy, { once: true });
    }
  }

  public update(newOptions: Partial<VoidTooltipOptions>) {
    this.options = { ...this.options, ...newOptions };
    if (this.tooltip) {
      this.tooltip.textContent = this.options.content || '';
    }
  }

  public destroy() {
    // Remove event listeners to prevent memory leaks
    const showEvents = ['pointerenter', 'focus'];
    const hideEvents = ['pointerleave', 'blur'];

    showEvents.forEach((evt) =>
      this.trigger.removeEventListener(evt, this.boundShow),
    );
    hideEvents.forEach((evt) =>
      this.trigger.removeEventListener(evt, this.boundHide),
    );

    this.hide();
  }
}
