import { describe, expect, it, vi } from 'vitest';
import { DragManager } from '@lib/drag-manager';
import { draggable, reorderByDrop, resolveReorderByDrop } from '@actions/drag';

describe('reorderByDrop', () => {
  it('reorders items before and after an explicit target', () => {
    const items = [
      { id: 'a', label: 'Alpha' },
      { id: 'b', label: 'Beta' },
      { id: 'c', label: 'Gamma' },
      { id: 'd', label: 'Delta' },
    ];

    expect(
      reorderByDrop(items, {
        id: 'b',
        targetId: 'd',
        position: 'after',
      }).map((item) => item.id),
    ).toEqual(['a', 'c', 'd', 'b']);

    expect(
      reorderByDrop(items, {
        id: 'd',
        targetId: 'b',
        position: 'before',
      }).map((item) => item.id),
    ).toEqual(['a', 'd', 'b', 'c']);
  });

  it('returns the original array for non-sortable drops', () => {
    const items = [
      { id: 'a', label: 'Alpha' },
      { id: 'b', label: 'Beta' },
    ];

    expect(
      reorderByDrop(items, {
        id: 'a',
        targetId: 'b',
        position: 'inside',
      }),
    ).toBe(items);
  });
});

describe('resolveReorderByDrop', () => {
  it('returns reordered items and a backend-ready payload', () => {
    const items = [
      { id: 'a', label: 'Alpha' },
      { id: 'b', label: 'Beta' },
      { id: 'c', label: 'Gamma' },
      { id: 'd', label: 'Delta' },
    ];

    expect(
      resolveReorderByDrop(items, {
        id: 'b',
        targetId: 'd',
        position: 'after',
      }),
    ).toMatchObject({
      items: [
        { id: 'a', label: 'Alpha' },
        { id: 'c', label: 'Gamma' },
        { id: 'd', label: 'Delta' },
        { id: 'b', label: 'Beta' },
      ],
      item: { id: 'b', label: 'Beta' },
      request: {
        id: 'b',
        targetId: 'd',
        position: 'after',
        fromIndex: 1,
        toIndex: 3,
        previousId: 'd',
        nextId: null,
        orderedIds: ['a', 'c', 'd', 'b'],
      },
    });
  });

  it('returns null when the drop does not change order', () => {
    const items = [
      { id: 'a', label: 'Alpha' },
      { id: 'b', label: 'Beta' },
    ];

    expect(
      resolveReorderByDrop(items, {
        id: 'a',
        targetId: 'b',
        position: 'before',
      }),
    ).toBeNull();
  });
});

describe('DragManager', () => {
  it('emits targetId and before/after insertion for sortable drops', () => {
    const manager = new DragManager();
    const source = document.createElement('div');
    const target = document.createElement('div');
    const onDrop = vi.fn();

    source.setAttribute('aria-label', 'Beta');
    target.setAttribute('aria-label', 'Gamma');

    Object.defineProperty(target, 'getBoundingClientRect', {
      value: () => new DOMRect(0, 50, 120, 40),
      configurable: true,
    });

    Object.defineProperty(document, 'elementsFromPoint', {
      value: vi.fn(() => [target]),
      configurable: true,
      writable: true,
    });

    document.body.append(source, target);

    manager.registerTarget(target, {
      id: 'gamma',
      group: 'list',
      mode: 'between',
      axis: 'vertical',
      onDrop,
    });

    manager.startDrag(source, 'beta', { id: 'beta' }, 'list', 20, 55);

    expect(manager.updatePosition(20, 55)).toMatchObject({
      target,
      targetId: 'gamma',
      position: 'before',
    });

    expect(manager.endDrag()).toMatchObject({
      dropped: true,
      target,
      targetId: 'gamma',
      position: 'before',
    });

    expect(onDrop).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'beta',
        target,
        targetId: 'gamma',
        position: 'before',
      }),
    );
  });

  it('resolves a nested child back to its registered drop target', () => {
    const manager = new DragManager();
    const source = document.createElement('div');
    const target = document.createElement('div');
    const child = document.createElement('button');

    source.setAttribute('aria-label', 'Beta');
    target.setAttribute('aria-label', 'Gamma');
    target.appendChild(child);

    Object.defineProperty(target, 'getBoundingClientRect', {
      value: () => new DOMRect(0, 50, 120, 40),
      configurable: true,
    });

    Object.defineProperty(document, 'elementsFromPoint', {
      value: vi.fn(() => [child]),
      configurable: true,
      writable: true,
    });

    document.body.append(source, target);

    manager.registerTarget(target, {
      id: 'gamma',
      group: 'list',
      mode: 'between',
    });

    manager.startDrag(source, 'beta', { id: 'beta' }, 'list', 20, 85);

    expect(manager.updatePosition(20, 85)).toMatchObject({
      target,
      targetId: 'gamma',
      position: 'after',
    });
  });

  it('resolves keyboard hover to before for earlier items and after for later items', () => {
    const manager = new DragManager();
    const wrapper = document.createElement('div');
    const before = document.createElement('div');
    const source = document.createElement('div');
    const after = document.createElement('div');

    before.setAttribute('aria-label', 'Alpha');
    source.setAttribute('aria-label', 'Beta');
    after.setAttribute('aria-label', 'Gamma');

    wrapper.append(before, source, after);
    document.body.appendChild(wrapper);

    manager.registerTarget(before, {
      id: 'alpha',
      group: 'list',
      mode: 'between',
    });
    manager.registerTarget(after, {
      id: 'gamma',
      group: 'list',
      mode: 'between',
    });

    manager.startDrag(source, 'beta', { id: 'beta' }, 'list');

    expect(manager.setKeyboardHover(before)).toMatchObject({
      target: before,
      targetId: 'alpha',
      position: 'before',
    });

    expect(manager.setKeyboardHover(after)).toMatchObject({
      target: after,
      targetId: 'gamma',
      position: 'after',
    });
  });

  it('keyboard navigation works when source is first or last in list', () => {
    const manager = new DragManager();
    const wrapper = document.createElement('div');
    const first = document.createElement('div');
    const second = document.createElement('div');
    const third = document.createElement('div');

    first.setAttribute('aria-label', 'Alpha');
    second.setAttribute('aria-label', 'Beta');
    third.setAttribute('aria-label', 'Gamma');

    wrapper.append(first, second, third);
    document.body.appendChild(wrapper);

    // Register all three as drop targets
    manager.registerTarget(first, { id: 'a', group: 'nav', mode: 'between' });
    manager.registerTarget(second, { id: 'b', group: 'nav', mode: 'between' });
    manager.registerTarget(third, { id: 'c', group: 'nav', mode: 'between' });

    // Drag from the FIRST item — all targets are after it
    manager.startDrag(first, 'a', { id: 'a' }, 'nav');
    const targets = manager.getCompatibleTargets();
    // Source is excluded from compatible targets
    expect(targets.map((t) => t.config.id)).toEqual(['b', 'c']);

    // Should be able to hover second (after source)
    expect(manager.setKeyboardHover(second)).toMatchObject({
      targetId: 'b',
      position: 'after',
    });

    // Should be able to hover third (after source)
    expect(manager.setKeyboardHover(third)).toMatchObject({
      targetId: 'c',
      position: 'after',
    });

    manager.cancelDrag();

    // Now drag from the LAST item — all targets are before it
    manager.startDrag(third, 'c', { id: 'c' }, 'nav');
    const targets2 = manager.getCompatibleTargets();
    expect(targets2.map((t) => t.config.id)).toEqual(['a', 'b']);

    // Should be able to hover first (before source)
    expect(manager.setKeyboardHover(first)).toMatchObject({
      targetId: 'a',
      position: 'before',
    });

    // Should be able to hover second (before source)
    expect(manager.setKeyboardHover(second)).toMatchObject({
      targetId: 'b',
      position: 'before',
    });

    manager.cancelDrag();
  });
});

describe('draggable action', () => {
  it('allows dragging from an interactive node (button) without a handle', () => {
    const btn = document.createElement('button');
    btn.textContent = 'Drag me';
    document.body.appendChild(btn);

    const instance = draggable(btn, { id: 'btn-1', data: { id: 'btn-1' } });

    // The action should set drag attributes on the button itself
    expect(btn.getAttribute('data-drag-id')).toBe('btn-1');
    // Button is natively focusable (tabIndex 0), so action skips explicit tabindex
    expect(btn.tabIndex).toBe(0);

    instance.destroy();
    btn.remove();
  });

  it('blocks drag from a nested interactive child when no handle is set', () => {
    const wrapper = document.createElement('div');
    const nestedBtn = document.createElement('button');
    nestedBtn.textContent = 'Click me';
    wrapper.appendChild(nestedBtn);
    document.body.appendChild(wrapper);

    const instance = draggable(wrapper, {
      id: 'wrap-1',
      data: { id: 'wrap-1' },
    });

    // Simulate pointerdown on the nested button — should NOT start drag.
    // We verify by checking that after pointerdown the node is not in dragging state.
    const event = new PointerEvent('pointerdown', {
      clientX: 10,
      clientY: 10,
      button: 0,
      isPrimary: true,
      pointerId: 1,
    });
    Object.defineProperty(event, 'target', {
      value: nestedBtn,
      configurable: true,
    });
    wrapper.dispatchEvent(event);

    expect(wrapper.getAttribute('data-drag-state')).toBeNull();

    instance.destroy();
    wrapper.remove();
  });
});
