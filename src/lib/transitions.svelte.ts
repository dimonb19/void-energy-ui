import { cubicOut, cubicIn, quartOut } from 'svelte/easing';

/**
 * ==========================================================================
 * 🌌 VOID ENERGY UI: MOTION ENGINE (SVELTE ADAPTER)
 * ==========================================================================
 *
 * PURPOSE:
 * This library bridges the gap between Svelte's native transition engine
 * and the Void CSS Design System. Unlike standard Svelte transitions,
 * these functions are "System-Aware."
 *
 * HOW IT WORKS:
 * 1. Reads CSS Variables: It grabs `--speed-base`, `--physics-blur`, etc.,
 * directly from the DOM element.
 * 2. Theme Adaptation:
 * - In 'Void' theme: Animations use Blur + Scale (Glass Physics).
 * - In 'Retro' theme: Animations are instant or stepped (Terminal Physics).
 * 3. Accessibility: Automatically disables motion if 'prefers-reduced-motion' is true.
 *
 * USAGE GUIDE:
 * Import these functions and use them with Svelte directives (in:, out:, transition:).
 *
 * --- AVAILABLE TRANSITIONS ---
 *
 * 1. materialize (Entry)
 * - Best for: Cards, Modals, Route Transitions.
 * - Effect: Lifts up, scales in 96% -> 100%, focuses from blur.
 * - Usage: <div in:materialize={{ y: 20 }}>...</div>
 *
 * 2. dematerialize (Exit)
 * - Best for: Closing Modals, Dismissing Overlays.
 * - Effect: Floats UP like smoke, fades out, blurs heavily.
 * - Usage: <div out:dematerialize>...</div>
 *
 * 3. glitch (Entry)
 * - Best for: Hero Text, "System" Status Tags, decorative headers.
 * - Effect: Cyberpunk scanline reveal with jittery skew.
 * - Usage: <h1 in:glitch={{ delay: 200 }}>...</h1>
 *
 * 4. voidCollapse (Exit)
 * - Best for: Deleting Toasts, removing Chips/Tags.
 * - Effect: Smashes horizontally into a bright line, then vanishes.
 * - Usage: <div out:voidCollapse>...</div>
 *
 * ==========================================================================
 */

/* --- HELPER: Read the Physics Engine --- */
function getSystemConfig(node: Element) {
	const style = getComputedStyle(node);
	const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

	// Parse CSS variables (Fallbacks included)
	const speedBase = parseFloat(style.getPropertyValue('--speed-base')) * 1000 || 300;
	const speedFast = parseFloat(style.getPropertyValue('--speed-fast')) * 1000 || 200;
	const blurVal = style.getPropertyValue('--physics-blur') || '0px';
	// Remove "px" for math, but keep string for generic usage
	const blurInt = parseInt(blurVal) || 0;

	return { speedBase, speedFast, blurInt, reducedMotion };
}

/* ==========================================================================
   1. MATERIALIZE (Standard Entry)
   Use for: Modals, Cards, Route Transitions
   Logic: Lifts up, scales in, and focuses from blur.
   ========================================================================== */
export function materialize(
	node: HTMLElement,
	{ delay = 0, duration = null, y = 20 } = {}
) {
	const { speedBase, blurInt, reducedMotion } = getSystemConfig(node);

	if (reducedMotion) return { duration: 0, css: () => '' };

	return {
		delay,
		duration: duration ?? speedBase, // Defaults to System Speed
		easing: cubicOut,
		css: (t: number, u: number) => {
			// u goes from 1 -> 0
			const currentBlur = blurInt * u;
			return `
                transform: translateY(${u * y}px) scale(${0.96 + 0.04 * t});
                opacity: ${t};
                filter: blur(${currentBlur}px);
            `;
		}
	};
}

/* ==========================================================================
   2. DEMATERIALIZE (Standard Exit)
   Use for: Closing Modals, Dismissing Cards
   Logic: Floats UP (like smoke), fades out, and blurs heavily.
   ========================================================================== */
export function dematerialize(
	node: HTMLElement,
	{ delay = 0, duration = null, y = -30 } = {}
) {
	const { speedBase, blurInt, reducedMotion } = getSystemConfig(node);

	if (reducedMotion) return { duration: 0, css: () => '' };

	return {
		delay,
		duration: duration ?? speedBase, // Matches entry speed usually
		easing: cubicIn, // Accelerate out
		css: (t: number, u: number) => {
			// u goes from 0 -> 1 (Exit progress)
			// We double the blur for exit to make it look like it's dissolving
			const currentBlur = blurInt * 2 * u;
			return `
                transform: translateY(${u * y}px) scale(${1 - u * 0.05});
                opacity: ${t};
                filter: blur(${currentBlur}px);
            `;
		}
	};
}

/* ==========================================================================
   3. VOID GLITCH (Cyberpunk Entry)
   Use for: Hero Headings, "System" Status Tags, decorative elements.
   Logic: Scans the element in with a jittery skew effect.
   ========================================================================== */
export function glitch(node: HTMLElement, { delay = 0, duration = null } = {}) {
	const { speedFast, reducedMotion } = getSystemConfig(node);

	if (reducedMotion) return { duration: 0, css: () => '' };

	return {
		delay,
		duration: duration ?? speedFast, // Glitches should be fast
		css: (t: number) => {
			// Jitter skew: oscillates between 5deg and -5deg
			const skewed = (t * 100) % 2 === 0 ? 5 : -5;
			// Scanline clip: reveals from top to bottom
			const clipped = `polygon(0 0, 100% 0, 100% ${t * 100}%, 0 ${t * 100}%)`;

			// Only skew during the first 90% of animation to snap flat at the end
			const activeSkew = 1 - t > 0.1 ? skewed : 0;

			return `
                clip-path: ${clipped};
                transform: skewX(${activeSkew}deg);
                opacity: ${t};
            `;
		}
	};
}

/* ==========================================================================
   4. VOID COLLAPSE (Destructive Exit)
   Use for: Toast notifications, removing tags/chips, sidebar items.
   Logic: Smashes horizontally into a thin line of light (CRT TV off effect).
   ========================================================================== */
export function voidCollapse(
	node: HTMLElement,
	{ delay = 0, duration = null } = {}
) {
	const { speedFast, reducedMotion } = getSystemConfig(node);

	if (reducedMotion) return { duration: 0, css: () => '' };

	return {
		delay,
		duration: duration ?? speedFast, // Collapsing needs to be snappy
		easing: quartOut,
		css: (t: number, u: number) => {
			// t = 1 -> 0 (Opacity/ScaleX)
			// u = 0 -> 1 (Brightness/ScaleY)

			// 1. Scale X goes 1 -> 0
			// 2. Scale Y spikes (stretches) momentarily as it vanishes
			const scaleY = t < 0.2 ? t * 5 : 1;
            
            // 3. Flash bright white right before disappearing
			const brightness = 1 + u * 5; 

			return `
                opacity: ${t};
                transform: scaleX(${t}) scaleY(${scaleY});
                filter: brightness(${brightness});
                transform-origin: center;
            `;
		}
	};
}