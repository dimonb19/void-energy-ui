/**
 * Navlink Action — Navigation loading feedback
 *
 * Marks an element as loading on click for navigation transitions.
 * Sets `data-status="loading"` + `aria-busy="true"` on click.
 * MPA: DOM replacement on page load clears the state naturally.
 * Skips modified clicks (Ctrl/Cmd for new tab, Shift, middle button).
 *
 * Pair with SCSS `@include when-state('loading')` on the target element
 * to control the visual feedback (shimmer, dim, spinner, etc.).
 *
 * @example Basic usage on a navigation link
 * <a href="/page" use:navlink>Go to page</a>
 *
 * @example On a tab
 * <a class="tab" href="/components" use:navlink>Components</a>
 *
 * @example On a card surface that navigates
 * <a class="card" href="/story/123" use:navlink>Story</a>
 */
export function navlink(node: HTMLElement) {
  function handleClick(event: MouseEvent) {
    // Skip modified clicks — let browser handle new-tab / context behavior.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0)
      return;

    node.setAttribute('data-status', 'loading');
    node.setAttribute('aria-busy', 'true');
  }

  node.addEventListener('click', handleClick);

  return {
    destroy() {
      node.removeEventListener('click', handleClick);
    },
  };
}
