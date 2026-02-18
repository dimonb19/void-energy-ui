<section id="typography" class="flex flex-col gap-md">
  <h2>01 // TYPOGRAPHY & TEXT</h2>

  <div class="surface-glass p-lg flex flex-col gap-lg">
    <p class="text-dim">
      A complete type system with headings, body text, code elements, and
      utility classes. Every size scales with user preferences &mdash; change
      the text scale or switch the atmosphere and all typography adapts
      instantly. Three emphasis layers (main, dim, mute) create clear visual
      hierarchy across any theme.
    </p>

    <details>
      <summary>Technical Details</summary>
      <p class="p-md">
        The type system uses semantic tokens for size, weight, line-height, and
        letter-spacing. Headings use <code>--font-heading</code>, body text uses
        <code>--font-body</code>, and code elements use
        <code>--font-code</code>. All sizes scale with the
        <code>--text-scale</code> preference. Three opacity layers create visual
        hierarchy: <strong>main</strong> (headings),
        <strong>dim</strong> (body), and <strong>mute</strong> (metadata).
      </p>
    </details>

    <!-- HEADING SCALE -->
    <div class="flex flex-col gap-sm">
      <h5>Heading Scale</h5>
      <p class="text-small text-mute">
        Five heading levels from <code>&lt;h1&gt;</code> through
        <code>&lt;h5&gt;</code>. H1-H4 use <code>--text-main</code> color; H5
        uses <code>--text-dim</code> as a subheading tier. Font family switches
        to <code>--font-heading</code> with tighter tracking at larger sizes.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <h1>h1 — Void Energy</h1>
        <h2>h2 — System Core</h2>
        <h3>h3 — Subsystem Module</h3>
        <h4>h4 — Section Header</h4>
        <h5>h5 — Subheading Tier</h5>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;h1&gt;Page Title&lt;/h1&gt;
&lt;h2&gt;Section Heading&lt;/h2&gt;
&lt;h3&gt;Subsection&lt;/h3&gt;
&lt;h4&gt;Group Header&lt;/h4&gt;
&lt;h5&gt;Subheading&lt;/h5&gt;

&lt;!-- Override size inline via utility class --&gt;
&lt;p class="text-h3"&gt;Body text at h3 size&lt;/p&gt;</code
          ></pre>
      </details>
    </div>

    <!-- BODY & SECONDARY TEXT -->
    <div class="flex flex-col gap-sm">
      <h5>Body & Secondary Text</h5>
      <p class="text-small text-mute">
        Three text layers: <code>&lt;p&gt;</code> at body size with
        <code>--text-dim</code>, <code>&lt;small&gt;</code> at small size with
        <code>--text-mute</code>, and utility classes for overriding the level
        inline. Use <code>.text-primary</code> for accent-colored text that matches
        the active atmosphere's energy color.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
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
        <p class="text-primary">
          .text-primary — accent color, matches <code>--energy-primary</code>.
        </p>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;p&gt;Body text — default readable paragraph.&lt;/p&gt;
&lt;small&gt;Caption or metadata text.&lt;/small&gt;
&lt;p class="text-caption text-mute"&gt;Utility class override.&lt;/p&gt;

&lt;!-- Size utility classes --&gt;
&lt;p class="text-h1"&gt;...&lt;/p&gt; through &lt;p class="text-h5"&gt;...&lt;/p&gt;
&lt;p class="text-body"&gt;...&lt;/p&gt;
&lt;p class="text-small"&gt;...&lt;/p&gt;
&lt;p class="text-caption"&gt;...&lt;/p&gt;</code
          ></pre>
      </details>
    </div>

    <!-- CODE FAMILY -->
    <div class="flex flex-col gap-sm">
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
        <div class="flex flex-col gap-xs">
          <p class="text-small text-main">
            Inline code: Use <code>voidEngine.setAtmosphere('nova')</code> to switch
            themes.
          </p>
        </div>

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

        <div class="flex flex-col gap-xs">
          <p class="text-small">
            Keyboard: Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>
            to open the command palette.
          </p>
        </div>

        <div class="flex flex-col gap-xs">
          <p class="text-small">
            Sample output: <samp
              >Build completed in 1.23s — 0 errors, 0 warnings</samp
            >
          </p>
        </div>

        <div class="flex flex-col gap-xs">
          <p class="text-small">
            Variable: The energy threshold is <var>E</var> = <var>mc</var><sup
              >2</sup
            >, where <var>m</var> is mass.
          </p>
        </div>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;!-- Inline code --&gt;
&lt;p&gt;Use &lt;code&gt;functionName()&lt;/code&gt; to call it.&lt;/p&gt;

&lt;!-- Code block --&gt;
&lt;pre&gt;&lt;code&gt;const x = 42;&lt;/code&gt;&lt;/pre&gt;

&lt;!-- Keyboard shortcut --&gt;
&lt;kbd&gt;Ctrl&lt;/kbd&gt; + &lt;kbd&gt;S&lt;/kbd&gt;

&lt;!-- Sample output --&gt;
&lt;samp&gt;Build completed in 1.23s&lt;/samp&gt;

&lt;!-- Variable --&gt;
&lt;var&gt;E&lt;/var&gt; = &lt;var&gt;mc&lt;/var&gt;&lt;sup&gt;2&lt;/sup&gt;</code
          ></pre>
      </details>
    </div>

    <!-- LINKS -->
    <div class="flex flex-col gap-sm">
      <h5>Links</h5>
      <p class="text-small text-mute">
        Default <code>&lt;a&gt;</code> inherits parent color and shows
        <code>--energy-primary</code> on hover. The <code>.link</code> class
        adds a laser-underline effect: a thin border at rest, an animated
        <code>::after</code> line that scales in from the right on hover.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
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

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;!-- Default link (color shift on hover) --&gt;
&lt;a href="/page"&gt;Standard link&lt;/a&gt;

&lt;!-- Laser underline link --&gt;
&lt;a href="/page" class="link"&gt;Animated underline&lt;/a&gt;</code
          ></pre>
      </details>
    </div>

    <!-- HORIZONTAL RULE -->
    <div class="flex flex-col gap-sm">
      <h5>Horizontal Rule</h5>
      <p class="text-small text-mute">
        Native <code>&lt;hr&gt;</code> styled with
        <code>--energy-secondary</code> at 30% opacity. Border width follows the
        physics preset.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <p>Content above the divider.</p>
        <hr />
        <p>Content below the divider.</p>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code>&lt;hr /&gt;</code></pre>
      </details>
    </div>

    <!-- TEXT UTILITIES -->
    <div class="flex flex-col gap-sm">
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
          <p class="text-truncate surface-void p-sm max-w-xl">
            This is a very long heading that should be truncated to a single
            line with an ellipsis indicator at the end of the visible text.
          </p>
        </div>

        <div class="flex flex-col gap-xs">
          <p class="text-small px-xs">.text-clamp-2</p>
          <p class="text-clamp-2 surface-void p-sm max-w-xl">
            This is a longer paragraph that should be clamped to exactly two
            lines. Any content beyond the second line will be hidden and
            replaced with an ellipsis to indicate truncation. This extra text
            ensures we exceed two lines.
          </p>
        </div>

        <div class="flex flex-col gap-xs">
          <p class="text-small px-xs">.text-break</p>
          <p class="text-break surface-void p-sm max-w-xl">
            superlongstringwithnospaceslikeanapikieyorhashsk-void-4f8a9c2e7d1b3e6f0a5b8c4d2e1f7a9b
          </p>
        </div>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;!-- Single-line truncation --&gt;
&lt;p class="text-truncate"&gt;Very long text...&lt;/p&gt;

&lt;!-- Multi-line clamping --&gt;
&lt;p class="text-clamp-2"&gt;Clamps to 2 lines...&lt;/p&gt;
&lt;p class="text-clamp-3"&gt;Clamps to 3 lines...&lt;/p&gt;

&lt;!-- Force word breaks --&gt;
&lt;p class="text-break"&gt;superlongstring...&lt;/p&gt;</code
          ></pre>
      </details>
    </div>

    <!-- LEGAL / LONG-FORM CONTENT -->
    <div class="flex flex-col gap-sm">
      <h5>Long-Form Content</h5>
      <p class="text-small text-mute">
        Wrap text in <code>.legal-content</code> to re-enable list styles
        (stripped globally by reset). Supports nested lists, uppercase/lowercase
        variants, and contract-style sub-numbering via
        <code>.subordered</code>.
      </p>

      <div class="surface-sunk p-md legal-content">
        <p><strong>Section 1 — Getting Started</strong></p>
        <ul>
          <li>Install the package via npm or pnpm</li>
          <li>
            Configure your environment
            <ul>
              <li>Tailwind for layout utilities</li>
              <li>SCSS for physics and materials</li>
            </ul>
          </li>
          <li>Import design tokens and begin building</li>
        </ul>

        <p><strong>Section 2 — Core Principles</strong></p>
        <ol>
          <li>Choose an atmosphere preset</li>
          <li>Configure physics and color mode</li>
          <li>Set density and typography preferences</li>
        </ol>

        <ol class="uppercase">
          <li>Atmosphere Layer</li>
          <li>Physics Layer</li>
          <li>Mode Layer</li>
        </ol>

        <ol class="subordered">
          <li>
            All components must use semantic tokens for color and spacing.
            <ol class="subordered">
              <li>No raw pixel values in production code.</li>
              <li>No hardcoded hex colors in component files.</li>
            </ol>
          </li>
          <li>State changes are always expressed via data attributes.</li>
        </ol>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;div class="legal-content"&gt;
  &lt;ul&gt;
    &lt;li&gt;Unordered list item&lt;/li&gt;
    &lt;li&gt;Nested:
      &lt;ul&gt;&lt;li&gt;Sub-item&lt;/li&gt;&lt;/ul&gt;
    &lt;/li&gt;
  &lt;/ul&gt;

  &lt;ol&gt;&lt;li&gt;Ordered list&lt;/li&gt;&lt;/ol&gt;
  &lt;ol class="uppercase"&gt;&lt;li&gt;A, B, C...&lt;/li&gt;&lt;/ol&gt;
  &lt;ol class="subordered"&gt;
    &lt;li&gt;1.
      &lt;ol class="subordered"&gt;&lt;li&gt;1.1&lt;/li&gt;&lt;/ol&gt;
    &lt;/li&gt;
  &lt;/ol&gt;
&lt;/div&gt;</code
          ></pre>
      </details>
    </div>
  </div>
</section>
