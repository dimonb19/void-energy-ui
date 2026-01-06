/* ==========================================================================
   VOID TOOLTIP ENGINE (Floating UI Adapter)
   ========================================================================== 
   
   ROLE: The Mathematical Core.
   RESPONSIBILITY: 
   1. Calculates coordinates using Floating UI (Math).
   2. Manages the DOM lifecycle (Creation/Destruction).
   3. Enforces Physics-aware entry/exit delays (Retro vs. Glass).

  ARCHITECTURE:
   1. Uses native Popover API to enter the "Top Layer".
   2. Solves the "Z-Index War" by bypassing stacking contexts entirely.
   
   NOTE: This is a headless class. It does not handle styles, only 
   positioning and state attributes (data-state).
   ========================================================================== */

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

  constructor(node: HTMLElement, options: VoidTooltipOptions) {
    this.trigger = node;
    this.options = { placement: 'top', ...options };
    this.init();
  }

  private init() {
    const showEvents = ['pointerenter', 'focus'];
    const hideEvents = ['pointerleave', 'blur'];

    showEvents.forEach((evt) =>
      this.trigger.addEventListener(evt, () => this.show()),
    );
    hideEvents.forEach((evt) =>
      this.trigger.addEventListener(evt, () => this.hide()),
    );
  }

  private show() {
    if (this.tooltip) return;

    // 1. Create DOM (The "Skin" Hook)
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'void-tooltip';
    this.tooltip.textContent = this.options.content;

    // This promotes the element to the Top Layer, instantly beating all z-indices.
    this.tooltip.popover = 'manual';

    // 2. Physics & A11y Attributes
    // We rely on global CSS for physics, but enforce accessibility roles here.
    const id = `tooltip-${Math.random().toString(36).substr(2, 9)}`;
    this.tooltip.setAttribute('id', id);
    this.tooltip.setAttribute('role', 'tooltip');
    this.trigger.setAttribute('aria-describedby', id);

    // 3. Mount to Body (Escapes stacking contexts of Cards/Modals)
    document.body.appendChild(this.tooltip);
    this.tooltip.showPopover(); // Native API call

    // 4. Start Floating UI (The Math)
    this.cleanupPositioning = autoUpdate(this.trigger, this.tooltip, () => {
      if (!this.tooltip) return;
      computePosition(this.trigger, this.tooltip, {
        placement: this.options.placement,
        middleware: [
          offset(12), // Spacing from trigger
          flip(), // Flip if no space
          shift({ padding: 10 }), // Keep on screen
        ],
      }).then(({ x, y }) => {
        Object.assign(this.tooltip!.style, {
          left: `${x}px`,
          top: `${y}px`,
          position: 'absolute', // Floating UI handles the coords relative to body
        });
      });
    });

    // 5. Trigger Materialization (CSS Entry)
    // Use requestAnimationFrame to ensure the DOM paint happens before class switch
    requestAnimationFrame(() => {
      if (this.tooltip) this.tooltip.setAttribute('data-state', 'open');
    });
  }

  private hide() {
    if (!this.tooltip) return;
    const el = this.tooltip;

    // 1. Trigger Dematerialization (CSS Exit)
    el.setAttribute('data-state', 'closed');

    // 2. Cleanup Logic
    const destroy = () => {
      if (this.cleanupPositioning) this.cleanupPositioning();
      try {
        el.hidePopover(); // Clean up native state
        el.remove();
      } catch (e) {
        // Handle race conditions where element is already gone
      }
      this.trigger.removeAttribute('aria-describedby');
      this.tooltip = null;
    };

    // 3. PHYSICS SYNC (The Dematerialization Protocol)
    // We read the computed CSS transition time to determine DOM removal.
    // - Glass Physics: Waits 300ms for the fade-out to complete.
    // - Retro Physics: Returns 0s, triggering instant removal (No ghosting).
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
    this.hide();
  }
}
