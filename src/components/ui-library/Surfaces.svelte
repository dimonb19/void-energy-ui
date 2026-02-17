<section class="flex flex-col gap-md mt-md">
  <h2>08 // SURFACES</h2>

  <div class="surface-glass p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Surfaces are atomic texture classes that apply Void Physics to any element
      without enforcing layout or spacing. Two families: floating surfaces rise
      above the page (cards, panels) and sunk surfaces recess into it (input
      areas, groupings). Solid surfaces provide opaque backgrounds. All adapt to
      the active physics preset and color mode.
    </p>

    <!-- FLOATING SURFACES -->
    <div class="flex flex-col gap-xs">
      <h5>Floating Surfaces</h5>
      <p class="text-small text-mute">
        <code>.surface-glass</code> applies <code>glass-float</code> physics:
        border, shadow, and backdrop blur (glass preset). The
        <code>-action</code> variant adds interactive states (hover lift, cursor
        pointer) for clickable cards.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md tablet:flex-row">
        <div class="surface-glass p-lg flex-1 flex flex-col gap-xs">
          <h5>.surface-glass</h5>
          <p class="text-small text-mute">
            Static floating card. No hover interaction. Use for decorative
            wrappers, panels, and content groupings.
          </p>
        </div>

        <div class="surface-glass-action p-lg flex-1 flex flex-col gap-xs">
          <h5>.surface-glass-action</h5>
          <p class="text-small text-mute">
            Interactive floating card. Hover lifts with glow and shadow. Cursor
            becomes pointer. Use for clickable cards and selectable items.
          </p>
        </div>
      </div>
    </div>

    <!-- SUNK SURFACE -->
    <div class="flex flex-col gap-xs">
      <h5>Sunk Surface</h5>
      <p class="text-small text-mute">
        <code>.surface-sunk</code> applies <code>glass-sunk</code> physics: inset
        shadow and recessed background. Used throughout this page as the demo container
        for each sub-section. Also used for input groupings and sidebar areas.
      </p>

      <div class="surface-sunk p-lg flex flex-col gap-xs">
        <h5>.surface-sunk</h5>
        <p class="text-small text-mute">
          Recessed container. Inset shadow creates depth. Background uses
          <code>--bg-sink</code> token. Focus ring appears on focusable children.
        </p>
      </div>
    </div>

    <!-- SOLID SURFACES -->
    <div class="flex flex-col gap-xs">
      <h5>Solid Surfaces</h5>
      <p class="text-small text-mute">
        Opaque backgrounds with a thin physics border. No blur or shadow.
        <code>.surface-void</code> uses <code>--bg-canvas</code> (the page
        background). <code>.surface-spotlight</code> uses
        <code>--bg-spotlight</code> (slightly lighter) for highlighted sections.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md tablet:flex-row">
        <div class="surface-void p-lg flex-1 flex flex-col gap-xs">
          <h5>.surface-void</h5>
          <p class="text-small text-mute">
            Solid canvas background. Matches the page base. Use for masking
            overlaps or solid header bars.
          </p>
        </div>

        <div class="surface-spotlight p-lg flex-1 flex flex-col gap-xs">
          <h5>.surface-spotlight</h5>
          <p class="text-small text-mute">
            Slightly lighter solid background. Use for active sections,
            highlighted rows, or feature callouts.
          </p>
        </div>
      </div>
    </div>

    <p class="text-caption text-mute px-xs">
      Surfaces only set background, border, and shadow. Combine them with
      Tailwind layout classes (<code>p-lg</code>, <code>flex</code>,
      <code>gap-md</code>) for spacing. All surfaces adapt to glass, flat, and
      retro physics presets automatically.
    </p>
  </div>
</section>
