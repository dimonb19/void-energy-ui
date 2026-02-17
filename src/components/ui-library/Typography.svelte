<section class="flex flex-col gap-md mt-md">
  <h2>07 // TYPOGRAPHY & TEXT</h2>

  <div class="surface-glass p-lg flex flex-col gap-lg">
    <p class="text-dim">
      The type system uses semantic tokens for size, weight, line-height, and
      letter-spacing. Headings use <code>--font-heading</code>, body text uses
      <code>--font-body</code>, and code elements use
      <code>--font-code</code>. All sizes scale with the
      <code>--text-scale</code> preference. Three opacity layers create visual
      hierarchy: <strong>main</strong> (headings),
      <strong>dim</strong> (body), and <strong>mute</strong> (metadata).
    </p>

    <!-- HEADING SCALE -->
    <div class="flex flex-col gap-xs">
      <h5>Heading Scale</h5>
      <p class="text-small text-mute">
        Five heading levels from <code>&lt;h1&gt;</code> through
        <code>&lt;h5&gt;</code>. H1-H4 use <code>--text-main</code> color; H5
        uses <code>--text-dim</code> as a subheading tier. Font family switches
        to <code>--font-heading</code> with tighter tracking at larger sizes. H1-H4
        have tablet-responsive size overrides.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-sm">
        <h1>h1 — Void Energy</h1>
        <h2>h2 — System Core</h2>
        <h3>h3 — Subsystem Module</h3>
        <h4>h4 — Section Header</h4>
        <h5>h5 — Subheading Tier</h5>
      </div>
    </div>

    <!-- BODY & SECONDARY TEXT -->
    <div class="flex flex-col gap-xs">
      <h5>Body & Secondary Text</h5>
      <p class="text-small text-mute">
        Three text layers: <code>&lt;p&gt;</code> at body size with
        <code>--text-dim</code>, <code>&lt;small&gt;</code> at small size with
        <code>--text-mute</code>, and utility classes for overriding the level
        inline.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-sm">
        <p>
          Paragraph — body typography, dim color. Standard readable text for
          descriptions and content.
        </p>
        <small
          >Small — small typography, mute color. Used for captions and metadata.</small
        >
        <p class="text-caption text-mute">
          .text-caption — caption level utility class.
        </p>
      </div>

      <p class="text-caption text-mute px-xs">
        Utility classes: <code>.text-h1</code> through <code>.text-h5</code>,
        <code>.text-body</code>, <code>.text-small</code>,
        <code>.text-caption</code>.
      </p>
    </div>

    <!-- CODE FAMILY -->
    <div class="flex flex-col gap-xs">
      <h5>Code Family</h5>
      <p class="text-small text-mute">
        Five semantic elements for code-related content, all using
        <code>--font-code</code> (monospace). Each has a distinct visual
        treatment: <code>&lt;code&gt;</code> is a recessed inline fragment,
        <code>&lt;pre&gt;</code> is a block-level sunk surface,
        <code>&lt;kbd&gt;</code> is a raised key cap,
        <code>&lt;samp&gt;</code> is plain monospace, and
        <code>&lt;var&gt;</code> is italic with energy-primary color.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <!-- Inline code -->
        <div class="flex flex-col gap-xs">
          <p class="text-small text-main">
            Inline code: Use <code>voidEngine.setAtmosphere('nova')</code> to switch
            themes.
          </p>
        </div>

        <!-- Code block -->
        <div class="flex flex-col gap-xs">
          <p class="text-small px-xs">Code Block</p>
          <pre><code
              >const engine = voidEngine;
engine.setAtmosphere('void');
engine.setPreferences(&#123;
  density: 'comfortable',
  textScale: 1.0,
&#125;);</code
            ></pre>
        </div>

        <!-- Keyboard -->
        <div class="flex flex-col gap-xs">
          <p class="text-small">
            Keyboard: Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>
            to open the command palette.
          </p>
        </div>

        <!-- Sample output -->
        <div class="flex flex-col gap-xs">
          <p class="text-small">
            Sample output: <samp
              >Build completed in 1.23s — 0 errors, 0 warnings</samp
            >
          </p>
        </div>

        <!-- Variable -->
        <div class="flex flex-col gap-xs">
          <p class="text-small">
            Variable: The energy threshold is <var>E</var> = <var>mc</var><sup
              >2</sup
            >, where <var>m</var> is mass.
          </p>
        </div>
      </div>
    </div>

    <!-- LINKS -->
    <div class="flex flex-col gap-xs">
      <h5>Links</h5>
      <p class="text-small text-mute">
        Default <code>&lt;a&gt;</code> inherits parent color and shows
        <code>--energy-primary</code> on hover. The <code>.link</code> class
        adds a laser-underline effect: a thin border at rest, an animated
        <code>::after</code> line that scales in from the right on hover.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-sm">
        <p>
          Default link: <a href="#void">Hover to see color shift</a> — inherits parent
          text color.
        </p>
        <p>
          Laser underline: <a href="#void" class="link"
            >Hover for laser effect</a
          >
          — uses <code>.link</code> class.
        </p>
      </div>
    </div>

    <!-- HORIZONTAL RULE -->
    <div class="flex flex-col gap-xs">
      <h5>Horizontal Rule</h5>
      <p class="text-small text-mute">
        Native <code>&lt;hr&gt;</code> styled with
        <code>--energy-secondary</code> at 30% opacity. Border width follows the
        physics preset.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-sm">
        <p>Content above the divider.</p>
        <hr />
        <p>Content below the divider.</p>
      </div>
    </div>

    <!-- TEXT UTILITIES -->
    <div class="flex flex-col gap-xs">
      <h5>Text Utilities</h5>
      <p class="text-small text-mute">
        Utility classes for overflow control. <code>.text-truncate</code>
        clips to a single line with ellipsis. <code>.text-clamp-2</code> and
        <code>.text-clamp-3</code> clip to 2 or 3 lines.
        <code>.text-break</code> forces word breaks for long unbroken strings.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <div class="flex flex-col gap-xs">
          <p class="text-small px-xs">.text-truncate</p>
          <p class="text-truncate surface-void p-sm" style="max-width: 20rem;">
            This is a very long heading that should be truncated to a single
            line with an ellipsis indicator at the end of the visible text.
          </p>
        </div>

        <div class="flex flex-col gap-xs">
          <p class="text-small px-xs">.text-clamp-2</p>
          <p class="text-clamp-2 surface-void p-sm" style="max-width: 20rem;">
            This is a longer paragraph that should be clamped to exactly two
            lines. Any content beyond the second line will be hidden and
            replaced with an ellipsis to indicate truncation. This extra text
            ensures we exceed two lines.
          </p>
        </div>

        <div class="flex flex-col gap-xs">
          <p class="text-small px-xs">.text-break</p>
          <p class="text-break surface-void p-sm" style="max-width: 20rem;">
            superlongstringwithnospaceslikeanapikieyorhashsk-void-4f8a9c2e7d1b3e6f0a5b8c4d2e1f7a9b
          </p>
        </div>
      </div>
    </div>

    <!-- LEGAL / LONG-FORM CONTENT -->
    <div class="flex flex-col gap-xs">
      <h5>Long-Form Content</h5>
      <p class="text-small text-mute">
        Wrap text in <code>.legal-content</code> to re-enable list styles
        (stripped globally by reset). Supports nested lists, uppercase/lowercase
        variants, and contract-style sub-numbering via
        <code>.subordered</code>.
      </p>

      <div class="surface-sunk p-md legal-content">
        <p><strong>Section 1 — System Requirements</strong></p>
        <ul>
          <li>Minimum 8 GB RAM</li>
          <li>
            Compatible graphics processor
            <ul>
              <li>WebGL 2.0 support required</li>
              <li>WebGPU recommended for glass physics</li>
            </ul>
          </li>
          <li>Network connectivity for telemetry sync</li>
        </ul>

        <p><strong>Section 2 — Operating Procedures</strong></p>
        <ol>
          <li>Initialize the void engine</li>
          <li>Select an atmosphere preset</li>
          <li>Configure user preferences</li>
        </ol>

        <ol class="uppercase">
          <li>Clearance Level Alpha</li>
          <li>Clearance Level Beta</li>
          <li>Clearance Level Gamma</li>
        </ol>

        <ol class="subordered">
          <li>
            The Operator shall initialize all subsystems prior to engagement.
            <ol class="subordered">
              <li>Navigation subsystem must report ready status.</li>
              <li>Propulsion subsystem must pass diagnostics.</li>
            </ol>
          </li>
          <li>Emergency shutdown procedures override all standing orders.</li>
        </ol>
      </div>
    </div>
  </div>
</section>
