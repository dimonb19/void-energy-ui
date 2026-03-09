/**
 * Drag Manager — Singleton coordinator for drag-and-drop interactions.
 *
 * Tracks active drag state, manages drop target registration, performs hit
 * testing, and provides screen reader announcements via a shared aria-live
 * region.
 *
 * Follows LayerStack pattern: plain class, no Svelte runes, no stores.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type DropMode = 'inside' | 'between';
export type DropPosition = 'inside' | 'before' | 'after';
export type DropAxis = 'vertical' | 'horizontal';

export interface DragDetail {
  /** Source draggable ID */
  id: string;
  /** Transfer payload */
  data: unknown;
  /** Group name */
  group: string | undefined;
  /** Source element */
  source: HTMLElement;
  /** Current pointer position */
  x: number;
  y: number;
}

export interface HoverDetail extends DragDetail {
  /** Hovered drop target */
  target: HTMLElement;
  /** Optional drop target identifier */
  targetId: string | undefined;
  /** Resolved drop position */
  position: DropPosition;
}

export interface DragEndDetail extends DragDetail {
  /** Whether the drag was dropped on a valid target */
  dropped: boolean;
  /** The drop target element (if dropped) */
  target: HTMLElement | null;
  /** Optional drop target identifier */
  targetId?: string;
  /** Resolved drop position */
  position?: DropPosition;
}

export interface DropDetail extends HoverDetail {}

export interface DragEndResult {
  dropped: boolean;
  target: HTMLElement | null;
  targetId?: string;
  position?: DropPosition;
  x: number;
  y: number;
}

export interface DropTargetRegistration {
  id?: string;
  group?: string;
  mode?: DropMode;
  axis?: DropAxis;
  accepts?: (data: unknown, sourceId: string) => boolean;
  onDragEnter?: (detail: HoverDetail) => void;
  onDragLeave?: (detail: HoverDetail) => void;
  onDrop?: (detail: DropDetail) => void;
  disabled?: boolean;
}

export interface CompatibleTarget {
  element: HTMLElement;
  config: DropTargetRegistration;
}

interface ActiveDrag {
  id: string;
  data: unknown;
  group: string | undefined;
  source: HTMLElement;
  x: number;
  y: number;
}

interface HoverState {
  element: HTMLElement;
  compatible: boolean;
  position: DropPosition;
}

// ─────────────────────────────────────────────────────────────────────────────
// Manager
// ─────────────────────────────────────────────────────────────────────────────

export class DragManager {
  private activeDrag: ActiveDrag | null = null;
  private dropTargets: Map<HTMLElement, DropTargetRegistration> = new Map();
  private currentHover: HoverState | null = null;
  private liveRegion: HTMLElement | null = null;

  // ── Active drag lifecycle ────────────────────────────────────────────

  /** Start tracking an active drag. Called by use:draggable. */
  startDrag(
    source: HTMLElement,
    id: string,
    data: unknown,
    group: string | undefined,
    x = 0,
    y = 0,
  ): void {
    this.activeDrag = { id, data, group, source, x, y };
    this.currentHover = null;

    this.syncReadyStates();

    const label = this.getLabel(source);
    this.announce(
      `Picked up ${label}. Use arrow keys to choose a destination. Press Enter to drop or Escape to cancel.`,
    );
  }

  /** Update pointer position during drag. Called in rAF loop. */
  updatePosition(x: number, y: number): HoverDetail | null {
    if (!this.activeDrag) return null;
    this.activeDrag.x = x;
    this.activeDrag.y = y;

    const target = this.hitTest(x, y);
    this.updateHover(target, 'pointer');

    return this.getHoverDetail();
  }

  /** End the active drag with a drop (if over valid target). */
  endDrag(): DragEndResult {
    if (!this.activeDrag) {
      return { dropped: false, target: null, x: 0, y: 0 };
    }

    const result: DragEndResult = {
      dropped: false,
      target: null,
      x: this.activeDrag.x,
      y: this.activeDrag.y,
    };

    if (this.currentHover?.compatible) {
      const config = this.dropTargets.get(this.currentHover.element);
      const detail = this.buildHoverDetail(this.currentHover);

      if (config && detail) {
        result.dropped = true;
        result.target = this.currentHover.element;
        result.targetId = detail.targetId;
        result.position = detail.position;
        config.onDrop?.(detail);

        const label = this.getLabel(this.currentHover.element);
        this.announce(
          `Dropped ${this.describePosition(detail.position)} ${label}.`,
        );
      }
    }

    if (!result.dropped) {
      this.announce('Drop canceled.');
    }

    this.cleanup();
    return result;
  }

  /** Cancel the active drag without dropping. */
  cancelDrag(): void {
    if (!this.activeDrag) return;
    this.announce('Drag canceled.');
    this.cleanup();
  }

  /** Whether a drag is currently active. */
  get isDragging(): boolean {
    return this.activeDrag !== null;
  }

  /** Get current drag detail (for callbacks). */
  getDragDetail(): DragDetail {
    const drag = this.activeDrag;
    if (!drag) {
      throw new Error('Drag detail requested without an active drag.');
    }

    return {
      id: drag.id,
      data: drag.data,
      group: drag.group,
      source: drag.source,
      x: drag.x,
      y: drag.y,
    };
  }

  /** Get the current hover detail, if hovering a compatible target. */
  getHoverDetail(): HoverDetail | null {
    if (!this.currentHover?.compatible) return null;
    return this.buildHoverDetail(this.currentHover);
  }

  // ── Drop target registration ─────────────────────────────────────────

  registerTarget(el: HTMLElement, config: DropTargetRegistration): void {
    this.dropTargets.set(el, config);
    this.decorateTarget(el, config);

    if (this.activeDrag) {
      this.syncReadyStates();
      this.updateHover(
        this.hitTest(this.activeDrag.x, this.activeDrag.y),
        'pointer',
      );
    }
  }

  unregisterTarget(el: HTMLElement): void {
    const previous =
      this.currentHover?.element === el ? this.currentHover : null;
    const previousConfig = this.dropTargets.get(el);

    if (previous?.compatible) {
      const detail = this.buildHoverDetail(previous);
      if (detail) {
        previousConfig?.onDragLeave?.(detail);
      }
    }

    this.dropTargets.delete(el);
    this.clearTargetState(el);
    this.removeTargetMetadata(el);

    if (previous) {
      this.currentHover = null;
      if (this.activeDrag) {
        this.syncReadyStates();
        this.updateHover(
          this.hitTest(this.activeDrag.x, this.activeDrag.y),
          'pointer',
        );
      }
    }
  }

  updateTargetConfig(el: HTMLElement, config: DropTargetRegistration): void {
    this.dropTargets.set(el, config);
    this.decorateTarget(el, config);

    if (this.activeDrag) {
      this.syncReadyStates();
      this.updateHover(
        this.hitTest(this.activeDrag.x, this.activeDrag.y),
        'pointer',
      );
    }
  }

  // ── Keyboard navigation ──────────────────────────────────────────────

  /** Get ordered list of compatible drop targets for keyboard navigation. */
  getCompatibleTargets(): CompatibleTarget[] {
    if (!this.activeDrag) return [];

    const targets: CompatibleTarget[] = [];
    for (const [element, config] of this.dropTargets) {
      if (!config.disabled && this.isCompatible(element, config)) {
        targets.push({ element, config });
      }
    }

    targets.sort((a, b) => {
      const position = a.element.compareDocumentPosition(b.element);
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });

    return targets;
  }

  /** Programmatically set hover on a target (keyboard navigation). */
  setKeyboardHover(target: HTMLElement | null): HoverDetail | null {
    this.updateHover(target, 'keyboard');
    return this.getHoverDetail();
  }

  // ── Private helpers ──────────────────────────────────────────────────

  private updateHover(
    target: HTMLElement | null,
    source: 'pointer' | 'keyboard',
  ): void {
    const previous = this.currentHover;
    const next = this.buildHoverState(target, source);

    const changed =
      previous?.element !== next?.element ||
      previous?.compatible !== next?.compatible ||
      previous?.position !== next?.position;

    if (!changed) return;

    if (previous) {
      const previousConfig = this.dropTargets.get(previous.element);
      const previousDetail =
        previous.compatible && previousConfig
          ? this.buildHoverDetail(previous)
          : null;

      this.applyRestingState(previous.element, previousConfig);

      if (
        previousDetail &&
        (previous.element !== next?.element || !next?.compatible)
      ) {
        previousConfig?.onDragLeave?.(previousDetail);
      }
    }

    this.currentHover = next;

    if (next) {
      const nextConfig = this.dropTargets.get(next.element);
      const nextDetail =
        next.compatible && nextConfig ? this.buildHoverDetail(next) : null;

      this.applyActiveState(next);

      if (
        nextDetail &&
        (previous?.element !== next.element || !previous?.compatible)
      ) {
        nextConfig?.onDragEnter?.(nextDetail);
      }

      if (
        nextDetail &&
        (previous?.element !== next.element ||
          previous?.position !== next.position ||
          !previous?.compatible)
      ) {
        const label = this.getLabel(next.element);
        this.announce(`Drop ${this.describePosition(next.position)} ${label}.`);
      }
    }
  }

  private buildHoverState(
    target: HTMLElement | null,
    source: 'pointer' | 'keyboard',
  ): HoverState | null {
    if (!target) return null;

    const config = this.dropTargets.get(target);
    if (!config || config.disabled) return null;

    const compatible = this.isCompatible(target, config);
    const position = compatible
      ? source === 'pointer'
        ? this.resolvePointerPosition(target, config)
        : this.resolveKeyboardPosition(target, config)
      : 'inside';

    return { element: target, compatible, position };
  }

  private buildHoverDetail(hover: HoverState): HoverDetail | null {
    if (!hover.compatible) return null;

    const config = this.dropTargets.get(hover.element);
    if (!config || !this.activeDrag) return null;

    const drag = this.getDragDetail();
    return {
      ...drag,
      target: hover.element,
      targetId: config.id,
      position: hover.position,
    };
  }

  private isCompatible(
    el: HTMLElement,
    config: DropTargetRegistration,
  ): boolean {
    if (!this.activeDrag) return false;
    if (el === this.activeDrag.source) return false;

    if (config.group !== undefined || this.activeDrag.group !== undefined) {
      if (config.group !== this.activeDrag.group) return false;
    }

    if (config.accepts) {
      return config.accepts(this.activeDrag.data, this.activeDrag.id);
    }

    return true;
  }

  private hitTest(x: number, y: number): HTMLElement | null {
    if (!this.activeDrag || typeof document === 'undefined') return null;

    const elements = document.elementsFromPoint(x, y);
    for (const element of elements) {
      if (!(element instanceof HTMLElement)) continue;

      const target = this.findRegisteredTarget(element);
      if (target) {
        return target;
      }
    }

    return null;
  }

  private findRegisteredTarget(element: HTMLElement): HTMLElement | null {
    let current: HTMLElement | null = element;

    while (current) {
      const config = this.dropTargets.get(current);
      if (config && !config.disabled) {
        return current;
      }

      current = current.parentElement;
    }

    return null;
  }

  private resolvePointerPosition(
    target: HTMLElement,
    config: DropTargetRegistration,
  ): DropPosition {
    if (config.mode !== 'between') return 'inside';

    const rect = target.getBoundingClientRect();
    const axis = config.axis ?? 'vertical';
    const midpoint =
      axis === 'horizontal'
        ? rect.left + rect.width / 2
        : rect.top + rect.height / 2;
    const value =
      axis === 'horizontal'
        ? (this.activeDrag?.x ?? 0)
        : (this.activeDrag?.y ?? 0);

    return value < midpoint ? 'before' : 'after';
  }

  private resolveKeyboardPosition(
    target: HTMLElement,
    config: DropTargetRegistration,
  ): DropPosition {
    if (config.mode !== 'between' || !this.activeDrag) return 'inside';

    const position = target.compareDocumentPosition(this.activeDrag.source);
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
      return 'before';
    }

    if (position & Node.DOCUMENT_POSITION_PRECEDING) {
      return 'after';
    }

    return 'inside';
  }

  private syncReadyStates(): void {
    for (const [element, config] of this.dropTargets) {
      this.applyRestingState(element, config);
    }

    if (this.currentHover) {
      this.applyActiveState(this.currentHover);
    }
  }

  private applyRestingState(
    element: HTMLElement,
    config: DropTargetRegistration | undefined,
  ): void {
    // Never overwrite the source element's "dragging" state
    if (this.activeDrag && element === this.activeDrag.source) return;

    if (
      this.activeDrag &&
      config &&
      !config.disabled &&
      this.isCompatible(element, config)
    ) {
      element.setAttribute('data-drag-state', 'drop-ready');
      return;
    }

    this.clearTargetState(element);
  }

  private applyActiveState(hover: HoverState): void {
    // Never overwrite the source element's "dragging" state
    if (this.activeDrag && hover.element === this.activeDrag.source) return;

    hover.element.setAttribute(
      'data-drag-state',
      hover.compatible ? 'drop-hover' : 'drop-invalid',
    );

    if (hover.compatible && hover.position !== 'inside') {
      hover.element.setAttribute('data-drop-position', hover.position);
    } else {
      hover.element.removeAttribute('data-drop-position');
    }
  }

  private decorateTarget(
    element: HTMLElement,
    config: DropTargetRegistration,
  ): void {
    if (config.id) {
      element.setAttribute('data-drop-id', config.id);
    } else {
      element.removeAttribute('data-drop-id');
    }

    element.setAttribute('data-drop-mode', config.mode ?? 'inside');

    if (config.axis) {
      element.setAttribute('data-drop-axis', config.axis);
    } else {
      element.removeAttribute('data-drop-axis');
    }
  }

  private removeTargetMetadata(element: HTMLElement): void {
    element.removeAttribute('data-drop-id');
    element.removeAttribute('data-drop-mode');
    element.removeAttribute('data-drop-axis');
  }

  private clearTargetState(element: HTMLElement): void {
    element.removeAttribute('data-drag-state');
    element.removeAttribute('data-drop-position');
  }

  private cleanup(): void {
    for (const [element] of this.dropTargets) {
      this.clearTargetState(element);
    }

    this.currentHover = null;
    this.activeDrag = null;
  }

  private describePosition(position: DropPosition): string {
    switch (position) {
      case 'before':
        return 'before';
      case 'after':
        return 'after';
      default:
        return 'on';
    }
  }

  private getLabel(el: HTMLElement): string {
    return (
      el.getAttribute('aria-label') ||
      el.getAttribute('title') ||
      el.textContent?.trim().slice(0, 50) ||
      'item'
    );
  }

  // ── Screen reader announcements ──────────────────────────────────────

  private announce(message: string): void {
    if (typeof document === 'undefined') return;

    if (!this.liveRegion) {
      this.liveRegion = document.createElement('div');
      this.liveRegion.setAttribute('aria-live', 'polite');
      this.liveRegion.setAttribute('aria-atomic', 'true');
      this.liveRegion.setAttribute('role', 'status');
      this.liveRegion.className = 'sr-only';
      document.body.appendChild(this.liveRegion);
    }

    this.liveRegion.textContent = '';
    requestAnimationFrame(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = message;
      }
    });
  }
}

export const dragManager = new DragManager();
