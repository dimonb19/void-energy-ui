<script lang="ts">
  import Markdown from '../ui/Markdown.svelte';

  const aiNarrative = [
    '# The Reactor Hums to Life',
    '',
    "You step into the **observation chamber**, where the void-core's _resonance pulse_ throbs beneath the floor plates.",
    '',
    '## What You Notice',
    '',
    '- A trio of containment rings, each rotating at a different cadence',
    '- The faint scent of ionised air',
    "- Dr. Vasquez's clipboard, abandoned on the console — annotated with `recalibrate at 51.3 TW`",
    '',
    '> "Energy cannot be created or destroyed, only revealed."',
    '> — *Principles of Void Energy*',
    '',
    'The next move is yours. [Open the diagnostic panel](https://void.energy/diag) or check the manual reference on [page 47](#manual-page-47).',
  ].join('\n');

  const trustedChangelog = [
    '## v1.4.0 — 2026-04-29',
    '',
    'System-authored release notes, committed to source. Rendered with `trusted` so the sanitizer is bypassed.',
    '',
    '- **Added** Markdown primitive for rendering authored prose',
    '- **Fixed** Aura colour spill on dark-mode glass surfaces',
    '- **Removed** legacy `onMount` shims from the layer stack',
  ].join('\n');

  const hostileInput = [
    '# Looks innocent',
    '',
    'This story beat seems harmless.',
    '',
    "<script>alert('XSS via script tag')<" + '/script>',
    '',
    "Click [this totally safe link](javascript:alert('XSS via javascript: URL')) to continue.",
    '',
    '<iframe src="https://attacker.example.com"></iframe>',
    '',
    '<img src="x" onerror="alert(\'XSS via onerror\')" alt="broken">',
    '',
    'But the sanitizer strips every payload above before it reaches the DOM.',
  ].join('\n');
</script>

<section id="markdown" class="flex flex-col gap-md">
  <h2>05 // MARKDOWN</h2>

  <div class="surface-raised p-lg flex flex-col gap-lg">
    <p class="text-dim">
      The system's one-line answer to <em
        >"I have a markdown string and need it to look like the rest of the
        app."</em
      >
      Bundles parser (<code>marked</code>
      + GFM) and sanitizer (<code>sanitize-html</code>) so consumers don't pick
      per-call. Safe by default; the <code>trusted</code> flag bypasses the sanitizer
      for system-authored strings committed in source.
    </p>

    <details>
      <summary>Technical Details</summary>
      <p class="p-md">
        Output flows into a <code>.prose</code> wrapper, so styling adapts
        across physics presets and color modes automatically. External links (<code
          >http://</code
        >, <code>https://</code>, <code>//</code>) receive
        <code>target="_blank" rel="noopener noreferrer"</code> via a parser
        renderer hook; internal links pass through. The sanitizer allowlist
        covers every tag styled in <code>_prose.scss</code> plus GFM tables and
        <code>&lt;details&gt;/&lt;summary&gt;</code>. Empty / <code>null</code>
        / <code>undefined</code> source renders an empty wrapper without
        throwing — pre-first-chunk AI streaming is safe. Inline mode uses
        <code>marked.parseInline</code> in a <code>&lt;span&gt;</code> for
        tooltip / label phrasing. Decisions log: <code>plans/decisions.md</code>
        D34 (parser, naming, streaming, trusted-flag) and D35 (sanitizer choice).
      </p>
    </details>

    <!-- ─── PANEL 1: AI-GENERATED NARRATIVE ───────────────────────────── -->
    <div class="flex flex-col gap-md">
      <h5>AI-Generated Narrative (Default — Sanitized)</h5>
      <p class="text-small text-mute">
        The default path: bare <code
          >&lt;Markdown source=&#123;x&#125; /&gt;</code
        >
        runs the sanitizer and scopes the output to <code>.prose</code>. This is
        what every AI-generated story beat, help body, or CMS field should pass
        through.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <Markdown source={aiNarrative} />
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;script&gt;
  import Markdown from '@components/ui/Markdown.svelte';
  const aiNarrative = `# The Reactor Hums to Life

You step into the **observation chamber**...`;
&lt;/script&gt;

&lt;Markdown source=&#123;aiNarrative&#125; /&gt;</code
          ></pre>
      </details>
    </div>

    <!-- ─── PANEL 2: TRUSTED SYSTEM STRING ────────────────────────────── -->
    <div class="flex flex-col gap-md">
      <h5>Trusted System String (<code>trusted</code> — Sanitizer Bypassed)</h5>
      <p class="text-small text-mute">
        For markdown the application authors and commits to source — changelog
        entries, help copy, settings descriptions. The <code>trusted</code> flag
        skips sanitization. Treat the word <code>trusted</code> in any diff as a
        sanitizer-bypass review surface; never pass it for AI-generated, CMS, or
        user content.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <Markdown source={trustedChangelog} trusted />
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;Markdown source=&#123;trustedChangelog&#125; trusted /&gt;</code
          ></pre>
      </details>
    </div>

    <!-- ─── PANEL 3: HOSTILE INPUT ─────────────────────────────────────── -->
    <div class="flex flex-col gap-md">
      <h5>Hostile Input (Sanitizer Stripping)</h5>
      <p class="text-small text-mute">
        Demonstrates what the default sanitizer removes from untrusted input:
        <code>&lt;script&gt;</code> tags, <code>javascript:</code> URLs,
        <code>&lt;iframe&gt;</code> embeds, and <code>onerror=</code>
        attributes. The raw input is shown first; the rendered output below contains
        only safe content.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-lg">
        <div class="flex flex-col gap-xs">
          <p class="text-small px-xs text-dim">Raw input string:</p>
          <pre><code>{hostileInput}</code></pre>
        </div>

        <div class="flex flex-col gap-xs">
          <p class="text-small px-xs text-dim">Rendered output (sanitized):</p>
          <div class="surface-spotlight p-md">
            <Markdown source={hostileInput} />
          </div>
        </div>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;!-- Default &lt;Markdown&gt; always sanitizes — no flag needed --&gt;
&lt;Markdown source=&#123;hostileInput&#125; /&gt;</code
          ></pre>
      </details>
    </div>

    <p class="text-caption text-mute px-xs">
      Switch atmospheres and physics presets to see headings, blockquotes,
      lists, code spans, and links adapt across glass, flat, and retro. The
      Markdown primitive does not own visual styling — it produces HTML the
      <code>.prose</code> scope already styles.
    </p>
  </div>
</section>
