/**
 * Laser Aim Action — Cursor-tracking comet head for `.btn-cta`.
 *
 * When applied to a CTA button, the rotating gradient ring's comet head tracks
 * the pointer on hover instead of pausing at a random angle. The action sets
 * `--cta-aim` from `pointermove` and toggles `data-aim="on"` so SCSS can gate
 * the override — CTAs without the action keep their default paused-on-hover
 * behavior.
 *
 * Skips coarse-pointer devices (touch) — no cursor to follow.
 *
 * @example
 * <button class="btn btn-cta" use:laserAim>Continue</button>
 */

interface LaserAimOptions {
  enabled?: boolean;
}

// Comet peak (deg, clockwise from north — CSS conic-gradient origin) must
// match the bright primary band in `_gemini-laser`'s conic-gradient stops
// (currently 170°-210°, peak 190°) in src/styles/components/_buttons.scss.
// If you retune those stops, update this constant so cursor tracking still
// aligns with the comet.
//
// Angle math: atan2(dy, dx) is clockwise-from-east. +90° lifts to
// clockwise-from-north; −COMET_PEAK_DEG aligns the comet with the cursor.
const COMET_PEAK_DEG = 190;
const ANGLE_OFFSET_DEG = 90 - COMET_PEAK_DEG;

export function laserAim(node: HTMLElement, options: LaserAimOptions = {}) {
  const isCoarse = matchMedia('(pointer: coarse)').matches;
  let bound = false;
  let pending: PointerEvent | null = null;
  let frame = 0;

  const apply = (e: PointerEvent) => {
    const r = node.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const deg = (Math.atan2(dy, dx) * 180) / Math.PI + ANGLE_OFFSET_DEG;
    node.style.setProperty('--cta-aim', `${deg}deg`);
  };

  // rAF-coalesce: pointermove fires up to ~120Hz, but the SCSS override
  // already smooths the rotation via `transition`. One update per frame is
  // plenty and keeps the conic-gradient repaint cost predictable.
  const update = (e: PointerEvent) => {
    pending = e;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (pending) apply(pending);
    });
  };

  const enable = () => {
    if (bound || isCoarse) return;
    // pointerenter primes --cta-aim so the comet snaps to the cursor on the
    // first hovered frame, not 0° — covers the keyboard-tab + mouse-arrival
    // case where pointermove may not fire immediately.
    node.addEventListener('pointerenter', update);
    node.addEventListener('pointermove', update);
    node.dataset.aim = 'on';
    bound = true;
  };

  const disable = () => {
    if (!bound) return;
    node.removeEventListener('pointerenter', update);
    node.removeEventListener('pointermove', update);
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    pending = null;
    delete node.dataset.aim;
    node.style.removeProperty('--cta-aim');
    bound = false;
  };

  if (options.enabled ?? true) enable();

  return {
    update(next: LaserAimOptions) {
      const enabled = next.enabled ?? true;
      if (enabled) enable();
      else disable();
    },
    destroy: disable,
  };
}
