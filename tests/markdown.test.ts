import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';

import Markdown from '@components/ui/Markdown.svelte';

describe('Markdown — known-good shapes', () => {
  it('renders a heading', () => {
    const { container } = render(Markdown, { source: '# Hello' });
    const h1 = container.querySelector('h1');
    expect(h1).not.toBeNull();
    expect(h1?.textContent).toBe('Hello');
  });

  it('renders an unordered list', () => {
    const { container } = render(Markdown, { source: '- one\n- two' });
    const items = container.querySelectorAll('li');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toBe('one');
  });

  it('renders strong and emphasis', () => {
    const { container } = render(Markdown, {
      source: '**bold** and *italic*',
    });
    expect(container.querySelector('strong')?.textContent).toBe('bold');
    expect(container.querySelector('em')?.textContent).toBe('italic');
  });

  it('renders a fenced code block', () => {
    const { container } = render(Markdown, {
      source: '```\nconst x = 1;\n```',
    });
    const pre = container.querySelector('pre');
    expect(pre).not.toBeNull();
    expect(pre?.querySelector('code')?.textContent).toContain('const x = 1;');
  });

  it('renders a GFM table', () => {
    const { container } = render(Markdown, {
      source: '| a | b |\n| - | - |\n| 1 | 2 |',
    });
    expect(container.querySelector('table')).not.toBeNull();
    expect(container.querySelectorAll('td').length).toBe(2);
  });

  it('renders a blockquote', () => {
    const { container } = render(Markdown, { source: '> a quote' });
    expect(container.querySelector('blockquote')?.textContent?.trim()).toBe(
      'a quote',
    );
  });

  it('preserves <details> / <summary> through the sanitizer', () => {
    const { container } = render(Markdown, {
      source: '<details><summary>more</summary>body</details>',
    });
    expect(container.querySelector('details')).not.toBeNull();
    expect(container.querySelector('summary')?.textContent).toBe('more');
  });
});

describe('Markdown — hostile inputs', () => {
  it('strips <script> tags', () => {
    const { container } = render(Markdown, {
      source: 'hello\n\n<script>alert(1)</script>\n\nworld',
    });
    expect(container.querySelector('script')).toBeNull();
    expect(container.innerHTML).not.toContain('alert(1)');
  });

  it('strips javascript: URLs from links', () => {
    const { container } = render(Markdown, {
      source: '[click](javascript:alert(1))',
    });
    const anchor = container.querySelector('a');
    expect(anchor).not.toBeNull();
    expect(anchor?.getAttribute('href')).toBeNull();
  });

  it('strips <iframe> tags', () => {
    const { container } = render(Markdown, {
      source: '<iframe src="https://evil.example"></iframe>',
    });
    expect(container.querySelector('iframe')).toBeNull();
  });

  it('strips inline event-handler attributes', () => {
    const { container } = render(Markdown, {
      source: '<a href="/x" onclick="alert(1)">click</a>',
    });
    const anchor = container.querySelector('a');
    expect(anchor).not.toBeNull();
    expect(anchor?.getAttribute('onclick')).toBeNull();
    expect(container.innerHTML).not.toContain('onclick');
  });

  it('strips onload attributes from images', () => {
    const { container } = render(Markdown, {
      source: '<img src="x" alt="x" onload="alert(1)">',
    });
    expect(container.innerHTML).not.toContain('onload');
  });
});

describe('Markdown — inline mode', () => {
  it('uses a <span> wrapper and emits no wrapping <p>', () => {
    const { container } = render(Markdown, {
      source: '*hi*',
      inline: true,
    });
    const root = container.firstElementChild;
    expect(root?.tagName).toBe('SPAN');
    expect(root?.classList.contains('prose')).toBe(true);
    expect(container.querySelector('p')).toBeNull();
    expect(container.querySelector('em')?.textContent).toBe('hi');
  });

  it('block mode uses a <div> wrapper', () => {
    const { container } = render(Markdown, { source: '*hi*' });
    const root = container.firstElementChild;
    expect(root?.tagName).toBe('DIV');
    expect(root?.classList.contains('prose')).toBe(true);
  });
});

describe('Markdown — empty / nullish source', () => {
  // Svelte 5 emits a `<!---->` marker for `{#if}` block boundaries; that is
  // structural, not content. Assertions therefore check `textContent` (which
  // ignores comment nodes) and absence of element children.
  it('renders an empty block wrapper for empty string', () => {
    const { container } = render(Markdown, { source: '' });
    const root = container.firstElementChild;
    expect(root?.tagName).toBe('DIV');
    expect(root?.textContent).toBe('');
    expect(root?.children.length).toBe(0);
  });

  it('renders an empty block wrapper for null', () => {
    const { container } = render(Markdown, { source: null });
    const root = container.firstElementChild;
    expect(root?.tagName).toBe('DIV');
    expect(root?.textContent).toBe('');
    expect(root?.children.length).toBe(0);
  });

  it('renders an empty block wrapper for undefined', () => {
    const { container } = render(Markdown, { source: undefined });
    const root = container.firstElementChild;
    expect(root?.tagName).toBe('DIV');
    expect(root?.textContent).toBe('');
    expect(root?.children.length).toBe(0);
  });

  it('renders an empty inline wrapper without throwing', () => {
    const { container } = render(Markdown, { source: null, inline: true });
    const root = container.firstElementChild;
    expect(root?.tagName).toBe('SPAN');
    expect(root?.textContent).toBe('');
    expect(root?.children.length).toBe(0);
  });

  it('treats whitespace-only input as empty', () => {
    const { container } = render(Markdown, { source: '   \n\t  ' });
    const root = container.firstElementChild;
    expect(root?.textContent).toBe('');
    expect(root?.children.length).toBe(0);
  });
});

describe('Markdown — link handling', () => {
  it('adds target/rel to external https links', () => {
    const { container } = render(Markdown, {
      source: '[ext](https://example.com)',
    });
    const anchor = container.querySelector('a');
    expect(anchor?.getAttribute('href')).toBe('https://example.com');
    expect(anchor?.getAttribute('target')).toBe('_blank');
    expect(anchor?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('adds target/rel to protocol-relative links', () => {
    const { container } = render(Markdown, {
      source: '[ext](//example.com/path)',
    });
    const anchor = container.querySelector('a');
    expect(anchor?.getAttribute('target')).toBe('_blank');
    expect(anchor?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('does not add target/rel to relative links', () => {
    const { container } = render(Markdown, { source: '[int](/path)' });
    const anchor = container.querySelector('a');
    expect(anchor?.getAttribute('href')).toBe('/path');
    expect(anchor?.getAttribute('target')).toBeNull();
    expect(anchor?.getAttribute('rel')).toBeNull();
  });

  it('does not add target/rel to anchor links', () => {
    const { container } = render(Markdown, { source: '[anchor](#foo)' });
    const anchor = container.querySelector('a');
    expect(anchor?.getAttribute('href')).toBe('#foo');
    expect(anchor?.getAttribute('target')).toBeNull();
  });
});

describe('Markdown — trusted flag', () => {
  it('default (trusted=false) sanitizes output', () => {
    const { container } = render(Markdown, {
      source: '<script>danger</script>ok',
    });
    expect(container.querySelector('script')).toBeNull();
    expect(container.innerHTML).not.toContain('danger');
  });

  it('trusted=true bypasses the sanitizer (system-authored content only)', () => {
    // The sanitizer is bypassed: the `<script>` source survives in the
    // serialized HTML. Browsers do not execute scripts inserted via
    // innerHTML / {@html}, but the byte-level presence proves bypass.
    const { container } = render(Markdown, {
      source: '<script>x</script>visible',
      trusted: true,
    });
    expect(container.innerHTML).toContain('<script>x</script>');
  });
});

describe('Markdown — SSR/client parity (by-construction determinism)', () => {
  // The component has no $effect, no client-only branch, no `mounted` flag,
  // no `typeof window` check — its rendered HTML is purely a function of
  // input props (parser + sanitizer are both deterministic). That makes
  // SSR-vs-client divergence structurally impossible.
  //
  // Vitest in this repo runs with `resolve.conditions: ['browser']`, which
  // forces `.svelte` files to compile to client-only output and prevents
  // calling `svelte/server`'s render() against them in-process. The proof
  // here is therefore determinism: identical input renders identical HTML
  // across repeated invocations and across reactive re-renders. Combined
  // with the by-construction analysis above, that is the SSR-safety guarantee.
  it('renders identical HTML across repeated invocations (block)', () => {
    const source =
      '# Title\n\n**bold** and [ext](https://example.com) and [int](/path).\n\n- one\n- two';

    const a = render(Markdown, { source });
    const htmlA = a.container.firstElementChild?.outerHTML;
    a.unmount();

    const b = render(Markdown, { source });
    const htmlB = b.container.firstElementChild?.outerHTML;

    expect(htmlA).toBe(htmlB);
    expect(htmlA).toContain('<h1');
    expect(htmlA).toContain('target="_blank"');
  });

  it('renders identical HTML across repeated invocations (inline)', () => {
    const source = '*hi* and **there**';

    const a = render(Markdown, { source, inline: true });
    const htmlA = a.container.firstElementChild?.outerHTML;
    a.unmount();

    const b = render(Markdown, { source, inline: true });
    const htmlB = b.container.firstElementChild?.outerHTML;

    expect(htmlA).toBe(htmlB);
    expect(htmlA?.startsWith('<span')).toBe(true);
    expect(htmlA).toContain('<em>hi</em>');
  });
});
