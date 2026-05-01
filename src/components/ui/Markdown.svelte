<!--
  MARKDOWN
  Renders a markdown string as styled, sanitized HTML inside a `.prose`
  wrapper. The system's one-line answer to "I have a markdown string and need
  it to look like the rest of the app" — covers AI-generated narrative copy,
  help text, toast bodies, changelog entries, and similar authored content.

  Parser: `marked` + GFM (exact pin). Sanitizer: `sanitize-html` (exact pin).
  No syntax highlighting. No streaming. `trusted?: boolean` defaults to
  `false` — safe-by-default.

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

-->

<script lang="ts" module>
  import { Marked, type Tokens } from 'marked';
  import sanitizeHtml from 'sanitize-html';

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
  // (which `sanitize-html` excludes from its default allowlist). When a new
  // tag is added to either stylesheet, this list must be updated in lock-step
  // or the parser will produce HTML the sanitizer silently strips.
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

  // sanitize-html shape: `allowedAttributes` is per-tag. Apply the flat
  // allowlist to every tag via the `*` wildcard — equivalent to DOMPurify's
  // global `ALLOWED_ATTR` semantics. The library's default `allowedSchemes`
  // (http, https, ftp, mailto) handles unsafe-URL filtering for us.
  const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: { '*': ALLOWED_ATTR },
  };

  function sanitize(html: string): string {
    return sanitizeHtml(html, SANITIZE_OPTIONS);
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
