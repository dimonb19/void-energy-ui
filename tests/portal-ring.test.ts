import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/svelte';

import PortalRing from '@components/icons/PortalRing.svelte';

function createRect(): DOMRect {
  return {
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: 400,
    bottom: 400,
    width: 400,
    height: 400,
    toJSON() {
      return {};
    },
  } as DOMRect;
}

describe('PortalRing', () => {
  function mockIntersectionObserver() {
    let callback:
      | ((
          entries: IntersectionObserverEntry[],
          observer: IntersectionObserver,
        ) => void)
      | null = null;

    class TestIntersectionObserver {
      constructor(
        nextCallback: (
          entries: IntersectionObserverEntry[],
          observer: IntersectionObserver,
        ) => void,
      ) {
        callback = nextCallback;
      }

      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    }

    Object.defineProperty(globalThis, 'IntersectionObserver', {
      value: TestIntersectionObserver,
      configurable: true,
      writable: true,
    });

    function setIntersection(target: Element, isIntersecting: boolean) {
      callback?.(
        [
          {
            target,
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

    return { setIntersection };
  }

  it('skips global tracking and animation work when intensity is zero', async () => {
    const { setIntersection } = mockIntersectionObserver();
    const windowAddListenerSpy = vi.spyOn(window, 'addEventListener');
    const rafSpy = vi
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation(() => 1);

    const { container } = render(PortalRing, { intensity: 0 });
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();

    Object.defineProperty(svg!, 'getBoundingClientRect', {
      configurable: true,
      value: vi.fn(() => createRect()),
    });

    setIntersection(svg!, true);
    await Promise.resolve();
    await fireEvent.pointerMove(window, { clientX: 260, clientY: 260 });

    expect(
      windowAddListenerSpy.mock.calls.some(([type]) => type === 'pointermove'),
    ).toBe(false);
    expect(rafSpy).not.toHaveBeenCalled();
  });

  it('tracks the global pointer only while visible and reuses cached bounds', async () => {
    const { setIntersection } = mockIntersectionObserver();
    const windowAddListenerSpy = vi.spyOn(window, 'addEventListener');
    const frameQueue: FrameRequestCallback[] = [];
    const rafSpy = vi
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation((callback: FrameRequestCallback) => {
        frameQueue.push(callback);
        return frameQueue.length;
      });

    const { container } = render(PortalRing, { intensity: 1 });
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();

    const rectSpy = vi.fn(() => createRect());
    Object.defineProperty(svg!, 'getBoundingClientRect', {
      configurable: true,
      value: rectSpy,
    });

    await fireEvent.pointerMove(window, { clientX: 200, clientY: 200 });

    expect(rectSpy).toHaveBeenCalledTimes(0);
    expect(rafSpy).toHaveBeenCalledTimes(0);

    setIntersection(svg!, true);
    await Promise.resolve();

    expect(
      windowAddListenerSpy.mock.calls.some(([type]) => type === 'pointermove'),
    ).toBe(true);

    await fireEvent.pointerMove(window, { clientX: 200, clientY: 200 });

    expect(rectSpy).toHaveBeenCalledTimes(1);
    expect(rafSpy).toHaveBeenCalledTimes(1);
    expect(frameQueue).toHaveLength(1);

    frameQueue.shift()!(16);
    expect(rafSpy).toHaveBeenCalledTimes(2);

    await fireEvent.pointerMove(window, { clientX: 260, clientY: 260 });
    await fireEvent.pointerMove(window, { clientX: 280, clientY: 280 });

    expect(rectSpy).toHaveBeenCalledTimes(1);

    await fireEvent.scroll(window);
    expect(rectSpy).toHaveBeenCalledTimes(2);

    await fireEvent.pointerMove(window, { clientX: 300, clientY: 300 });
    expect(rectSpy).toHaveBeenCalledTimes(2);

    await fireEvent.pointerOut(window, { relatedTarget: null });

    let timestamp = 32;
    let safety = 100;

    while (frameQueue.length > 0 && safety-- > 0) {
      const nextFrame = frameQueue.shift();
      nextFrame?.(timestamp);
      timestamp += 16;
    }

    expect(frameQueue).toHaveLength(0);
  });
});
