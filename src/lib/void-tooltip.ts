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
import {
  TOOLTIP_OFFSET_PX,
  TOOLTIP_VIEWPORT_PADDING_PX,
} from '@config/ui-geometry';
import { createStableId } from '@lib/native-control-foundation';

function parseIdRefs(value: string | null) {
  return value?.trim().split(/\s+/).filter(Boolean) ?? [];
}

function joinIdRefs(tokens: string[]) {
  return tokens.length > 0 ? tokens.join(' ') : null;
}

function haveSameIdRefs(a: string[], b: string[]) {
  return a.length === b.length && a.every((token, index) => token === b[index]);
}

function parseTransitionDurationMs(value: string): number {
  return value
    .split(',')
    .map((token) => token.trim())
    .reduce((maxDuration, token) => {
      let durationMs = Number.NaN;

      if (token.endsWith('ms')) {
        durationMs = Number.parseFloat(token);
      } else if (token.endsWith('s')) {
        durationMs = Number.parseFloat(token) * 1000;
      }

      return Number.isFinite(durationMs)
        ? Math.max(maxDuration, durationMs)
        : maxDuration;
    }, 0);
}

export class VoidTooltip {
  private trigger: Element;
  private tooltip: HTMLElement | null = null;
  private cleanupPositioning: (() => void) | null = null;
  private options: VoidTooltipOptions;
  private tooltipId: string | null = null;
  private initialDescribedBy: string | null = null;

  private showTimer: ReturnType<typeof setTimeout> | null = null;

  // Touch long-press guard: suppress text selection on non-editable triggers.
  // Editable elements (input, textarea, contenteditable) are skipped so the
  // native paste/select menu is preserved.
  private touchGuarded = false;
  private savedUserSelect = '';
  private savedTouchCallout = '';

  // Bound handlers for proper cleanup
  private boundShow: () => void;
  private boundHide: () => void;
  private boundTouchStart: () => void;
  private boundTouchEnd: () => void;

  constructor(node: Element, options: VoidTooltipOptions) {
    this.trigger = node;
    this.options = { placement: 'top', ...options };

    // Bind handlers once for consistent reference
    this.boundShow = this.show.bind(this);
    this.boundHide = this.hide.bind(this);
    this.boundTouchStart = this.onTouchStart.bind(this);
    this.boundTouchEnd = this.onTouchEnd.bind(this);

    this.init();
  }

  private static isEditable(el: Element): boolean {
    const tag = el.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return true;
    if (el instanceof HTMLElement && el.isContentEditable) return true;
    return false;
  }

  private onTouchStart() {
    if (this.touchGuarded) return;
    if (VoidTooltip.isEditable(this.trigger)) return;
    const el = this.trigger as HTMLElement;
    this.savedUserSelect = el.style.userSelect;
    this.savedTouchCallout = el.style.getPropertyValue('-webkit-touch-callout');
    el.style.userSelect = 'none';
    el.style.setProperty('-webkit-touch-callout', 'none');
    this.touchGuarded = true;
  }

  private onTouchEnd() {
    if (!this.touchGuarded) return;
    const el = this.trigger as HTMLElement;
    el.style.userSelect = this.savedUserSelect;
    if (this.savedTouchCallout) {
      el.style.setProperty('-webkit-touch-callout', this.savedTouchCallout);
    } else {
      el.style.removeProperty('-webkit-touch-callout');
    }
    this.touchGuarded = false;
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

    // Suppress long-press text selection on touch devices (non-editable only)
    this.trigger.addEventListener('touchstart', this.boundTouchStart, {
      passive: true,
    });
    this.trigger.addEventListener('touchend', this.boundTouchEnd);
    this.trigger.addEventListener('touchcancel', this.boundTouchEnd);
  }

  private show() {
    this.clearShowTimer();
    const delay = this.options.delay ?? 0;

    if (delay > 0) {
      this.showTimer = setTimeout(() => {
        this.showTimer = null;
        this.showImmediate();
      }, delay);
    } else {
      this.showImmediate();
    }
  }

  private showImmediate() {
    if (this.tooltip) return;

    // Create the popover element and content.
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'void-tooltip';
    this.tooltip.textContent = this.options.content;

    // Promote to the Top Layer to bypass z-index stacking contexts.
    this.tooltip.popover = 'manual';

    // Apply a11y attributes; physics styling stays in CSS.
    const id = createStableId('tooltip');
    this.tooltipId = id;
    this.tooltip.setAttribute('id', id);
    this.tooltip.setAttribute('role', 'tooltip');
    this.attachDescription(id);

    // Mount to body to escape local stacking contexts.
    document.body.appendChild(this.tooltip);
    this.tooltip.showPopover();

    // Keep position synced with Floating UI.
    this.cleanupPositioning = autoUpdate(this.trigger, this.tooltip, () => {
      const tooltipEl = this.tooltip;
      if (!tooltipEl) return;

      computePosition(this.trigger, tooltipEl, {
        placement: this.options.placement,
        middleware: [
          offset(this.options.offset ?? TOOLTIP_OFFSET_PX),
          flip(),
          shift({ padding: TOOLTIP_VIEWPORT_PADDING_PX }),
        ],
      }).then(({ x, y, placement: resolvedPlacement }) => {
        if (!this.tooltip || this.tooltip !== tooltipEl) return;

        Object.assign(tooltipEl.style, {
          left: `${x}px`,
          top: `${y}px`,
          position: 'absolute',
        });
        tooltipEl.dataset.side = resolvedPlacement.split('-')[0];
      });
    });

    // Allow a paint before applying the entry state.
    requestAnimationFrame(() => {
      if (this.tooltip) this.tooltip.setAttribute('data-state', 'open');
    });
  }

  private clearShowTimer() {
    if (this.showTimer !== null) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
  }

  private getTransitionDurationMs(element: HTMLElement): number {
    const styles = getComputedStyle(element);
    return parseTransitionDurationMs(styles.transitionDuration);
  }

  private hide() {
    this.clearShowTimer();
    if (!this.tooltip) return;
    const el = this.tooltip;
    let destroyed = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.target !== el) return;
      destroy();
    };

    // Trigger CSS exit state.
    el.setAttribute('data-state', 'closed');

    const destroy = () => {
      if (destroyed) return;
      destroyed = true;

      if (fallbackTimer !== null) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
      el.removeEventListener('transitionend', handleTransitionEnd);

      if (this.cleanupPositioning) this.cleanupPositioning();
      this.cleanupPositioning = null;

      try {
        el.hidePopover();
        el.remove();
      } catch (e) {
        // Ignore race conditions where the element is already gone.
      }
      this.detachDescription();
      this.tooltip = null;
    };

    // Align DOM removal with CSS transition duration (retro returns 0).
    let durationMs = 0;
    try {
      durationMs = this.getTransitionDurationMs(el);
    } catch {
      destroy();
      return;
    }

    if (!Number.isFinite(durationMs) || durationMs === 0) {
      destroy();
    } else {
      el.addEventListener('transitionend', handleTransitionEnd);
      fallbackTimer = setTimeout(() => {
        el.removeEventListener('transitionend', handleTransitionEnd);
        destroy();
      }, durationMs + 50);
    }
  }

  private attachDescription(id: string) {
    this.initialDescribedBy = this.trigger.getAttribute('aria-describedby');
    const merged = Array.from(
      new Set([...parseIdRefs(this.initialDescribedBy), id]),
    );
    const value = joinIdRefs(merged);
    if (value) {
      this.trigger.setAttribute('aria-describedby', value);
    }
  }

  private detachDescription() {
    if (!this.tooltipId) return;

    const current = parseIdRefs(this.trigger.getAttribute('aria-describedby'));
    const initial = parseIdRefs(this.initialDescribedBy);
    const next = current.filter((token) => token !== this.tooltipId);

    if (haveSameIdRefs(next, initial)) {
      if (this.initialDescribedBy == null) {
        this.trigger.removeAttribute('aria-describedby');
      } else {
        this.trigger.setAttribute('aria-describedby', this.initialDescribedBy);
      }
    } else {
      const value = joinIdRefs(next);
      if (value) {
        this.trigger.setAttribute('aria-describedby', value);
      } else {
        this.trigger.removeAttribute('aria-describedby');
      }
    }

    this.tooltipId = null;
    this.initialDescribedBy = null;
  }

  public update(newOptions: Partial<VoidTooltipOptions>) {
    this.options = { ...this.options, ...newOptions };
    if (this.tooltip) {
      this.tooltip.textContent = this.options.content || '';
    }
  }

  public destroy() {
    this.clearShowTimer();
    // Remove event listeners to prevent memory leaks
    const showEvents = ['pointerenter', 'focus'];
    const hideEvents = ['pointerleave', 'blur'];

    showEvents.forEach((evt) =>
      this.trigger.removeEventListener(evt, this.boundShow),
    );
    hideEvents.forEach((evt) =>
      this.trigger.removeEventListener(evt, this.boundHide),
    );

    this.trigger.removeEventListener('touchstart', this.boundTouchStart);
    this.trigger.removeEventListener('touchend', this.boundTouchEnd);
    this.trigger.removeEventListener('touchcancel', this.boundTouchEnd);
    this.onTouchEnd();

    this.hide();
  }
}
