<!--
  MARKDOWN
  Renders a markdown string as styled, sanitized HTML inside a `.prose`
  wrapper. The system's one-line answer to "I have a markdown string and need
  it to look like the rest of the app" — covers AI-generated narrative copy,
  help text, toast bodies, changelog entries, and similar authored content.

  See plans/decisions.md D34 for the locked five decisions that shape this
  primitive: parser (`marked` + GFM, exact pin), sanitizer (`isomorphic-
  dompurify`, exact pin), no syntax highlighting in v1, no streaming in v1,
  `trusted?: boolean` default `false` (safe-by-default).

  USAGE
  -------------------------------------------------------------------------
  // AI / untrusted content (default — sanitizer runs):
  <Markdown source={aiOutput} />

  // System-authored / trusted content (sanitizer bypassed):
  <Markdown source={changelogMd} trusted />

  // Inline phrasing context (tooltip body, label text — wrapper is <span>,
  // no leading <p>):
  <Markdown source={tooltipBody} inline />
  -------------------------------------------------------------------------

  EMPTY / NULLISH source: renders an empty wrapper with the same class
  attributes, no `{@html}` call, no throw. Covers pre-first-chunk AI
  streaming states.

  EXTERNAL LINKS: anchors whose href starts with `http://`, `https://`, or
  `//` get `target="_blank" rel="noopener noreferrer"` auto-applied via the
  parser renderer hook. Internal links (relative, anchor-only) pass through
  unchanged.

  PHASE 0c W1 FALLBACK: this component emits `.prose` only on the sanitized
  path. The plan calls for `.prose-untrusted` (Phase 0c W1) to also be
  applied — but `.prose-untrusted` does not yet exist in `_prose.scss`. When
  Phase 0c W1 lands, change the sanitized-path class to
  `prose prose-untrusted {className}` in one line. See COMPOSITION-RECIPES.md.
-->

<script lang="ts" module>
  import { Marked, type Tokens } from 'marked';
  import DOMPurify from 'isomorphic-dompurify';

  // Module-scoped: parser instance and renderer hook are configured once
  // per module load. Doing this in the instance script would re-register
  // the renderer on every component instantiation, stacking calls.
  const marked = new Marked({ async: false, gfm: true });

  marked.use({
    renderer: {
      link(
        this: { parser: { parseInline: (tokens: Tokens.Generic[]) => string } },
        token: Tokens.Link,
      ) {
        const { href, title, tokens } = token;
        const inner = this.parser.parseInline(tokens);
        const isExternal = /^(https?:\/\/|\/\/)/i.test(href);
        const titleAttr = title
          ? ` title="${title.replace(/"/g, '&quot;')}"`
          : '';
        const externalAttrs = isExternal
          ? ' target="_blank" rel="noopener noreferrer"'
          : '';
        return `<a href="${href}"${titleAttr}${externalAttrs}>${inner}</a>`;
      },
    },
  });

  // Sanitizer allowlist. Covers every tag styled in `_prose.scss` plus the
  // inline semantics from `_typography.scss`, GFM tables, and details/summary
  // (which DOMPurify excludes from its default allowlist). When a new tag is
  // added to either stylesheet, this list must be updated in lock-step or
  // the parser will produce HTML the sanitizer silently strips.
  const ALLOWED_TAGS = [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'strong',
    'em',
    'code',
    'pre',
    'a',
    'hr',
    'br',
    'ul',
    'ol',
    'li',
    'dl',
    'dt',
    'dd',
    'blockquote',
    'footer',
    'cite',
    'figure',
    'figcaption',
    'address',
    'mark',
    'del',
    'ins',
    's',
    'sub',
    'sup',
    'abbr',
    'q',
    'dfn',
    'var',
    'table',
    'thead',
    'tbody',
    'tfoot',
    'tr',
    'th',
    'td',
    'caption',
    'details',
    'summary',
    'img',
    'span',
    'div',
    'input',
  ];

  const ALLOWED_ATTR = [
    'href',
    'title',
    'target',
    'rel',
    'src',
    'alt',
    'id',
    'name',
    'class',
    'colspan',
    'rowspan',
    'align',
    'start',
    'type',
    'disabled',
    'checked',
  ];

  function sanitize(html: string): string {
    return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
  }
</script>

<script lang="ts">
  interface MarkdownProps {
    source: string | null | undefined;
    class?: string;
    trusted?: boolean;
    inline?: boolean;
  }

  let {
    source,
    class: className = '',
    trusted = false,
    inline = false,
  }: MarkdownProps = $props();

  const html = $derived.by(() => {
    if (!source || source.trim() === '') return '';
    const raw = inline
      ? (marked.parseInline(source) as string)
      : (marked.parse(source) as string);
    return trusted ? raw : sanitize(raw);
  });
</script>

{#if inline}
  <span class="prose {className}"
    >{#if html}{@html html}{/if}</span
  >
{:else}
  <div class="prose {className}">
    {#if html}{@html html}{/if}
  </div>
{/if}
