import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import TabsFixture from './fixtures/tabs-fixture.svelte';

const basicTabs = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Gamma' },
];

const withDisabled = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta', disabled: true },
  { id: 'c', label: 'Gamma' },
];

function createRect({
  left,
  width,
  top = 0,
  height = 40,
}: {
  left: number;
  width: number;
  top?: number;
  height?: number;
}): DOMRect {
  return {
    x: left,
    y: top,
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
    toJSON() {
      return {};
    },
  } as DOMRect;
}

function mockRect(
  node: Element,
  rect: { left: number; width: number; top?: number; height?: number },
) {
  Object.defineProperty(node, 'getBoundingClientRect', {
    configurable: true,
    value: vi.fn(() => createRect(rect)),
  });
}

type ResizeObserverInstance = {
  callback: ResizeObserverCallback;
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
};

let restoreIndicatorRuntime: (() => void) | undefined;

function setupIndicatorRuntime() {
  const frameQueue: FrameRequestCallback[] = [];
  const instances: ResizeObserverInstance[] = [];
  const originalResizeObserver = globalThis.ResizeObserver;

  class TestResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();

    constructor(callback: ResizeObserverCallback) {
      instances.push({
        callback,
        observe: this.observe,
        disconnect: this.disconnect,
      });
    }
  }

  Object.defineProperty(globalThis, 'ResizeObserver', {
    value: TestResizeObserver,
    configurable: true,
    writable: true,
  });

  const rafSpy = vi
    .spyOn(globalThis, 'requestAnimationFrame')
    .mockImplementation((callback: FrameRequestCallback) => {
      frameQueue.push(callback);
      return frameQueue.length;
    });

  restoreIndicatorRuntime = () => {
    rafSpy.mockRestore();
    Object.defineProperty(globalThis, 'ResizeObserver', {
      value: originalResizeObserver,
      configurable: true,
      writable: true,
    });
  };

  function flushFrames() {
    let safety = 20;

    while (frameQueue.length > 0 && safety-- > 0) {
      const nextFrame = frameQueue.shift();
      nextFrame?.(performance.now());
    }

    if (frameQueue.length > 0) {
      throw new Error('requestAnimationFrame queue did not settle');
    }
  }

  function triggerResize(index = instances.length - 1) {
    const instance = instances[index];
    if (!instance) throw new Error('No ResizeObserver instance registered');
    instance.callback([], {} as ResizeObserver);
  }

  return { flushFrames, instances, triggerResize };
}

afterEach(() => {
  restoreIndicatorRuntime?.();
  restoreIndicatorRuntime = undefined;
});

describe('Tabs', () => {
  // ── Rendering & ARIA ──────────────────────────────────────────────────

  it('renders tablist, tabs, and tabpanel roles', () => {
    render(TabsFixture, { tabs: basicTabs });

    expect(screen.getByRole('tablist')).toBeTruthy();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getByRole('tabpanel')).toBeTruthy();
  });

  it('sets aria-selected on the active tab only', () => {
    render(TabsFixture, { tabs: basicTabs, value: 'b' });

    const tabs = screen.getAllByRole('tab');
    expect(tabs[0].getAttribute('aria-selected')).toBe('false');
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(tabs[2].getAttribute('aria-selected')).toBe('false');
  });

  it('wires aria-controls and aria-labelledby between tab and panel', () => {
    render(TabsFixture, { tabs: basicTabs, value: 'a' });

    const tab = screen.getAllByRole('tab')[0];
    const panel = screen.getByRole('tabpanel');

    expect(tab.getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.getAttribute('aria-labelledby')).toBe(tab.id);
  });

  // ── Default selection & coercion ──────────────────────────────────────

  it('defaults to first non-disabled tab when no value provided', () => {
    render(TabsFixture, { tabs: withDisabled });

    const tabs = screen.getAllByRole('tab');
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(screen.getByTestId('panel-content').textContent).toBe(
      'Content for a',
    );
  });

  it('coerces to first enabled tab when value references a disabled tab', () => {
    render(TabsFixture, { tabs: withDisabled, value: 'b' });

    const tabs = screen.getAllByRole('tab');
    // Should coerce away from disabled 'b' to first enabled 'a'
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
  });

  it('coerces to first enabled tab when value is a stale/missing id', () => {
    render(TabsFixture, { tabs: basicTabs, value: 'nonexistent' });

    const tabs = screen.getAllByRole('tab');
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
  });

  it('renders no panel when all tabs are disabled', () => {
    const allDisabled = [
      { id: 'a', label: 'Alpha', disabled: true },
      { id: 'b', label: 'Beta', disabled: true },
    ];
    render(TabsFixture, { tabs: allDisabled });

    expect(screen.queryByRole('tabpanel')).toBeNull();
  });

  it('positions the shared indicator from the active tab geometry', () => {
    const { flushFrames } = setupIndicatorRuntime();

    render(TabsFixture, { tabs: basicTabs, value: 'a' });

    const tablist = screen.getByRole('tablist');
    const tabs = screen.getAllByRole('tab');

    mockRect(tablist, { left: 100, width: 320 });
    mockRect(tabs[0], { left: 120, width: 80 });
    mockRect(tabs[1], { left: 220, width: 70 });
    mockRect(tabs[2], { left: 310, width: 90 });

    flushFrames();

    expect(tablist.style.getPropertyValue('--_indicator-left')).toBe('20px');
    expect(tablist.style.getPropertyValue('--_indicator-width')).toBe('80px');
  });

  it('hides the shared indicator when tabs transition to no active selection', async () => {
    const { flushFrames } = setupIndicatorRuntime();
    const { rerender } = render(TabsFixture, { tabs: basicTabs, value: 'a' });

    const tablist = screen.getByRole('tablist');
    const tabs = screen.getAllByRole('tab');

    mockRect(tablist, { left: 100, width: 320 });
    mockRect(tabs[0], { left: 120, width: 80 });
    mockRect(tabs[1], { left: 220, width: 70 });
    mockRect(tabs[2], { left: 310, width: 90 });

    flushFrames();
    expect(tablist.style.getPropertyValue('--_indicator-width')).toBe('80px');

    const allDisabled = [
      { id: 'a', label: 'Alpha', disabled: true },
      { id: 'b', label: 'Beta', disabled: true },
    ];

    await rerender({ tabs: allDisabled, value: 'a' });
    flushFrames();

    const updatedTablist = screen.getByRole('tablist');
    expect(updatedTablist.style.getPropertyValue('--_indicator-width')).toBe(
      '0',
    );
    expect(screen.queryByRole('tabpanel')).toBeNull();
  });

  it('recomputes the shared indicator when ResizeObserver fires', () => {
    const { flushFrames, instances, triggerResize } = setupIndicatorRuntime();

    render(TabsFixture, { tabs: basicTabs, value: 'a' });

    const tablist = screen.getByRole('tablist');
    const tabs = screen.getAllByRole('tab');

    mockRect(tablist, { left: 100, width: 320 });

    let activeLeft = 120;
    let activeWidth = 80;
    Object.defineProperty(tabs[0], 'getBoundingClientRect', {
      configurable: true,
      value: vi.fn(() =>
        createRect({
          left: activeLeft,
          width: activeWidth,
        }),
      ),
    });
    mockRect(tabs[1], { left: 220, width: 70 });
    mockRect(tabs[2], { left: 310, width: 90 });

    flushFrames();

    expect(tablist.style.getPropertyValue('--_indicator-left')).toBe('20px');
    expect(tablist.style.getPropertyValue('--_indicator-width')).toBe('80px');

    expect(instances[0]?.observe.mock.calls.map(([target]) => target)).toEqual(
      expect.arrayContaining([tablist, ...tabs]),
    );

    activeLeft = 155;
    activeWidth = 110;
    triggerResize();

    expect(tablist.style.getPropertyValue('--_indicator-left')).toBe('55px');
    expect(tablist.style.getPropertyValue('--_indicator-width')).toBe('110px');
  });

  // ── Click interaction ─────────────────────────────────────────────────

  it('switches tab on click and fires onchange', async () => {
    const onchange = vi.fn();
    render(TabsFixture, { tabs: basicTabs, value: 'a', onchange });

    await fireEvent.click(screen.getByText('Gamma'));

    expect(onchange).toHaveBeenCalledWith('c');
    expect(screen.getByTestId('panel-content').textContent).toBe(
      'Content for c',
    );
  });

  it('prevents activation of disabled tabs via native disabled attribute', () => {
    render(TabsFixture, { tabs: withDisabled, value: 'a' });

    const disabledTab = screen.getByText('Beta').closest('button')!;

    // Native disabled blocks clicks in real browsers — verify attribute is set
    expect(disabledTab.disabled).toBe(true);
    expect(disabledTab.getAttribute('aria-disabled')).toBe('true');
    expect(disabledTab.getAttribute('tabindex')).toBe('-1');
  });

  // ── Roving tabindex ───────────────────────────────────────────────────

  it('sets tabindex 0 on active tab and -1 on others', () => {
    render(TabsFixture, { tabs: basicTabs, value: 'b' });

    const tabs = screen.getAllByRole('tab');
    expect(tabs[0].getAttribute('tabindex')).toBe('-1');
    expect(tabs[1].getAttribute('tabindex')).toBe('0');
    expect(tabs[2].getAttribute('tabindex')).toBe('-1');
  });

  it('moves tabindex to focused tab after arrow key (independent of selection)', async () => {
    render(TabsFixture, { tabs: basicTabs, value: 'a' });

    const tabs = screen.getAllByRole('tab');
    tabs[0].focus();

    await fireEvent.keyDown(screen.getByRole('tablist'), {
      key: 'ArrowRight',
    });

    // Focus moved to 'b' but selection is still 'a'
    expect(document.activeElement).toBe(tabs[1]);
    // Roving tabindex follows focus, not selection
    expect(tabs[0].getAttribute('tabindex')).toBe('-1');
    expect(tabs[1].getAttribute('tabindex')).toBe('0');
    expect(tabs[2].getAttribute('tabindex')).toBe('-1');
    // Selection unchanged — panel still shows 'a'
    expect(screen.getByTestId('panel-content').textContent).toBe(
      'Content for a',
    );
  });

  it('resets roving tabindex to selected tab after activation', async () => {
    render(TabsFixture, { tabs: basicTabs, value: 'a' });

    const tabs = screen.getAllByRole('tab');
    tabs[0].focus();

    // Arrow to 'b'
    await fireEvent.keyDown(screen.getByRole('tablist'), {
      key: 'ArrowRight',
    });
    expect(tabs[1].getAttribute('tabindex')).toBe('0');

    // Activate 'b' by clicking it
    await fireEvent.click(tabs[1]);

    // Now selection is 'b', roving tabindex resets to match
    expect(tabs[1].getAttribute('tabindex')).toBe('0');
    expect(tabs[0].getAttribute('tabindex')).toBe('-1');
    expect(screen.getByTestId('panel-content').textContent).toBe(
      'Content for b',
    );
  });

  // ── Keyboard navigation ───────────────────────────────────────────────

  it('moves focus with ArrowRight (wrapping)', async () => {
    render(TabsFixture, { tabs: basicTabs, value: 'c' });

    const tabs = screen.getAllByRole('tab');
    tabs[2].focus();

    await fireEvent.keyDown(screen.getByRole('tablist'), {
      key: 'ArrowRight',
    });

    // Should wrap to first tab
    expect(document.activeElement).toBe(tabs[0]);
  });

  it('moves focus with ArrowLeft (wrapping)', async () => {
    render(TabsFixture, { tabs: basicTabs, value: 'a' });

    const tabs = screen.getAllByRole('tab');
    tabs[0].focus();

    await fireEvent.keyDown(screen.getByRole('tablist'), {
      key: 'ArrowLeft',
    });

    // Should wrap to last tab
    expect(document.activeElement).toBe(tabs[2]);
  });

  it('Home focuses first enabled tab, End focuses last', async () => {
    render(TabsFixture, { tabs: basicTabs, value: 'b' });

    const tabs = screen.getAllByRole('tab');
    const tablist = screen.getByRole('tablist');

    tabs[1].focus();
    await fireEvent.keyDown(tablist, { key: 'Home' });
    expect(document.activeElement).toBe(tabs[0]);

    tabs[0].focus();
    await fireEvent.keyDown(tablist, { key: 'End' });
    expect(document.activeElement).toBe(tabs[2]);
  });

  it('skips disabled tabs during arrow navigation', async () => {
    render(TabsFixture, { tabs: withDisabled, value: 'a' });

    const tabs = screen.getAllByRole('tab');
    tabs[0].focus();

    await fireEvent.keyDown(screen.getByRole('tablist'), {
      key: 'ArrowRight',
    });

    // Should skip disabled 'b' and land on 'c'
    expect(document.activeElement).toBe(tabs[2]);
  });

  it('does not throw when all tabs are disabled and arrow key is pressed', async () => {
    const allDisabled = [
      { id: 'a', label: 'Alpha', disabled: true },
      { id: 'b', label: 'Beta', disabled: true },
    ];
    const { container } = render(TabsFixture, { tabs: allDisabled });

    const tablist = container.querySelector('[role="tablist"]')!;

    // Should not throw
    await fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    await fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
    await fireEvent.keyDown(tablist, { key: 'Home' });
    await fireEvent.keyDown(tablist, { key: 'End' });
  });

  // ── Disabled tab attributes ───────────────────────────────────────────

  it('sets disabled and aria-disabled on disabled tabs', () => {
    render(TabsFixture, { tabs: withDisabled });

    const tabs = screen.getAllByRole('tab');
    expect(tabs[1].hasAttribute('disabled')).toBe(true);
    expect(tabs[1].getAttribute('aria-disabled')).toBe('true');
  });
});
