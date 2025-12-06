<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  import { showModal } from "../stores/modal.svelte";
  import Modal from "./Modal.svelte";

  let rangeValue = $state(50);

  // --- Configuration ---
  const SPOTLIGHT_RADIUS = 600;
  const MOUSE_LERP = 0.15; // Speed of light movement
  const COLOR_LERP = 0.15; // Speed of color transition (Lower = Smoother/Slower)

  // --- Helpers: Color Math ---

  // 1. Convert Hex to RGB Object
  function hexToRgb(hex: string) {
    // Remove whitespace and handle potential 'rgb' strings if browser computes them that way
    // For this system, we assume strict HEX from your design system
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 }; // Fallback black
  }

  // 2. Convert RGB Object back to CSS String
  function rgbToString(c: { r: number; g: number; b: number }) {
    // We use Math.round to ensure valid integer RGB values
    return `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;
  }

  // 3. The Math: Move 'current' towards 'target'
  function lerpColor(current: any, target: any, factor: number) {
    return {
      r: current.r + (target.r - current.r) * factor,
      g: current.g + (target.g - current.g) * factor,
      b: current.b + (target.b - current.b) * factor,
    };
  }

  // --- State ---
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let frameId: number;
  let observer: MutationObserver;

  let width = 0;
  let height = 0;
  let pointer = { x: 0, y: 0 };
  let light = { x: 0, y: 0 };

  // --- Palette State (The Magic Part) ---

  // What we want to reach (The CSS Variable value)
  let targetPalette = {
    canvas: { r: 1, g: 0, b: 32 },
    spotlight: { r: 10, g: 12, b: 43 },
  };

  // What we are actually drawing (The animated value)
  let currentPalette = {
    canvas: { r: 1, g: 0, b: 32 },
    spotlight: { r: 10, g: 12, b: 43 },
  };

  // --- 1. Dynamic Theme Fetching ---
  function updatePalette() {
    if (typeof window === "undefined") return;

    const styles = getComputedStyle(document.documentElement);

    // Get Raw Hex Strings
    const rawCanvas = styles.getPropertyValue("--bg-canvas").trim();
    // Use fallback if spotlight is missing
    const rawSpotlight =
      styles.getPropertyValue("--bg-spotlight").trim() ||
      styles.getPropertyValue("--neon-cyan").trim();

    // Parse and set TARGET only. Current will chase it in the render loop.
    if (rawCanvas) targetPalette.canvas = hexToRgb(rawCanvas);
    if (rawSpotlight) targetPalette.spotlight = hexToRgb(rawSpotlight);
  }

  // --- 2. Canvas Logic ---
  function resize() {
    if (!canvas) return;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    if (light.x === 0 && light.y === 0) {
      light.x = width / 2;
      light.y = height / 2;
      pointer.x = width / 2;
      pointer.y = height / 2;
    }
  }

  function handleMove(event: MouseEvent | TouchEvent) {
    let clientX, clientY;
    if ("touches" in event && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if ("clientX" in event) {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    if (typeof clientX === "number" && typeof clientY === "number") {
      pointer.x = clientX;
      pointer.y = clientY;
    }
  }

  function render() {
    if (!ctx) return;

    // STEP A: Animate Colors (Lerp current towards target)
    currentPalette.canvas = lerpColor(
      currentPalette.canvas,
      targetPalette.canvas,
      COLOR_LERP
    );
    currentPalette.spotlight = lerpColor(
      currentPalette.spotlight,
      targetPalette.spotlight,
      COLOR_LERP
    );

    // STEP B: Physics (Light Position)
    light.x += (pointer.x - light.x) * MOUSE_LERP;
    light.y += (pointer.y - light.y) * MOUSE_LERP;

    // STEP C: Draw
    // 1. Clear with Current Interpolated Color
    ctx.fillStyle = rgbToString(currentPalette.canvas);
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Spotlight
    if (Number.isFinite(light.x) && Number.isFinite(light.y)) {
      const gradient = ctx.createRadialGradient(
        light.x,
        light.y,
        0,
        light.x,
        light.y,
        SPOTLIGHT_RADIUS
      );

      gradient.addColorStop(0, rgbToString(currentPalette.spotlight));
      gradient.addColorStop(1, rgbToString(currentPalette.canvas)); // Fade to floor

      ctx.fillStyle = gradient;
      ctx.globalCompositeOperation = "source-over";
      ctx.fillRect(0, 0, width, height);
    }

    frameId = requestAnimationFrame(render);
  }

  onMount(() => {
    ctx = canvas.getContext("2d", { alpha: false })!;

    // Initial sync so we don't fade in from black on load
    updatePalette();
    currentPalette.canvas = { ...targetPalette.canvas };
    currentPalette.spotlight = { ...targetPalette.spotlight };

    resize();

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchmove", handleMove);

    observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-atmosphere"
        ) {
          updatePalette();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-atmosphere"],
    });

    frameId = requestAnimationFrame(render);
  });

  onDestroy(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
      cancelAnimationFrame(frameId);
      if (observer) observer.disconnect();
    }
  });

  // Simplified State Logic for Demo
  let atmosphere = $state("void");
  function setAtmosphere(atmosphereName: string) {
    document.documentElement.setAttribute("data-atmosphere", atmosphereName);
  }
  $effect(() => {
    setAtmosphere(atmosphere);
  });
</script>

<!-- svelte-ignore a11y_invalid_attribute -->
<main class="w-full min-h-screen">
  <header class="container flex-col items-center gap-24 mar-top-24">
    <h1 class="text-highlight">VOID ENERGY</h1>

    <div class="flex-col pad-24 gap-16 round-16 surface-glass">
      <p>System Architecture // Component Library</p>
      <select bind:value={atmosphere}>
        <option value="void">Void Atmosphere</option>
        <option value="crimson">Crimson Atmosphere</option>
        <option value="overgrowth">Overgrowth Atmosphere</option>
        <option value="velvet">Velvet Atmosphere</option>
        <option value="terminal">Terminal Atmosphere</option>
        <option value="paper">Paper Atmosphere</option>
      </select>
    </div>
  </header>

  <div class="container flex-col gap-48">
    <section class="flex-col gap-24 mar-top-24">
      <div class="flex-row justify-between items-end">
        <h2>01 // CONFIGURATION</h2>
        <p>SECURE CONNECTION</p>
      </div>

      <div class="surface-glass round-16 pad-32 flex-col gap-32">
        <div class="flex-row flex-wrap gap-24">
          <div class="flex-col gap-8 flex-1">
            <label class="pad-inline" for="system-identifier">
              System Identifier
            </label>
            <input
              id="system-identifier"
              type="text"
              placeholder="Enter Agent ID..."
            />
          </div>

          <div class="flex-col gap-8 flex-1">
            <label class="pad-inline" for="security-clearance">
              Security Clearance
            </label>
            <select id="security-clearance">
              <option>Level 1 - Observer</option>
              <option>Level 2 - Operator</option>
              <option>Level 3 - Administrator</option>
            </select>
          </div>
        </div>

        <div class="flex-col gap-8 flex-1">
          <div class="flex-row justify-between">
            <label class="pad-inline" for="energy-output">Energy Output</label>
            <span class="text-highlight">{rangeValue}%</span>
          </div>
          <input
            id="energy-output"
            type="range"
            bind:value={rangeValue}
            min="0"
            max="100"
          />
        </div>

        <div class="flex-row flex-wrap gap-32 border-top">
          <div class="flex-col gap-16">
            <label>
              <input type="radio" name="mode" checked />
              <span>Manual Override</span>
            </label>
            <label>
              <input type="radio" name="mode" />
              <span>Auto-Pilot</span>
            </label>
          </div>

          <div class="flex-col gap-16">
            <label>
              <input type="checkbox" checked />
              <span>Enable Telemetry</span>
            </label>
            <label>
              <input type="checkbox" />
              <span>Allow External Connections</span>
            </label>
          </div>
        </div>
      </div>
    </section>

    <section class="flex-col gap-24 mar-top-24">
      <h2>02 // DATA UPLOAD</h2>

      <div class="pad-24 round-16 surface-glass">
        <div class="dropzone">
          <input type="file" />
          <div class="dropzone-content">
            <span class="btn-icon">📂</span>
            <p>Upload Neural Patterns</p>
          </div>
        </div>
      </div>
    </section>

    <section class="flex-col gap-24 mar-top-24">
      <h2>03 // COMMAND DECK</h2>

      <div class="surface-glass round-16 pad-32 flex-col gap-32">
        <div class="flex-col items-center gap-24">
          <a class="link" href="https://dgrslabs.ink/"
            >Visit DGRS LABS website</a
          >
          <button
            class="btn-cta"
            onclick={() => {
              $showModal = true;
            }}
          >
            INITIATE SEQUENCE
          </button>
        </div>

        <div class="flex-row flex-wrap justify-center gap-16">
          <button class="btn-orb">Upgrade Core</button>
          <button class="btn-system">Diagnostics</button>
          <button class="btn-signal">Secure Channel</button>
          <button class="btn-alert">Purge Cache</button>
          <button>Default Action</button>
          <button disabled>Offline</button>
        </div>
      </div>
    </section>
  </div>

  <section class="flex-col gap-24 mar-y-24">
    <h2 class="container">04 // RECENT ANOMALIES</h2>

    <div class="tiles-collection">
      <a href="#" class="tile">
        <img
          src="https://media.dgrslabs.ink/conexus-sections/dischordiansaga.avif"
          alt="Cyber"
        />
        <div class="tile-data">
          <h5>Sector 7G</h5>
          <p>
            Status: <strong class="text-success">Active</strong>
          </p>
        </div>
      </a>

      <a href="#" class="tile">
        <img
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"
          alt="Abstract"
        />
        <div class="tile-data">
          <h5>Deep Net</h5>
          <p>Signal: 98%</p>
        </div>
      </a>

      <a href="#" class="tile">
        <img
          src="https://media.dgrslabs.ink/conexus-sections/communitypicks.avif"
          alt="Fluid"
        />
        <div class="tile-data">
          <h5>Core Dump</h5>
          <p>Size: 4.2 TB</p>
        </div>
      </a>

      <div class="loading-tile"></div>
    </div>
  </section>
</main>

<Modal />

<canvas bind:this={canvas}></canvas>

<style>
  canvas {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -100;
    pointer-events: none;
    /* We removed background-color transition here because Canvas handles it now */
  }
</style>
