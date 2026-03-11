import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import PaginationFixture from './fixtures/pagination-fixture.svelte';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** All visible page-number buttons (excludes prev/next/first/last icon buttons). */
function pageButtons() {
  return screen
    .getAllByRole('button')
    .filter((btn) => /^\d+$/.test(btn.textContent?.trim() ?? ''));
}

/** All ellipsis elements. */
function ellipses() {
  const nav = screen.queryByRole('navigation');
  if (!nav) return [];
  return Array.from(nav.querySelectorAll('.pagination-ellipsis'));
}

/** The button whose text matches the given page number. */
function pageBtn(n: number) {
  return pageButtons().find((btn) => btn.textContent?.trim() === String(n));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Pagination', () => {
  // ── Rendering & ARIA ────────────────────────────────────────────────────

  it('renders a nav landmark with default aria-label', () => {
    render(PaginationFixture, { totalPages: 10 });
    const nav = screen.getByRole('navigation');
    expect(nav.getAttribute('aria-label')).toBe('Pagination');
  });

  it('uses a custom label for the nav landmark', () => {
    render(PaginationFixture, { totalPages: 10, label: 'Search results' });
    const nav = screen.getByRole('navigation');
    expect(nav.getAttribute('aria-label')).toBe('Search results');
  });

  it('sets aria-current="page" on the active page button', () => {
    render(PaginationFixture, { totalPages: 10, currentPage: 3 });
    const btn = pageBtn(3)!;
    expect(btn.getAttribute('aria-current')).toBe('page');
    expect(btn.getAttribute('data-state')).toBe('active');
  });

  it('does not set aria-current on inactive page buttons', () => {
    render(PaginationFixture, { totalPages: 10, currentPage: 3 });
    expect(pageBtn(1)?.getAttribute('aria-current')).toBeNull();
    expect(pageBtn(10)?.getAttribute('aria-current')).toBeNull();
  });

  // ── Visibility gate ─────────────────────────────────────────────────────

  it('does not render when totalPages is 1', () => {
    render(PaginationFixture, { totalPages: 1 });
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('does not render when totalPages is 0', () => {
    render(PaginationFixture, { totalPages: 0 });
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('does not render when totalPages is negative', () => {
    render(PaginationFixture, { totalPages: -5 });
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  // ── Empty-state: no silent mutation ─────────────────────────────────────

  it('does not mutate currentPage when totalPages is 0', () => {
    render(PaginationFixture, { totalPages: 0, currentPage: 7 });
    expect(screen.getByTestId('page-output').textContent).toBe('7');
  });

  // ── Input normalization ─────────────────────────────────────────────────

  it('floors fractional totalPages', () => {
    render(PaginationFixture, { totalPages: 5.9, currentPage: 1 });
    // Should treat as 5 pages — page 5 visible, no page 6
    expect(pageBtn(5)).toBeTruthy();
    expect(pageBtn(6)).toBeUndefined();
  });

  it('floors fractional currentPage', () => {
    render(PaginationFixture, { totalPages: 10, currentPage: 3.7 });
    // Should clamp to page 3
    expect(pageBtn(3)?.getAttribute('data-state')).toBe('active');
  });

  it('floors fractional siblings', () => {
    // siblings=0.5 should floor to 0, meaning only the current page + first/last visible
    render(PaginationFixture, {
      totalPages: 20,
      currentPage: 10,
      siblings: 0.5,
    });
    // With siblings=0: [1] [...] [10] [...] [20]
    expect(pageBtn(9)).toBeUndefined();
    expect(pageBtn(10)).toBeTruthy();
    expect(pageBtn(11)).toBeUndefined();
  });

  // ── Windowing algorithm ─────────────────────────────────────────────────

  it('shows all pages without ellipsis when totalPages is small', () => {
    render(PaginationFixture, { totalPages: 5, currentPage: 3 });
    expect(pageButtons()).toHaveLength(5);
    expect(ellipses()).toHaveLength(0);
  });

  it('shows left ellipsis when current page is near the end', () => {
    render(PaginationFixture, { totalPages: 20, currentPage: 18 });
    const pages = pageButtons().map((b) => b.textContent?.trim());
    expect(pages[0]).toBe('1');
    expect(ellipses().length).toBeGreaterThanOrEqual(1);
    expect(pages).toContain('18');
    expect(pages[pages.length - 1]).toBe('20');
  });

  it('shows right ellipsis when current page is near the start', () => {
    render(PaginationFixture, { totalPages: 20, currentPage: 2 });
    const pages = pageButtons().map((b) => b.textContent?.trim());
    expect(pages[0]).toBe('1');
    expect(pages).toContain('2');
    expect(ellipses().length).toBeGreaterThanOrEqual(1);
    expect(pages[pages.length - 1]).toBe('20');
  });

  it('shows both ellipses when current page is in the middle', () => {
    render(PaginationFixture, { totalPages: 20, currentPage: 10 });
    expect(ellipses()).toHaveLength(2);
    const pages = pageButtons().map((b) => b.textContent?.trim());
    expect(pages).toContain('1');
    expect(pages).toContain('9');
    expect(pages).toContain('10');
    expect(pages).toContain('11');
    expect(pages).toContain('20');
  });

  it('respects siblings=2 for wider window', () => {
    render(PaginationFixture, {
      totalPages: 20,
      currentPage: 10,
      siblings: 2,
    });
    const pages = pageButtons().map((b) => b.textContent?.trim());
    expect(pages).toContain('8');
    expect(pages).toContain('9');
    expect(pages).toContain('10');
    expect(pages).toContain('11');
    expect(pages).toContain('12');
  });

  // ── Click interaction ───────────────────────────────────────────────────

  it('navigates to clicked page and fires onchange', async () => {
    const onchange = vi.fn();
    render(PaginationFixture, { totalPages: 10, currentPage: 1, onchange });

    const target = pageBtn(10)!;
    await fireEvent.click(target);

    expect(onchange).toHaveBeenCalledWith(10);
    expect(screen.getByTestId('page-output').textContent).toBe('10');
  });

  it('does not fire onchange when clicking the already-active page', async () => {
    const onchange = vi.fn();
    render(PaginationFixture, { totalPages: 10, currentPage: 5, onchange });

    await fireEvent.click(pageBtn(5)!);
    expect(onchange).not.toHaveBeenCalled();
  });

  // ── Prev / Next buttons ─────────────────────────────────────────────────

  it('disables previous and first buttons on page 1', () => {
    render(PaginationFixture, { totalPages: 10, currentPage: 1 });
    const prev = screen.getByLabelText('Previous page');
    const first = screen.getByLabelText('First page');
    expect((prev as HTMLButtonElement).disabled).toBe(true);
    expect((first as HTMLButtonElement).disabled).toBe(true);
  });

  it('disables next and last buttons on the last page', () => {
    render(PaginationFixture, { totalPages: 10, currentPage: 10 });
    const next = screen.getByLabelText('Next page');
    const last = screen.getByLabelText('Last page');
    expect((next as HTMLButtonElement).disabled).toBe(true);
    expect((last as HTMLButtonElement).disabled).toBe(true);
  });

  it('navigates forward with next button', async () => {
    const onchange = vi.fn();
    render(PaginationFixture, { totalPages: 10, currentPage: 3, onchange });

    await fireEvent.click(screen.getByLabelText('Next page'));
    expect(onchange).toHaveBeenCalledWith(4);
    expect(screen.getByTestId('page-output').textContent).toBe('4');
  });

  it('navigates backward with previous button', async () => {
    const onchange = vi.fn();
    render(PaginationFixture, { totalPages: 10, currentPage: 5, onchange });

    await fireEvent.click(screen.getByLabelText('Previous page'));
    expect(onchange).toHaveBeenCalledWith(4);
    expect(screen.getByTestId('page-output').textContent).toBe('4');
  });

  it('jumps to first page', async () => {
    render(PaginationFixture, { totalPages: 10, currentPage: 7 });

    await fireEvent.click(screen.getByLabelText('First page'));
    expect(screen.getByTestId('page-output').textContent).toBe('1');
  });

  it('jumps to last page', async () => {
    render(PaginationFixture, { totalPages: 10, currentPage: 3 });

    await fireEvent.click(screen.getByLabelText('Last page'));
    expect(screen.getByTestId('page-output').textContent).toBe('10');
  });

  // ── Optional button groups ──────────────────────────────────────────────

  it('hides first/last buttons when showFirstLast is false', () => {
    render(PaginationFixture, {
      totalPages: 10,
      currentPage: 5,
      showFirstLast: false,
    });
    expect(screen.queryByLabelText('First page')).toBeNull();
    expect(screen.queryByLabelText('Last page')).toBeNull();
    // Prev/next should still be present
    expect(screen.getByLabelText('Previous page')).toBeTruthy();
    expect(screen.getByLabelText('Next page')).toBeTruthy();
  });

  it('marks prev/next with tablet:hidden when showPrevNext is false', () => {
    render(PaginationFixture, {
      totalPages: 10,
      currentPage: 5,
      showPrevNext: false,
    });
    // Prev/next still render (needed on mobile) but carry tablet:hidden
    const prev = screen.getByLabelText('Previous page');
    const next = screen.getByLabelText('Next page');
    expect(prev.className).toContain('tablet:hidden');
    expect(next.className).toContain('tablet:hidden');
    // First/last should still be present
    expect(screen.getByLabelText('First page')).toBeTruthy();
    expect(screen.getByLabelText('Last page')).toBeTruthy();
  });

  it('prev/next have no tablet:hidden when showPrevNext is true', () => {
    render(PaginationFixture, {
      totalPages: 10,
      currentPage: 5,
      showPrevNext: true,
    });
    const prev = screen.getByLabelText('Previous page');
    const next = screen.getByLabelText('Next page');
    expect(prev.className).not.toContain('tablet:hidden');
    expect(next.className).not.toContain('tablet:hidden');
  });

  // ── Responsive: mobile compact indicator ──────────────────────────────

  it('renders a compact page indicator for mobile', () => {
    render(PaginationFixture, { totalPages: 20, currentPage: 7 });
    const compact = document.querySelector('.pagination-compact');
    expect(compact).not.toBeNull();
    expect(compact!.textContent).toContain('Page 7 of 20');
    expect(compact!.getAttribute('aria-current')).toBe('page');
  });

  it('compact indicator updates when page changes', async () => {
    render(PaginationFixture, { totalPages: 20, currentPage: 3 });
    await fireEvent.click(screen.getByLabelText('Next page'));
    const compact = document.querySelector('.pagination-compact');
    expect(compact!.textContent).toContain('Page 4 of 20');
  });

  it('first/last buttons carry hidden tablet:inline-flex for responsive hiding', () => {
    render(PaginationFixture, { totalPages: 10, currentPage: 5 });
    const first = screen.getByLabelText('First page');
    const last = screen.getByLabelText('Last page');
    expect(first.className).toContain('hidden');
    expect(first.className).toContain('tablet:inline-flex');
    expect(last.className).toContain('hidden');
    expect(last.className).toContain('tablet:inline-flex');
  });

  it('page number container carries hidden tablet:flex for responsive hiding', () => {
    render(PaginationFixture, { totalPages: 10, currentPage: 5 });
    const nav = screen.getByRole('navigation');
    const pageContainer = nav.querySelector('.hidden.tablet\\:flex');
    expect(pageContainer).not.toBeNull();
    // Should contain page number buttons
    const buttons = pageContainer!.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  // ── Clamping ────────────────────────────────────────────────────────────

  it('clamps currentPage above totalPages down to last page', () => {
    render(PaginationFixture, { totalPages: 5, currentPage: 99 });
    expect(screen.getByTestId('page-output').textContent).toBe('5');
    expect(pageBtn(5)?.getAttribute('data-state')).toBe('active');
  });

  it('clamps currentPage below 1 up to first page', () => {
    render(PaginationFixture, { totalPages: 5, currentPage: -3 });
    expect(screen.getByTestId('page-output').textContent).toBe('1');
    expect(pageBtn(1)?.getAttribute('data-state')).toBe('active');
  });
});
