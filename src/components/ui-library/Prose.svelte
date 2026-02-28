<section id="prose" class="flex flex-col gap-md">
  <h2>03 // PROSE & CONTENT</h2>

  <div class="surface-glass p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Semantic HTML elements for long-form content: inline text semantics,
      blockquotes, figures, and opt-in list styling. Every element adapts to the
      active physics preset and color mode &mdash; switch atmospheres to see how <code
        >mark</code
      >, <code>blockquote</code>, and list markers transform across glass, flat,
      and retro.
    </p>

    <details>
      <summary>Technical Details</summary>
      <p class="p-md">
        Inline elements (<code>mark</code>, <code>del</code>,
        <code>ins</code>, <code>sub</code>, <code>sup</code>,
        <code>abbr</code>, <code>q</code>, <code>cite</code>,
        <code>dfn</code>) are globally styled in
        <code>_typography.scss</code>. Block elements (<code>blockquote</code>,
        <code>figure</code>,
        <code>address</code>) and the <code>.prose</code> scope class live in
        <code>_prose.scss</code>. Lists are stripped globally by the reset
        &mdash; use <code>.prose</code> for general content or
        <code>.legal-content</code> for legal documents to re-enable markers.
      </p>
    </details>

    <!-- INLINE TEXT SEMANTICS -->
    <div class="flex flex-col gap-sm">
      <h5>Inline Text Semantics</h5>
      <p class="text-small text-mute">
        Nine semantic inline elements for annotating prose. All inherit parent
        font size and line height. <code>&lt;mark&gt;</code> is
        physics-differentiated: glass gets an energy-tinted background, light
        mode softens the tint, and retro inverts to solid
        <code>--energy-primary</code> with canvas-colored text.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <p>
          The experiment revealed <mark>a significant energy spike</mark> in the
          reactor core. Previous readings of
          <del>42.7 terawatts</del> were revised to
          <ins>51.3 terawatts</ins> after recalibration. The formula
          <var>E</var> = <var>mc</var><sup>2</sup> governs the conversion, where
          H<sub>2</sub>O serves as the coolant medium.
          <abbr title="Void Energy Reactor Interface">VERI</abbr> logs confirm
          the anomaly. As Dr. Vasquez noted,
          <q>the readings exceed all theoretical models</q>
          (<cite>Void Research Quarterly</cite>). This phenomenon, known as
          <dfn>energy cascade</dfn>, occurs when containment thresholds are
          breached. The <s>original safety protocols</s> have since been replaced.
        </p>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;p&gt;
  The experiment revealed &lt;mark&gt;a significant energy spike&lt;/mark&gt; in
  the reactor core. Previous readings of
  &lt;del&gt;42.7 terawatts&lt;/del&gt; were revised to
  &lt;ins&gt;51.3 terawatts&lt;/ins&gt; after recalibration. The formula
  &lt;var&gt;E&lt;/var&gt; = &lt;var&gt;mc&lt;/var&gt;&lt;sup&gt;2&lt;/sup&gt; governs the conversion,
  where H&lt;sub&gt;2&lt;/sub&gt;O serves as the coolant medium.
  &lt;abbr title="Void Energy Reactor Interface"&gt;VERI&lt;/abbr&gt; logs
  confirm the anomaly. As Dr. Vasquez noted,
  &lt;q&gt;the readings exceed all theoretical models&lt;/q&gt;
  (&lt;cite&gt;Void Research Quarterly&lt;/cite&gt;). This phenomenon, known as
  &lt;dfn&gt;energy cascade&lt;/dfn&gt;, occurs when containment thresholds are
  breached. The &lt;s&gt;original safety protocols&lt;/s&gt; have since been
  replaced.
&lt;/p&gt;</code
          ></pre>
      </details>
    </div>

    <!-- MARK — PHYSICS COMPARISON -->
    <div class="flex flex-col gap-sm">
      <h5>Mark &mdash; Physics Comparison</h5>
      <p class="text-small text-mute">
        The <code>&lt;mark&gt;</code> element changes appearance per physics
        preset. Glass: translucent
        <code>--energy-primary</code> at 25% opacity. Light mode: softened to 15%.
        Retro: solid inverted block with zero border-radius. Switch themes to compare.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <p>
          Glass/Flat dark: <mark>highlighted with energy glow</mark>
        </p>
        <p>
          Try switching to light mode (flat physics) or retro to see how this <mark
            >highlighted text</mark
          > adapts its treatment.
        </p>
      </div>
    </div>

    <!-- INDIVIDUAL ELEMENTS -->
    <div class="flex flex-col gap-sm">
      <h5>Individual Elements</h5>
      <p class="text-small text-mute">
        Each inline element isolated for reference. <code>del</code> and
        <code>s</code> share identical styling (strikethrough +
        <code>--text-mute</code>). <code>ins</code> uses
        <code>--color-success</code> underline. <code>q</code> adds
        <code>--energy-secondary</code> colored quote marks.
        <code>dfn</code> is italic + semibold at
        <code>--text-main</code> color.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <p><mark>mark</mark> &mdash; energy-colored highlight</p>
        <p><del>del</del> &mdash; deleted text, strikethrough</p>
        <p><s>s</s> &mdash; no longer accurate, strikethrough</p>
        <p><ins>ins</ins> &mdash; inserted text, success underline</p>
        <p>H<sub>2</sub>O &mdash; subscript</p>
        <p>E = mc<sup>2</sup> &mdash; superscript</p>
        <p>
          <abbr title="Void Energy Reactor Interface">VERI</abbr> &mdash; abbreviation
          (hover for tooltip)
        </p>
        <p><q>inline quotation</q> &mdash; italic with energy quotes</p>
        <p><cite>Citation Title</cite> &mdash; italic, muted</p>
        <p>
          <dfn>definition term</dfn> &mdash; italic, semibold, main color
        </p>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;mark&gt;highlighted text&lt;/mark&gt;
&lt;del&gt;deleted text&lt;/del&gt;
&lt;s&gt;inaccurate text&lt;/s&gt;
&lt;ins&gt;inserted text&lt;/ins&gt;
H&lt;sub&gt;2&lt;/sub&gt;O
E = mc&lt;sup&gt;2&lt;/sup&gt;
&lt;abbr title="Full Name"&gt;ABBR&lt;/abbr&gt;
&lt;q&gt;inline quotation&lt;/q&gt;
&lt;cite&gt;Citation Title&lt;/cite&gt;
&lt;dfn&gt;definition term&lt;/dfn&gt;</code
          ></pre>
      </details>
    </div>

    <!-- BLOCKQUOTE -->
    <div class="flex flex-col gap-sm">
      <h5>Blockquote</h5>
      <p class="text-small text-mute">
        Statement-level quotations with a physics-differentiated left border.
        Glass: inset glow from <code>--energy-primary</code>. Flat: solid left
        border. Retro: double border, thicker. Light mode adds a faint primary
        tint background. Nested blockquotes shift to
        <code>--energy-secondary</code>. Attribution via
        <code>&lt;footer&gt;</code> or <code>&lt;cite&gt;</code> inside the blockquote
        shows an em-dash prefix.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <blockquote>
          <p>
            The void is not empty. It is the canvas upon which all energy
            patterns are drawn. Every photon, every particle, every wave emerges
            from and returns to this fundamental substrate.
          </p>
        </blockquote>

        <blockquote>
          <p>
            Energy cannot be created or destroyed, only transformed. The reactor
            does not generate power &mdash; it reveals what was always there.
          </p>
          <footer>
            Dr. Elena Vasquez, <cite>Principles of Void Energy</cite>
          </footer>
        </blockquote>

        <blockquote>
          <p>The outer quote establishes context.</p>
          <blockquote>
            <p>
              The nested quote deepens the argument. Notice the border color
              shifts to the secondary energy accent.
            </p>
            <blockquote>
              <p>A third level, for deeply layered attribution.</p>
            </blockquote>
          </blockquote>
          <footer>Nested Attribution Example</footer>
        </blockquote>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;!-- Simple blockquote --&gt;
&lt;blockquote&gt;
  &lt;p&gt;The void is not empty...&lt;/p&gt;
&lt;/blockquote&gt;

&lt;!-- With attribution --&gt;
&lt;blockquote&gt;
  &lt;p&gt;Energy cannot be created or destroyed...&lt;/p&gt;
  &lt;footer&gt;Dr. Elena Vasquez, &lt;cite&gt;Principles of Void Energy&lt;/cite&gt;&lt;/footer&gt;
&lt;/blockquote&gt;

&lt;!-- Nested (border shifts to --energy-secondary) --&gt;
&lt;blockquote&gt;
  &lt;p&gt;Outer quote.&lt;/p&gt;
  &lt;blockquote&gt;
    &lt;p&gt;Nested quote with secondary accent.&lt;/p&gt;
  &lt;/blockquote&gt;
&lt;/blockquote&gt;</code
          ></pre>
      </details>
    </div>

    <!-- FIGURE & CAPTION -->
    <div class="flex flex-col gap-sm">
      <h5>Figure &amp; Caption</h5>
      <p class="text-small text-mute">
        The <code>&lt;figure&gt;</code> element wraps self-contained content
        (images, diagrams, code blocks) with an optional
        <code>&lt;figcaption&gt;</code> for description. Margins are reset inline;
        captions are muted italic at small size.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <figure>
          <div class="surface-sunk p-xl flex items-center justify-center">
            <p class="text-mute text-small">
              [ Image placeholder &mdash; 16:9 content area ]
            </p>
          </div>
          <figcaption>
            Figure 1 &mdash; Energy distribution map of the primary reactor
            chamber during peak output cycle.
          </figcaption>
        </figure>

        <figure>
          <pre><code
              >function initReactor(config: ReactorConfig) &#123;
  const core = new VoidCore(config);
  core.calibrate();
  return core.activate();
&#125;</code
            ></pre>
          <figcaption>
            Figure 2 &mdash; Reactor initialization sequence. The
            <code>calibrate()</code> step must complete before activation.
          </figcaption>
        </figure>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;!-- Figure with image --&gt;
&lt;figure&gt;
  &lt;img src="diagram.png" alt="Energy distribution map" /&gt;
  &lt;figcaption&gt;Figure 1 &amp;mdash; Energy distribution map.&lt;/figcaption&gt;
&lt;/figure&gt;

&lt;!-- Figure with code block --&gt;
&lt;figure&gt;
  &lt;pre&gt;&lt;code&gt;function initReactor() &#123; ... &#125;&lt;/code&gt;&lt;/pre&gt;
  &lt;figcaption&gt;Figure 2 &amp;mdash; Reactor initialization.&lt;/figcaption&gt;
&lt;/figure&gt;</code
          ></pre>
      </details>
    </div>

    <!-- ADDRESS -->
    <div class="flex flex-col gap-sm">
      <h5>Address</h5>
      <p class="text-small text-mute">
        The <code>&lt;address&gt;</code> element provides contact information.
        Styled with <code>font-style: normal</code> (overriding the browser
        default italic) and <code>--text-dim</code> color.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <address>
          Void Energy Research Lab<br />
          Sector 7, Level 42<br />
          New Geneva Research Campus<br />
          contact@void.energy
        </address>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;address&gt;
  Void Energy Research Lab&lt;br /&gt;
  Sector 7, Level 42&lt;br /&gt;
  New Geneva Research Campus&lt;br /&gt;
  contact@void.energy
&lt;/address&gt;</code
          ></pre>
      </details>
    </div>

    <!-- PROSE LISTS -->
    <div class="flex flex-col gap-sm">
      <h5>Prose Lists</h5>
      <p class="text-small text-mute">
        The <code>.prose</code> class re-enables list markers stripped by the
        global reset. Unordered lists use disc/circle/square nesting with
        <code>--energy-primary</code>
        colored markers. In retro physics, markers switch to text characters:
        <code>-</code>, <code>&gt;</code>, <code>*</code>. Ordered lists use
        decimal/lower-alpha/lower-roman with semibold markers. Cross-type
        nesting is supported. Definition lists use semibold terms with indented
        definitions.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md prose">
        <p><strong>Unordered List (3 levels)</strong></p>
        <ul>
          <li>
            Primary reactor systems
            <ul>
              <li>
                Core containment field
                <ul>
                  <li>Magnetic coil array</li>
                  <li>Plasma stabilizers</li>
                </ul>
              </li>
              <li>Coolant circulation</li>
            </ul>
          </li>
          <li>Secondary monitoring grid</li>
          <li>Emergency shutdown protocols</li>
        </ul>

        <p><strong>Ordered List (3 levels)</strong></p>
        <ol>
          <li>
            Initialize void core
            <ol>
              <li>
                Run diagnostic sweep
                <ol>
                  <li>Verify magnetic alignment</li>
                  <li>Confirm plasma density</li>
                </ol>
              </li>
              <li>Calibrate energy output</li>
            </ol>
          </li>
          <li>Engage containment field</li>
          <li>Begin energy extraction</li>
        </ol>

        <p><strong>Cross-Type Nesting</strong></p>
        <ul>
          <li>
            Safety checklist
            <ol>
              <li>Verify containment integrity</li>
              <li>Confirm coolant levels</li>
              <li>Test emergency shutoff</li>
            </ol>
          </li>
          <li>
            Maintenance schedule
            <ol>
              <li>Weekly coil inspection</li>
              <li>Monthly plasma flush</li>
            </ol>
          </li>
        </ul>

        <p><strong>Definition List</strong></p>
        <dl>
          <dt>Void Energy</dt>
          <dd>
            The fundamental energy substrate that permeates all space,
            extractable through resonance-based reactor technology.
          </dd>
          <dt>Physics Preset</dt>
          <dd>
            A visual rendering mode that controls surface materials: glass
            (translucent), flat (opaque), or retro (CRT-style).
          </dd>
          <dt>Atmosphere</dt>
          <dd>
            A complete theme definition including color palette, typography, and
            energy accent colors.
          </dd>
        </dl>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;div class="prose"&gt;
  &lt;!-- Unordered: disc → circle → square --&gt;
  &lt;ul&gt;
    &lt;li&gt;Level 1
      &lt;ul&gt;
        &lt;li&gt;Level 2
          &lt;ul&gt;&lt;li&gt;Level 3&lt;/li&gt;&lt;/ul&gt;
        &lt;/li&gt;
      &lt;/ul&gt;
    &lt;/li&gt;
  &lt;/ul&gt;

  &lt;!-- Ordered: decimal → lower-alpha → lower-roman --&gt;
  &lt;ol&gt;
    &lt;li&gt;Level 1
      &lt;ol&gt;
        &lt;li&gt;Level 2
          &lt;ol&gt;&lt;li&gt;Level 3&lt;/li&gt;&lt;/ol&gt;
        &lt;/li&gt;
      &lt;/ol&gt;
    &lt;/li&gt;
  &lt;/ol&gt;

  &lt;!-- Cross-type nesting --&gt;
  &lt;ul&gt;
    &lt;li&gt;Unordered parent
      &lt;ol&gt;&lt;li&gt;Ordered child&lt;/li&gt;&lt;/ol&gt;
    &lt;/li&gt;
  &lt;/ul&gt;

  &lt;!-- Definition list --&gt;
  &lt;dl&gt;
    &lt;dt&gt;Term&lt;/dt&gt;
    &lt;dd&gt;Definition text.&lt;/dd&gt;
  &lt;/dl&gt;
&lt;/div&gt;</code
          ></pre>
      </details>
    </div>

    <!-- LEGAL CONTENT -->
    <div class="flex flex-col gap-sm">
      <h5>Legal Content</h5>
      <p class="text-small text-mute">
        The <code>.legal-content</code> scope class (defined in
        <code>_typography.scss</code>) re-enables list markers with standard
        browser styling &mdash; no energy coloring. Supports
        <code>.uppercase</code> and <code>.lowercase</code> ordered list
        variants, contract-style <code>.subordered</code> counters (1.1, 1.2), and
        laser-underline links. Use for terms of service, privacy policies, and formal
        documentation.
      </p>

      <div class="surface-sunk p-md legal-content">
        <p><strong>Section 1 &mdash; Getting Started</strong></p>
        <ul>
          <li>Install the package via npm or pnpm</li>
          <li>
            Configure your environment
            <ul>
              <li>Tailwind for layout utilities</li>
              <li>
                SCSS for physics and materials
                <ul>
                  <li>Mixins for glass, flat, retro</li>
                  <li>State selectors via data attributes</li>
                </ul>
              </li>
            </ul>
          </li>
          <li>Import design tokens and begin building</li>
        </ul>

        <p><strong>Section 2 &mdash; Core Principles</strong></p>
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

        <ol class="lowercase">
          <li>Glass preset</li>
          <li>Flat preset</li>
          <li>Retro preset</li>
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

        <p>
          For full token documentation, see the
          <a href="#void">design token reference</a>. Links inside legal content
          automatically inherit laser-underline styling.
        </p>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;div class="legal-content"&gt;
  &lt;!-- Unordered: 3 levels (disc &rarr; circle &rarr; square) --&gt;
  &lt;ul&gt;
    &lt;li&gt;Item
      &lt;ul&gt;&lt;li&gt;Nested
        &lt;ul&gt;&lt;li&gt;Third level&lt;/li&gt;&lt;/ul&gt;
      &lt;/li&gt;&lt;/ul&gt;
    &lt;/li&gt;
  &lt;/ul&gt;

  &lt;!-- Ordered variants --&gt;
  &lt;ol&gt;&lt;li&gt;Decimal: 1, 2, 3&lt;/li&gt;&lt;/ol&gt;
  &lt;ol class="uppercase"&gt;&lt;li&gt;Upper-alpha: A, B, C&lt;/li&gt;&lt;/ol&gt;
  &lt;ol class="lowercase"&gt;&lt;li&gt;Lower-alpha: a, b, c&lt;/li&gt;&lt;/ol&gt;

  &lt;!-- Contract-style sub-numbering --&gt;
  &lt;ol class="subordered"&gt;
    &lt;li&gt;Clause
      &lt;ol class="subordered"&gt;&lt;li&gt;Sub-clause (1.1)&lt;/li&gt;&lt;/ol&gt;
    &lt;/li&gt;
  &lt;/ol&gt;

  &lt;!-- Links auto-inherit laser-underline --&gt;
  &lt;p&gt;See the &lt;a href="/docs"&gt;documentation&lt;/a&gt;.&lt;/p&gt;
&lt;/div&gt;</code
          ></pre>
      </details>
    </div>

    <!-- PROSE vs LEGAL-CONTENT COMPARISON -->
    <div class="flex flex-col gap-sm">
      <h5>Prose vs Legal-Content</h5>
      <p class="text-small text-mute">
        Same markup, different scopes. <code>.prose</code> uses energy-colored
        markers and retro text markers.
        <code>.legal-content</code> uses standard browser markers. Choose
        <code>.prose</code>
        for blogs and user content,
        <code>.legal-content</code> for formal documents.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-lg">
        <div class="flex flex-col gap-xs">
          <p class="text-small text-main px-xs">.prose</p>
          <div class="surface-void p-md prose">
            <ul>
              <li>Energy-primary colored markers</li>
              <li>
                Nested levels
                <ul>
                  <li>Circle markers (retro: <code>&gt;</code>)</li>
                </ul>
              </li>
            </ul>
            <ol>
              <li>Semibold energy-colored numbers</li>
              <li>Second item</li>
            </ol>
          </div>
        </div>

        <div class="flex flex-col gap-xs">
          <p class="text-small text-main px-xs">.legal-content</p>
          <div class="surface-void p-md legal-content">
            <ul>
              <li>Standard disc markers</li>
              <li>
                Nested levels
                <ul>
                  <li>Circle markers</li>
                </ul>
              </li>
            </ul>
            <ol>
              <li>Standard decimal numbers</li>
              <li>Second item</li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    <p class="text-caption text-mute px-xs">
      All prose elements adapt to glass, flat, and retro physics automatically.
      Switch the atmosphere or physics preset to see blockquote borders, list
      markers, and highlight treatments change in real time. The <code
        >.prose</code
      > class is the recommended scope for user-generated or markdown-rendered content.
    </p>
  </div>
</section>
