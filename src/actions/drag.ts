/**
 * Drag Actions — `use:draggable` and `use:dropTarget`
 *
 * Pointer Events-based drag-and-drop with sortable-list support, physics-aware
 * feedback, and a keyboard fallback. Uses DragManager singleton for hit
 * testing, drop target coordination, and announcements.
 *
 * PHYSICS INTEGRATION:
 * - Reads --speed-base and --ease-spring-gentle from CSS (same as morph.ts)
 * - Ghost element styled via .drag-ghost class (physics variants in _drag.scss)
 * - States set via data-drag-state / data-drop-position attributes
 *
 * ACCESSIBILITY:
 * - Keyboard alternative: Enter/Space to pick up, Arrow keys to choose a
 *   destination, Enter to drop, Escape to cancel
 * - Screen reader announcements via DragManager's live region
 * - Supports single-pointer alternatives (move buttons) for WCAG 2.2 2.5.7
 *
 * @example Sortable list
 * {#each items as item (item.id)}
 *   <div
 *     use:draggable={{
 *       id: item.id,
 *       group: 'list',
 *       data: item,
 *       handle: '[data-drag-handle]'
 *     }}
 *     use:dropTarget={{
 *       id: item.id,
 *       group: 'list',
 *       mode: 'between',
 *       onDrop: (detail) => (items = reorderByDrop(items, detail))
 *     }}
 *     animate:live
 *   >
 *     <button data-drag-handle type="button">Drag</button>
 *     {item.name}
 *   </div>
 * {/each}
 *
 * @example Drag between zones
 * <div use:draggable={{ id: 'card-1', group: 'cards', data: cardData }}>
 *   Card content
 * </div>
 * <div use:dropTarget={{ group: 'cards', onDrop: handleDrop }}>
 *   Drop zone
 * </div>
 */

import {
  dragManager,
  type CompatibleTarget,
  type DragDetail,
  type DragEndDetail,
  type DropAxis,
  type DropDetail,
  type DropMode,
  type DropPosition,
  type DropTargetRegistration,
  type HoverDetail,
} from '@lib/drag-manager';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type {
  DragDetail,
  DragEndDetail,
  DropAxis,
  DropDetail,
  DropMode,
  DropPosition,
  HoverDetail as DropHoverDetail,
};

export interface DraggableOptions {
  /** Unique identifier for this draggable item */
  id: string;
  /** Data payload transferred on drop */
  data?: unknown;
  /** Group name — only drops onto matching group */
  group?: string;
  /** Axis constraint: 'both' | 'x' | 'y' (default: 'both') */
  axis?: 'both' | 'x' | 'y';
  /** CSS selector — only start drag from this child element */
  handle?: string;
  /** Disable dragging */
  disabled?: boolean;
  /** Callback when drag starts */
  onDragStart?: (detail: DragDetail) => void;
  /** Callback during drag (rAF-throttled) */
  onDragMove?: (detail: DragDetail) => void;
  /** Callback when drag ends (drop or cancel) */
  onDragEnd?: (detail: DragEndDetail) => void;
}

export interface DropTargetOptions {
  /** Optional identifier for consumers who need explicit reorder metadata */
  id?: string;
  /** Group name — accepts draggables from matching group */
  group?: string;
  /** Drop mode: 'inside' for zone drops, 'between' for sortable insertion */
  mode?: DropMode;
  /** Axis used to resolve between-item insertion */
  axis?: DropAxis;
  /** Fine-grained accept predicate beyond group matching */
  accepts?: (data: unknown, sourceId: string) => boolean;
  /** Callback when a valid draggable enters */
  onDragEnter?: (detail: HoverDetail) => void;
  /** Callback when a valid draggable leaves */
  onDragLeave?: (detail: HoverDetail) => void;
  /** Callback when a draggable is dropped here */
  onDrop?: (detail: DropDetail) => void;
  /** Disable this drop target */
  disabled?: boolean;
}

type ReorderLike = {
  id: string;
  targetId?: string;
  position?: DropPosition;
};

type SortableDropPosition = Extract<DropPosition, 'before' | 'after'>;

export interface ReorderRequest {
  /** Moved item identifier */
  id: string;
  /** Item the drop was resolved against */
  targetId: string;
  /** Placement relative to targetId */
  position: SortableDropPosition;
  /** Original index in the input array before the move */
  fromIndex: number;
  /** Final index in the reordered array after the move */
  toIndex: number;
  /** Immediate predecessor after the move */
  previousId: string | null;
  /** Immediate successor after the move */
  nextId: string | null;
  /** Full ordered ID list for backends that persist the canonical order */
  orderedIds: string[];
}

export interface ReorderChange<T extends { id: string }> {
  /** Reordered collection */
  items: T[];
  /** The item that moved */
  item: T;
  /** Backend-ready reorder payload */
  request: ReorderRequest;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reorder an array using a drop detail from a sortable list.
 *
 * Returns the original array reference when the detail does not describe a
 * meaningful sortable move.
 */
export function reorderByDrop<T extends { id: string }>(
  items: T[],
  detail: ReorderLike,
): T[] {
  return resolveReorderByDrop(items, detail)?.items ?? items;
}

/**
 * Resolve a sortable drop into both the next collection state and a
 * backend-ready payload describing the move.
 *
 * Returns null when the detail does not produce a meaningful reorder.
 */
export function resolveReorderByDrop<T extends { id: string }>(
  items: T[],
  detail: ReorderLike,
): ReorderChange<T> | null {
  if (!detail.targetId) return null;
  if (detail.position !== 'before' && detail.position !== 'after') return null;
  if (detail.id === detail.targetId) return null;

  const fromIndex = items.findIndex((item) => item.id === detail.id);
  const targetIndex = items.findIndex((item) => item.id === detail.targetId);

  if (fromIndex === -1 || targetIndex === -1) {
    return null;
  }

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  const insertionIndex = next.findIndex((item) => item.id === detail.targetId);

  if (!moved || insertionIndex === -1) {
    return null;
  }

  const toIndex =
    detail.position === 'after' ? insertionIndex + 1 : insertionIndex;
  next.splice(toIndex, 0, moved);

  const changed = next.some((item, index) => item !== items[index]);
  if (!changed) {
    return null;
  }

  return {
    items: next,
    item: moved,
    request: {
      id: detail.id,
      targetId: detail.targetId,
      position: detail.position,
      fromIndex,
      toIndex,
      previousId: next[toIndex - 1]?.id ?? null,
      nextId: next[toIndex + 1]?.id ?? null,
      orderedIds: next.map((item) => item.id),
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Physics Config (same pattern as morph.ts)
// ─────────────────────────────────────────────────────────────────────────────

interface PhysicsConfig {
  duration: number;
  easing: string;
  disabled: boolean;
}

function getPhysicsConfig(el: HTMLElement): PhysicsConfig {
  const styles = getComputedStyle(el);

  const speedRaw = styles.getPropertyValue('--speed-base').trim();
  let duration = 300;
  if (speedRaw) {
    if (speedRaw.endsWith('ms')) {
      duration = parseFloat(speedRaw);
    } else if (speedRaw.endsWith('s')) {
      duration = parseFloat(speedRaw) * 1000;
    }
  }

  const easing =
    styles.getPropertyValue('--ease-spring-gentle').trim() ||
    'cubic-bezier(0.175, 0.885, 0.32, 1.275)';

  const isRetro = duration === 0;
  const reducedMotion =
    typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;

  return { duration, easing, disabled: isRetro || reducedMotion };
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Minimum pointer movement before committing to a drag gesture (px) */
const ACTIVATION_THRESHOLD = 6;

const INTERACTIVE_SELECTOR =
  'button, a[href], input, select, textarea, summary, [contenteditable=""], [contenteditable="true"], [role="button"], [role="link"], [role="textbox"]';

// ─────────────────────────────────────────────────────────────────────────────
// Shared drag document state
// ─────────────────────────────────────────────────────────────────────────────

let documentSelectionLock: {
  userSelect: string;
  webkitUserSelect: string;
  cursor: string;
} | null = null;

/** Access body.style with webkit prefix safely (Safari requires it). */
function getBodyStyle(): CSSStyleDeclaration & { webkitUserSelect: string } {
  return document.body.style as CSSStyleDeclaration & {
    webkitUserSelect: string;
  };
}

function lockDocumentSelection(): void {
  if (typeof document === 'undefined' || documentSelectionLock) return;

  const style = getBodyStyle();
  documentSelectionLock = {
    userSelect: style.userSelect,
    webkitUserSelect: style.webkitUserSelect,
    cursor: style.cursor,
  };

  style.userSelect = 'none';
  style.webkitUserSelect = 'none';
  style.cursor = 'grabbing';
}

function unlockDocumentSelection(): void {
  if (typeof document === 'undefined' || !documentSelectionLock) return;

  const style = getBodyStyle();
  style.userSelect = documentSelectionLock.userSelect;
  style.webkitUserSelect = documentSelectionLock.webkitUserSelect;
  style.cursor = documentSelectionLock.cursor;
  documentSelectionLock = null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Ghost Management
// ─────────────────────────────────────────────────────────────────────────────

function createGhost(source: HTMLElement): HTMLElement {
  const rect = source.getBoundingClientRect();
  const ghost = source.cloneNode(true) as HTMLElement;

  ghost.removeAttribute('id');
  ghost.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));

  ghost.removeAttribute('tabindex');
  ghost.removeAttribute('role');
  ghost.removeAttribute('aria-describedby');
  ghost.setAttribute('aria-hidden', 'true');

  ghost.className = `${source.className} drag-ghost`.trim();
  ghost.style.width = `${rect.width}px`;
  ghost.style.height = `${rect.height}px`;
  ghost.style.left = `${rect.left}px`;
  ghost.style.top = `${rect.top}px`;
  ghost.style.margin = '0';

  ghost.removeAttribute('data-drag-state');
  ghost.removeAttribute('data-drop-position');

  document.body.appendChild(ghost);
  return ghost;
}

function moveGhost(
  ghost: HTMLElement,
  x: number,
  y: number,
  offsetX: number,
  offsetY: number,
  axis: 'both' | 'x' | 'y',
  originX: number,
  originY: number,
): void {
  const nextX = axis === 'y' ? originX : x - offsetX;
  const nextY = axis === 'x' ? originY : y - offsetY;
  ghost.style.left = `${nextX}px`;
  ghost.style.top = `${nextY}px`;
}

function removeGhost(ghost: HTMLElement, physics: PhysicsConfig): void {
  if (physics.disabled) {
    ghost.remove();
    return;
  }

  const fadeMs = physics.duration / 2;
  ghost.style.transition = `opacity ${fadeMs}ms ${physics.easing}, transform ${fadeMs}ms ${physics.easing}`;
  ghost.style.opacity = '0';
  ghost.style.transform = 'scale(0.95)';

  ghost.addEventListener('transitionend', () => ghost.remove(), { once: true });

  // Fallback in case transitionend never fires (e.g. display: none race)
  setTimeout(() => {
    if (ghost.parentNode) ghost.remove();
  }, fadeMs + 50);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function asElement(target: EventTarget | null): Element | null {
  return target instanceof Element ? target : null;
}

function isHandleMatch(
  node: HTMLElement,
  target: EventTarget | null,
  selector: string,
): boolean {
  const element = asElement(target);
  if (!element) return false;

  const handle = element.closest(selector);
  return handle instanceof HTMLElement && node.contains(handle);
}

function isInteractiveDescendant(
  node: HTMLElement,
  target: EventTarget | null,
): boolean {
  const element = asElement(target);
  if (!element) return false;

  const interactive = element.closest(INTERACTIVE_SELECTOR);
  // Ignore the draggable node itself — only block nested interactive children
  return (
    interactive instanceof HTMLElement &&
    interactive !== node &&
    node.contains(interactive)
  );
}

function shouldStartDrag(
  node: HTMLElement,
  target: EventTarget | null,
  handle: string | undefined,
): boolean {
  if (handle) {
    return isHandleMatch(node, target, handle);
  }

  return !isInteractiveDescendant(node, target);
}

// ─────────────────────────────────────────────────────────────────────────────
// use:draggable
// ─────────────────────────────────────────────────────────────────────────────

export function draggable(node: HTMLElement, options: DraggableOptions) {
  let opts = options;

  let pendingPointerId: number | null = null;
  let activePointerId: number | null = null;
  let pendingStartX = 0;
  let pendingStartY = 0;

  let touchId: number | null = null;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchPending = false;

  let isDragging = false;
  let isKeyboardDrag = false;
  let ghost: HTMLElement | null = null;
  let offsetX = 0;
  let offsetY = 0;
  let originX = 0;
  let originY = 0;
  let latestClientX = 0;
  let latestClientY = 0;
  let rafId: number | null = null;

  let pointerTracking = false;
  let touchTracking = false;
  let globalKeyTracking = false;

  let suppressClick = false;
  let suppressClickRaf: number | null = null;

  let keyboardTargets: CompatibleTarget[] = [];
  let keyboardTargetIndex: number | null = null;
  let keyboardBoundaryIndex = 0;

  function syncStaticAttributes(): void {
    if (!node.getAttribute('tabindex') && node.tabIndex < 0) {
      node.setAttribute('tabindex', '0');
    }

    node.setAttribute('data-drag-id', opts.id);
    node.setAttribute('data-drag-axis', opts.axis ?? 'both');
    node.setAttribute('draggable', 'false');

    // When there's no handle, the entire node is the gesture surface —
    // prevent the browser from intercepting touch as scroll/pan.
    // With a handle, [data-drag-handle] { touch-action: none } in SCSS
    // covers the handle element; the rest of the item stays scrollable.
    if (!opts.handle && !opts.disabled) {
      node.style.touchAction = 'none';
    } else {
      node.style.touchAction = '';
    }

    if (opts.disabled) {
      node.setAttribute('aria-disabled', 'true');
    } else {
      node.removeAttribute('aria-disabled');
    }
  }

  function addPointerTracking(): void {
    if (pointerTracking || typeof window === 'undefined') return;
    pointerTracking = true;
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);
  }

  function removePointerTracking(): void {
    if (!pointerTracking || typeof window === 'undefined') return;
    pointerTracking = false;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
    window.removeEventListener('pointercancel', handlePointerCancel);
  }

  function addTouchTracking(): void {
    if (touchTracking || typeof window === 'undefined') return;
    touchTracking = true;
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchCancel);
  }

  function removeTouchTracking(): void {
    if (!touchTracking || typeof window === 'undefined') return;
    touchTracking = false;
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);
    window.removeEventListener('touchcancel', handleTouchCancel);
  }

  function addGlobalKeyTracking(): void {
    if (globalKeyTracking || typeof window === 'undefined') return;
    globalKeyTracking = true;
    window.addEventListener('keydown', handleGlobalKeyDown);
  }

  function removeGlobalKeyTracking(): void {
    if (!globalKeyTracking || typeof window === 'undefined') return;
    globalKeyTracking = false;
    window.removeEventListener('keydown', handleGlobalKeyDown);
  }

  function queueSuppressClick(): void {
    suppressClick = true;

    if (suppressClickRaf !== null) {
      cancelAnimationFrame(suppressClickRaf);
    }

    suppressClickRaf = requestAnimationFrame(() => {
      suppressClick = false;
      suppressClickRaf = null;
    });
  }

  function findTouch(touches: TouchList): Touch | null {
    if (touchId === null) return null;

    for (let index = 0; index < touches.length; index += 1) {
      if (touches[index].identifier === touchId) {
        return touches[index];
      }
    }

    return null;
  }

  function getKeyboardBoundaryIndex(targets: CompatibleTarget[]): number {
    return targets.filter(({ element }) => {
      const position = element.compareDocumentPosition(node);
      return Boolean(position & Node.DOCUMENT_POSITION_FOLLOWING);
    }).length;
  }

  function scheduleMove(clientX: number, clientY: number): void {
    latestClientX = clientX;
    latestClientY = clientY;

    if (rafId !== null) return;

    rafId = requestAnimationFrame(() => {
      rafId = null;

      if (!isDragging || !ghost) return;

      moveGhost(
        ghost,
        latestClientX,
        latestClientY,
        offsetX,
        offsetY,
        opts.axis ?? 'both',
        originX,
        originY,
      );

      dragManager.updatePosition(latestClientX, latestClientY);
      opts.onDragMove?.(dragManager.getDragDetail());
    });
  }

  function startDrag(
    clientX: number,
    clientY: number,
    startX: number,
    startY: number,
  ): void {
    if (dragManager.isDragging) return;

    isDragging = true;
    latestClientX = clientX;
    latestClientY = clientY;

    const rect = node.getBoundingClientRect();
    offsetX = startX - rect.left;
    offsetY = startY - rect.top;
    originX = rect.left;
    originY = rect.top;

    ghost = createGhost(node);
    node.setAttribute('data-drag-state', 'dragging');

    lockDocumentSelection();
    addGlobalKeyTracking();

    dragManager.startDrag(
      node,
      opts.id,
      opts.data,
      opts.group,
      clientX,
      clientY,
    );
    dragManager.updatePosition(clientX, clientY);
    opts.onDragStart?.(dragManager.getDragDetail());

    moveGhost(
      ghost,
      clientX,
      clientY,
      offsetX,
      offsetY,
      opts.axis ?? 'both',
      originX,
      originY,
    );
  }

  function startKeyboardDrag(): void {
    if (dragManager.isDragging) return;

    const rect = node.getBoundingClientRect();

    isDragging = true;
    isKeyboardDrag = true;
    originX = rect.left;
    originY = rect.top;
    latestClientX = rect.left + rect.width / 2;
    latestClientY = rect.top + rect.height / 2;

    node.setAttribute('data-drag-state', 'dragging');
    addGlobalKeyTracking();

    dragManager.startDrag(
      node,
      opts.id,
      opts.data,
      opts.group,
      latestClientX,
      latestClientY,
    );
    opts.onDragStart?.(dragManager.getDragDetail());

    keyboardTargets = dragManager.getCompatibleTargets();
    keyboardBoundaryIndex = getKeyboardBoundaryIndex(keyboardTargets);
    keyboardTargetIndex = null;
  }

  function navigateTargets(direction: -1 | 1): void {
    if (keyboardTargets.length === 0) return;

    if (keyboardTargetIndex === null) {
      // First press — start from the nearest neighbor in the pressed direction.
      // boundaryIndex is the count of targets preceding the source in DOM order,
      // so targets[boundaryIndex] is the first one after the source (if it exists).
      if (direction > 0) {
        // Forward: prefer the first target after the source, fall back to last before
        keyboardTargetIndex =
          keyboardBoundaryIndex < keyboardTargets.length
            ? keyboardBoundaryIndex
            : keyboardTargets.length - 1;
      } else {
        // Backward: prefer the last target before the source, fall back to first after
        keyboardTargetIndex =
          keyboardBoundaryIndex > 0 ? keyboardBoundaryIndex - 1 : 0;
      }
    } else {
      const nextIndex = keyboardTargetIndex + direction;
      if (nextIndex < 0 || nextIndex >= keyboardTargets.length) return;
      keyboardTargetIndex = nextIndex;
    }

    const target = keyboardTargets[keyboardTargetIndex]?.element;
    if (!target) return;

    dragManager.setKeyboardHover(target);
    target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function jumpToTarget(which: 'start' | 'end'): void {
    if (keyboardTargets.length === 0) return;

    keyboardTargetIndex = which === 'start' ? 0 : keyboardTargets.length - 1;

    const target = keyboardTargets[keyboardTargetIndex]?.element;
    if (!target) return;

    dragManager.setKeyboardHover(target);
    target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function endDrag(): void {
    if (!isDragging) return;

    const dragDetail = dragManager.getDragDetail();
    const result = dragManager.endDrag();

    const detail: DragEndDetail = {
      ...dragDetail,
      x: result.x,
      y: result.y,
      dropped: result.dropped,
      target: result.target,
      targetId: result.targetId,
      position: result.position,
    };

    opts.onDragEnd?.(detail);

    if (ghost) {
      const physics = getPhysicsConfig(node);
      removeGhost(ghost, physics);
      ghost = null;
    }

    const shouldRefocus = isKeyboardDrag;
    if (!isKeyboardDrag) {
      queueSuppressClick();
    }

    resetState();

    if (shouldRefocus) {
      node.focus({ preventScroll: true });
    }
  }

  function cancelDrag(): void {
    if (!isDragging) return;

    const dragDetail = dragManager.getDragDetail();
    dragManager.cancelDrag();

    const detail: DragEndDetail = {
      ...dragDetail,
      dropped: false,
      target: null,
    };

    opts.onDragEnd?.(detail);

    if (ghost) {
      const physics = getPhysicsConfig(node);
      if (!physics.disabled) {
        ghost.style.transition = `left ${physics.duration}ms ${physics.easing}, top ${physics.duration}ms ${physics.easing}, opacity ${physics.duration}ms ${physics.easing}`;
        ghost.style.left = `${originX}px`;
        ghost.style.top = `${originY}px`;
        ghost.style.opacity = '0.5';

        ghost.addEventListener('transitionend', () => ghost?.remove(), {
          once: true,
        });

        setTimeout(() => {
          if (ghost?.parentNode) ghost.remove();
        }, physics.duration + 50);
      } else {
        ghost.remove();
      }

      ghost = null;
    }

    const shouldRefocus = isKeyboardDrag;
    if (!isKeyboardDrag) {
      queueSuppressClick();
    }

    resetState();

    if (shouldRefocus) {
      node.focus({ preventScroll: true });
    }
  }

  function resetState(): void {
    if (
      activePointerId !== null &&
      typeof node.hasPointerCapture === 'function' &&
      node.hasPointerCapture(activePointerId)
    ) {
      try {
        node.releasePointerCapture(activePointerId);
      } catch {
        // Pointer may already be released; nothing to do.
      }
    }

    isDragging = false;
    isKeyboardDrag = false;
    pendingPointerId = null;
    activePointerId = null;
    touchId = null;
    touchPending = false;
    keyboardTargets = [];
    keyboardTargetIndex = null;
    keyboardBoundaryIndex = 0;

    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    node.removeAttribute('data-drag-state');

    removePointerTracking();
    removeTouchTracking();
    removeGlobalKeyTracking();
    unlockDocumentSelection();
  }

  function handlePointerDown(event: PointerEvent): void {
    if (opts.disabled || dragManager.isDragging) return;
    if (!event.isPrimary || event.pointerType === 'touch' || event.button !== 0)
      return;
    if (!shouldStartDrag(node, event.target, opts.handle)) return;

    if (opts.handle) {
      // Drag handles are gesture-only affordances, so suppress native button/link
      // activation on pointer press to keep the drag initiation stable.
      event.preventDefault();
    }

    pendingPointerId = event.pointerId;
    pendingStartX = event.clientX;
    pendingStartY = event.clientY;
    addPointerTracking();
  }

  function handlePointerMove(event: PointerEvent): void {
    if (
      event.pointerId !== pendingPointerId &&
      event.pointerId !== activePointerId
    ) {
      return;
    }

    if (pendingPointerId === event.pointerId && !isDragging) {
      const deltaX = event.clientX - pendingStartX;
      const deltaY = event.clientY - pendingStartY;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance >= ACTIVATION_THRESHOLD) {
        pendingPointerId = null;
        activePointerId = event.pointerId;
        startDrag(event.clientX, event.clientY, pendingStartX, pendingStartY);

        if (typeof node.setPointerCapture === 'function') {
          try {
            node.setPointerCapture(event.pointerId);
          } catch {
            // Some environments do not support pointer capture on detached nodes.
          }
        }
      }

      return;
    }

    if (!isDragging || activePointerId !== event.pointerId) return;
    scheduleMove(event.clientX, event.clientY);
  }

  function handlePointerUp(event: PointerEvent): void {
    if (event.pointerId === pendingPointerId) {
      pendingPointerId = null;
      removePointerTracking();
      return;
    }

    if (event.pointerId !== activePointerId || !isDragging) return;
    endDrag();
  }

  function handlePointerCancel(event: PointerEvent): void {
    if (event.pointerId === pendingPointerId) {
      pendingPointerId = null;
      removePointerTracking();
      return;
    }

    if (event.pointerId === activePointerId && isDragging) {
      cancelDrag();
    }
  }

  function handleTouchStart(event: TouchEvent): void {
    if (opts.disabled || touchId !== null || dragManager.isDragging) return;
    if (!shouldStartDrag(node, event.target, opts.handle)) return;

    const touch = event.changedTouches[0];
    if (!touch) return;

    touchId = touch.identifier;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchPending = true;
    addTouchTracking();
  }

  function handleTouchMove(event: TouchEvent): void {
    const touch = findTouch(event.changedTouches) ?? findTouch(event.touches);
    if (!touch) return;

    if (touchPending) {
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      const distance = Math.hypot(deltaX, deltaY);

      if (distance >= ACTIVATION_THRESHOLD) {
        touchPending = false;
        event.preventDefault();
        startDrag(touch.clientX, touch.clientY, touchStartX, touchStartY);
      }

      return;
    }

    if (!isDragging) return;
    event.preventDefault();
    scheduleMove(touch.clientX, touch.clientY);
  }

  function handleTouchEnd(event: TouchEvent): void {
    const touch = findTouch(event.changedTouches);
    if (!touch) return;

    touchId = null;
    touchPending = false;

    if (isDragging) {
      endDrag();
    } else {
      removeTouchTracking();
    }
  }

  function handleTouchCancel(event: TouchEvent): void {
    if (!findTouch(event.changedTouches)) return;

    touchId = null;
    touchPending = false;

    if (isDragging) {
      cancelDrag();
    } else {
      removeTouchTracking();
    }
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (opts.disabled) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();

      if (!isKeyboardDrag) {
        startKeyboardDrag();
      } else {
        endDrag();
      }

      return;
    }

    if (event.key === 'Escape' && isKeyboardDrag) {
      event.preventDefault();
      event.stopPropagation();
      cancelDrag();
      return;
    }

    if (!isKeyboardDrag) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      navigateTargets(1);
      return;
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      navigateTargets(-1);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      jumpToTarget('start');
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      jumpToTarget('end');
    }
  }

  function handleGlobalKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || !isDragging || isKeyboardDrag) return;
    event.preventDefault();
    cancelDrag();
  }

  function handleClickCapture(event: MouseEvent): void {
    if (!suppressClick) return;
    event.preventDefault();
    event.stopPropagation();
  }

  function handleNativeDrag(event: DragEvent): void {
    event.preventDefault();
  }

  syncStaticAttributes();

  node.addEventListener('pointerdown', handlePointerDown);
  node.addEventListener('touchstart', handleTouchStart, { passive: true });
  node.addEventListener('keydown', handleKeyDown);
  node.addEventListener('click', handleClickCapture, true);
  node.addEventListener('dragstart', handleNativeDrag);

  return {
    update(newOptions: DraggableOptions) {
      opts = newOptions;
      syncStaticAttributes();

      if (opts.disabled && isDragging) {
        cancelDrag();
      }
    },

    destroy() {
      if (isDragging) {
        cancelDrag();
      } else {
        resetState();
      }

      node.removeEventListener('pointerdown', handlePointerDown);
      node.removeEventListener('touchstart', handleTouchStart);
      node.removeEventListener('keydown', handleKeyDown);
      node.removeEventListener('click', handleClickCapture, true);
      node.removeEventListener('dragstart', handleNativeDrag);

      if (suppressClickRaf !== null) {
        cancelAnimationFrame(suppressClickRaf);
      }

      node.removeAttribute('aria-disabled');
      node.removeAttribute('data-drag-axis');
      node.removeAttribute('data-drag-id');
      node.removeAttribute('data-drag-state');
      node.style.touchAction = '';
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// use:dropTarget
// ─────────────────────────────────────────────────────────────────────────────

export function dropTarget(node: HTMLElement, options: DropTargetOptions) {
  let opts = options;

  const config: DropTargetRegistration = {
    id: opts.id,
    group: opts.group,
    mode: opts.mode,
    axis: opts.axis,
    accepts: opts.accepts,
    onDragEnter: opts.onDragEnter,
    onDragLeave: opts.onDragLeave,
    onDrop: opts.onDrop,
    disabled: opts.disabled,
  };

  dragManager.registerTarget(node, config);

  return {
    update(newOptions: DropTargetOptions) {
      opts = newOptions;

      dragManager.updateTargetConfig(node, {
        id: opts.id,
        group: opts.group,
        mode: opts.mode,
        axis: opts.axis,
        accepts: opts.accepts,
        onDragEnter: opts.onDragEnter,
        onDragLeave: opts.onDragLeave,
        onDrop: opts.onDrop,
        disabled: opts.disabled,
      });
    },

    destroy() {
      dragManager.unregisterTarget(node);
    },
  };
}
