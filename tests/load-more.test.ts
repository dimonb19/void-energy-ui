import { describe, expect, it, vi, beforeEach, type Mock } from 'vitest';
import { fireEvent, render, screen, cleanup } from '@testing-library/svelte';
import LoadMoreFixture from './fixtures/load-more-fixture.svelte';

// ---------------------------------------------------------------------------
// Per-test IntersectionObserver mock (portal-ring pattern)
// ---------------------------------------------------------------------------

type IOCallback = (
  entries: IntersectionObserverEntry[],
  observer: IntersectionObserver,
) => void;

function createRect(): DOMRect {
  return {
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: 100,
    bottom: 1,
    width: 100,
    height: 1,
    toJSON() {
      return {};
    },
  } as DOMRect;
}

function mockIntersectionObserver() {
  let callback: IOCallback | null = null;
  const observeSpy = vi.fn();
  const disconnectSpy = vi.fn();

  class TestIntersectionObserver {
    constructor(cb: IOCallback) {
      callback = cb;
    }
    observe = observeSpy;
    unobserve = vi.fn();
    disconnect = disconnectSpy;
  }

  Object.defineProperty(globalThis, 'IntersectionObserver', {
    value: TestIntersectionObserver,
    configurable: true,
    writable: true,
  });

  function triggerIntersection(isIntersecting: boolean) {
    const sentinel = document.querySelector('.load-more-sentinel');
    if (!sentinel) return;
    callback?.(
      [
        {
          target: sentinel,
          isIntersecting,
          intersectionRatio: isIntersecting ? 1 : 0,
          time: 0,
          boundingClientRect: createRect(),
          intersectionRect: isIntersecting ? createRect() : createRect(),
          rootBounds: null,
        } as IntersectionObserverEntry,
      ],
      {} as IntersectionObserver,
    );
  }

  return { observeSpy, disconnectSpy, triggerIntersection };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('LoadMore', () => {
  beforeEach(() => {
    cleanup();
  });

  // ── Rendering ─────────────────────────────────────────────────────────

  it('renders button when hasMore is true', () => {
    mockIntersectionObserver();
    const onloadmore = vi.fn();
    render(LoadMoreFixture, { hasMore: true, onloadmore });
    expect(screen.getByRole('button', { name: 'Load more' })).toBeTruthy();
  });

  it('hides everything when hasMore is false', () => {
    mockIntersectionObserver();
    const onloadmore = vi.fn();
    render(LoadMoreFixture, { hasMore: false, onloadmore });
    expect(screen.queryByRole('button')).toBeNull();
    expect(document.querySelector('.load-more-sentinel')).toBeNull();
  });

  it('renders custom label on the button', () => {
    mockIntersectionObserver();
    const onloadmore = vi.fn();
    render(LoadMoreFixture, {
      hasMore: true,
      onloadmore,
      label: 'Show more results',
    });
    expect(
      screen.getByRole('button', { name: 'Show more results' }),
    ).toBeTruthy();
  });

  // ── Sentinel presence ─────────────────────────────────────────────────

  it('renders sentinel when observer is true', () => {
    mockIntersectionObserver();
    const onloadmore = vi.fn();
    render(LoadMoreFixture, { hasMore: true, observer: true, onloadmore });
    expect(document.querySelector('.load-more-sentinel')).not.toBeNull();
  });

  it('does not render sentinel when observer is false', () => {
    mockIntersectionObserver();
    const onloadmore = vi.fn();
    render(LoadMoreFixture, { hasMore: true, observer: false, onloadmore });
    expect(document.querySelector('.load-more-sentinel')).toBeNull();
  });

  // ── Button interaction ────────────────────────────────────────────────

  it('fires onloadmore when button is clicked', async () => {
    mockIntersectionObserver();
    const onloadmore = vi.fn();
    render(LoadMoreFixture, { hasMore: true, onloadmore });

    await fireEvent.click(screen.getByRole('button', { name: 'Load more' }));
    expect(onloadmore).toHaveBeenCalledOnce();
  });

  it('disables button when loading is true', () => {
    mockIntersectionObserver();
    const onloadmore = vi.fn();
    render(LoadMoreFixture, { hasMore: true, loading: true, onloadmore });

    const btn = screen.getByRole('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('shows loading text when loading is true', () => {
    mockIntersectionObserver();
    const onloadmore = vi.fn();
    render(LoadMoreFixture, { hasMore: true, loading: true, onloadmore });

    const btn = screen.getByRole('button');
    expect(btn.textContent).toContain('Loading');
  });

  // ── Observer triggers ─────────────────────────────────────────────────

  it('calls onloadmore when sentinel intersects', () => {
    const { triggerIntersection } = mockIntersectionObserver();
    const onloadmore = vi.fn();
    render(LoadMoreFixture, { hasMore: true, observer: true, onloadmore });

    triggerIntersection(true);
    expect(onloadmore).toHaveBeenCalledOnce();
  });

  it('does not call onloadmore when sentinel exits viewport', () => {
    const { triggerIntersection } = mockIntersectionObserver();
    const onloadmore = vi.fn();
    render(LoadMoreFixture, { hasMore: true, observer: true, onloadmore });

    triggerIntersection(false);
    expect(onloadmore).not.toHaveBeenCalled();
  });

  it('does not call onloadmore via observer while loading is true', () => {
    const { observeSpy } = mockIntersectionObserver();
    const onloadmore = vi.fn();
    render(LoadMoreFixture, {
      hasMore: true,
      loading: true,
      observer: true,
      onloadmore,
    });

    // Observer should not even be attached while loading
    expect(observeSpy).not.toHaveBeenCalled();
  });

  // ── Observer lifecycle ────────────────────────────────────────────────

  it('observes the sentinel element on mount', () => {
    const { observeSpy } = mockIntersectionObserver();
    const onloadmore = vi.fn();
    render(LoadMoreFixture, { hasMore: true, observer: true, onloadmore });

    expect(observeSpy).toHaveBeenCalledOnce();
    const observed = observeSpy.mock.calls[0][0] as Element;
    expect(observed.classList.contains('load-more-sentinel')).toBe(true);
  });

  it('disconnects observer on unmount', () => {
    const { disconnectSpy } = mockIntersectionObserver();
    const onloadmore = vi.fn();
    const { unmount } = render(LoadMoreFixture, {
      hasMore: true,
      observer: true,
      onloadmore,
    });

    unmount();
    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('disconnects observer when hasMore transitions from true to false', async () => {
    const { disconnectSpy } = mockIntersectionObserver();
    const onloadmore = vi.fn();
    const { rerender } = render(LoadMoreFixture, {
      hasMore: true,
      observer: true,
      onloadmore,
    });

    // Sentinel and observer are active. Transition hasMore → false.
    await rerender({ hasMore: false, onloadmore });

    // The effect cleanup must have run, disconnecting the previous observer.
    expect(disconnectSpy).toHaveBeenCalled();
    // Sentinel is gone from the DOM.
    expect(document.querySelector('.load-more-sentinel')).toBeNull();
  });
});
