import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { layerStack } from '@lib/layer-stack.svelte';
import ComboboxFixture from './fixtures/combobox-fixture.svelte';
import Combobox from '@components/ui/Combobox.svelte';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getInput(container: HTMLElement) {
  return container.querySelector<HTMLInputElement>('input[role="combobox"]')!;
}

function getPanel(container: HTMLElement) {
  return container.querySelector<HTMLElement>('.combobox-panel')!;
}

function getOptions(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLButtonElement>('button[role="option"]'),
  );
}

function withTransitionDuration(
  style: CSSStyleDeclaration,
  transitionDuration: string,
): CSSStyleDeclaration {
  return new Proxy(style, {
    get(target, prop, receiver) {
      if (prop === 'transitionDuration') return transitionDuration;
      const value = Reflect.get(target, prop, receiver);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  }) as CSSStyleDeclaration;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Combobox', () => {
  // ── Rendering ────────────────────────────────────────────────────────────

  it('renders a combobox input with correct ARIA attributes', () => {
    const { container } = render(ComboboxFixture);
    const input = getInput(container);

    expect(input).toBeTruthy();
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(input.getAttribute('aria-autocomplete')).toBe('list');
    expect(input.getAttribute('autocomplete')).toBe('off');
  });

  it('starts with panel inert and aria-hidden', () => {
    const { container } = render(ComboboxFixture);
    const panel = getPanel(container);

    expect(panel.hasAttribute('inert')).toBe(true);
    expect(panel.getAttribute('aria-hidden')).toBe('true');
  });

  // ── Open / close ──────────────────────────────────────────────────────────

  it('opens the panel on click', async () => {
    const { container } = render(ComboboxFixture);
    const input = getInput(container);

    await fireEvent.click(input);

    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(getPanel(container).hasAttribute('inert')).toBe(false);
    expect(screen.getByTestId('open-state').textContent).toBe('open');
  });

  it('opens the panel on ArrowDown', async () => {
    const { container } = render(ComboboxFixture);
    const input = getInput(container);

    await fireEvent.keyDown(input, { key: 'ArrowDown' });

    expect(input.getAttribute('aria-expanded')).toBe('true');
  });

  it('opens the panel on ArrowUp', async () => {
    const { container } = render(ComboboxFixture);
    const input = getInput(container);

    await fireEvent.keyDown(input, { key: 'ArrowUp' });

    expect(input.getAttribute('aria-expanded')).toBe('true');
  });

  it('closes the panel on Escape and restores the display value', async () => {
    const { container } = render(ComboboxFixture, { value: 'fr' });
    const input = getInput(container);

    await fireEvent.click(input);
    expect(input.getAttribute('aria-expanded')).toBe('true');

    // Type to change the display text
    await fireEvent.input(input, { target: { value: 'ger' } });

    // Escape should close and restore "France" (the committed label)
    await fireEvent.keyDown(input, { key: 'Escape' });

    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(input.value).toBe('France');
  });

  it('prevents layerStack double-dismissal on Escape', async () => {
    const lowerDismiss = vi.fn();
    layerStack.push(lowerDismiss);

    const { container } = render(ComboboxFixture);
    const input = getInput(container);

    await fireEvent.click(input);
    expect(input.getAttribute('aria-expanded')).toBe('true');

    // Escape on the combobox should close the panel
    await fireEvent.keyDown(input, { key: 'Escape' });

    expect(input.getAttribute('aria-expanded')).toBe('false');
    // The lower layer should NOT have been dismissed (e.preventDefault stopped propagation)
    expect(lowerDismiss).not.toHaveBeenCalled();
  });

  it('closes the panel on Tab without committing the highlighted option', async () => {
    const onchange = vi.fn();
    const { container } = render(Combobox, {
      options: [
        { value: 'fr', label: 'France' },
        { value: 'de', label: 'Germany' },
      ],
      onchange,
    });
    const input = getInput(container);

    await fireEvent.click(input);
    // Highlight first option
    await fireEvent.keyDown(input, { key: 'ArrowDown' });
    // Tab should close without committing
    await fireEvent.keyDown(input, { key: 'Tab' });

    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(onchange).not.toHaveBeenCalled();
  });

  // ── Filtering ─────────────────────────────────────────────────────────────

  it('filters options by the typed query', async () => {
    const { container } = render(ComboboxFixture);
    const input = getInput(container);

    await fireEvent.click(input);
    await fireEvent.input(input, { target: { value: 'ger' } });

    const options = getOptions(container);
    expect(options).toHaveLength(1);
    expect(options[0].textContent).toContain('Germany');
  });

  it('shows all options when query is empty', async () => {
    const { container } = render(ComboboxFixture);
    const input = getInput(container);

    await fireEvent.click(input);

    // Default fixture has 5 options (France, Germany, Japan, US, UK)
    const options = getOptions(container);
    expect(options).toHaveLength(5);
  });

  it('shows empty state when no options match', async () => {
    const { container } = render(ComboboxFixture);
    const input = getInput(container);

    await fireEvent.click(input);
    await fireEvent.input(input, { target: { value: 'zzz' } });

    expect(getOptions(container)).toHaveLength(0);
    expect(container.querySelector('.combobox-listbox')?.textContent).toContain(
      'No options',
    );
  });

  it('calls oninput on every keystroke', async () => {
    const oninput = vi.fn();
    const { container } = render(Combobox, {
      options: [{ value: 'a', label: 'Alpha' }],
      oninput,
    });
    const input = getInput(container);

    await fireEvent.input(input, { target: { value: 'al' } });

    expect(oninput).toHaveBeenCalledWith('al');
  });

  // ── Keyboard navigation ───────────────────────────────────────────────────

  it('moves activeIndex down with ArrowDown', async () => {
    const { container } = render(ComboboxFixture);
    const input = getInput(container);

    await fireEvent.click(input);
    await fireEvent.keyDown(input, { key: 'ArrowDown' });

    const options = getOptions(container);
    expect(options[0].getAttribute('data-state')).toBe('active');
    expect(input.getAttribute('aria-activedescendant')).toBeTruthy();
  });

  it('moves activeIndex up with ArrowUp', async () => {
    const { container } = render(ComboboxFixture);
    const input = getInput(container);

    await fireEvent.click(input);
    await fireEvent.keyDown(input, { key: 'ArrowDown' });
    await fireEvent.keyDown(input, { key: 'ArrowDown' });
    await fireEvent.keyDown(input, { key: 'ArrowUp' });

    const options = getOptions(container);
    expect(options[0].getAttribute('data-state')).toBe('active');
  });

  it('wraps around from last to first option', async () => {
    const { container } = render(Combobox, {
      options: [
        { value: 'a', label: 'Alpha' },
        { value: 'b', label: 'Beta' },
      ],
    });
    const input = getInput(container);

    await fireEvent.click(input);
    // ArrowDown twice to reach last (index 1)
    await fireEvent.keyDown(input, { key: 'ArrowDown' });
    await fireEvent.keyDown(input, { key: 'ArrowDown' });
    // One more wraps to first (index 0)
    await fireEvent.keyDown(input, { key: 'ArrowDown' });

    const options = getOptions(container);
    expect(options[0].getAttribute('data-state')).toBe('active');
  });

  it('skips disabled options during keyboard navigation', async () => {
    const { container } = render(ComboboxFixture);
    const input = getInput(container);

    await fireEvent.click(input);
    // France(0) → Germany(1) → skip Japan(2, disabled) → US(3)
    await fireEvent.keyDown(input, { key: 'ArrowDown' }); // France
    await fireEvent.keyDown(input, { key: 'ArrowDown' }); // Germany
    await fireEvent.keyDown(input, { key: 'ArrowDown' }); // should skip Japan → US

    const options = getOptions(container);
    expect(options[3].getAttribute('data-state')).toBe('active'); // US (index 3)
    expect(options[2].getAttribute('data-state')).toBe(''); // Japan skipped
  });

  // ── Selection ─────────────────────────────────────────────────────────────

  it('commits the active option on Enter', async () => {
    const onchange = vi.fn();
    const { container } = render(Combobox, {
      options: [
        { value: 'fr', label: 'France' },
        { value: 'de', label: 'Germany' },
      ],
      onchange,
    });
    const input = getInput(container);

    await fireEvent.click(input);
    await fireEvent.keyDown(input, { key: 'ArrowDown' });
    await fireEvent.keyDown(input, { key: 'Enter' });

    expect(onchange).toHaveBeenCalledWith('fr');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(input.value).toBe('France');
  });

  it('marks the committed option as aria-selected', async () => {
    const { container } = render(ComboboxFixture, { value: 'de' });
    const input = getInput(container);

    await fireEvent.click(input);

    const options = getOptions(container);
    const germany = options.find((o) => o.textContent?.includes('Germany'));
    expect(germany?.getAttribute('aria-selected')).toBe('true');

    const france = options.find((o) => o.textContent?.includes('France'));
    expect(france?.getAttribute('aria-selected')).toBe('false');
  });

  it('commits an option on pointerdown before blur fires', async () => {
    const onchange = vi.fn();
    const { container } = render(Combobox, {
      options: [
        { value: 'fr', label: 'France' },
        { value: 'de', label: 'Germany' },
      ],
      onchange,
    });
    const input = getInput(container);

    await fireEvent.click(input);
    const options = getOptions(container);

    // pointerdown on Germany should commit before blur can close the panel
    await fireEvent.pointerDown(options[1]);

    expect(onchange).toHaveBeenCalledWith('de');
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('does not commit a disabled option', async () => {
    const onchange = vi.fn();
    const { container } = render(ComboboxFixture);
    const input = getInput(container);

    await fireEvent.click(input);
    const options = getOptions(container);

    // Japan is disabled (index 2)
    await fireEvent.pointerDown(options[2]);

    expect(onchange).not.toHaveBeenCalled();
  });

  // ── Free-text / allowCustomValue ──────────────────────────────────────────

  it('commits free text on Enter when allowCustomValue is true', async () => {
    const onchange = vi.fn();
    const { container } = render(Combobox, {
      options: [{ value: 'a', label: 'Alpha' }],
      allowCustomValue: true,
      onchange,
    });
    const input = getInput(container);

    await fireEvent.input(input, { target: { value: 'custom tag' } });
    await fireEvent.keyDown(input, { key: 'Enter' });

    expect(onchange).toHaveBeenCalledWith('custom tag');
  });

  it('keeps the committed custom string visible in the input after the panel closes', async () => {
    const { container } = render(ComboboxFixture, { allowCustomValue: true });
    const input = getInput(container);

    await fireEvent.input(input, { target: { value: 'my custom value' } });
    await fireEvent.keyDown(input, { key: 'Enter' });

    // Panel must be closed and the visible input must still show the committed text
    expect(screen.getByTestId('open-state').textContent).toBe('closed');
    expect(input.value).toBe('my custom value');
  });

  it('commits free text into bind:value so form submission uses the custom string', async () => {
    const form = document.createElement('form');
    document.body.append(form);

    render(Combobox, {
      target: form,
      props: {
        options: [{ value: 'a', label: 'Alpha' }],
        name: 'tag',
        allowCustomValue: true,
      },
    });

    const input = getInput(form);
    await fireEvent.input(input, { target: { value: 'my-custom-tag' } });
    await fireEvent.keyDown(input, { key: 'Enter' });

    const formData = new FormData(form);
    expect(formData.get('tag')).toBe('my-custom-tag');
  });

  it('skips a disabled row at position 0 when setting initial activeIndex after filtering', async () => {
    const { container } = render(Combobox, {
      options: [
        { value: 'x', label: 'Xenon', disabled: true },
        { value: 'y', label: 'Yttrium' },
      ],
    });
    const input = getInput(container);

    // Type to filter — both options match 'y'/'x' but only 'yttrium' is enabled
    await fireEvent.input(input, { target: { value: '' } }); // open with all
    await fireEvent.click(input);

    // ArrowDown should jump past disabled Xenon to Yttrium
    await fireEvent.keyDown(input, { key: 'ArrowDown' });

    const options = getOptions(container);
    expect(options[1].getAttribute('data-state')).toBe('active'); // Yttrium
    expect(options[0].getAttribute('data-state')).toBe(''); // Xenon skipped
  });

  it('initializes correctly when opened externally via bind:open', async () => {
    const { container } = render(ComboboxFixture, { value: 'fr' });

    // Open via external button (bypasses openPanel(), exercises the $effect else branch)
    await fireEvent.click(screen.getByTestId('open-externally'));

    const options = getOptions(container);
    // All 5 options should be visible (query cleared to '' by the effect)
    expect(options).toHaveLength(5);
  });

  it('does not commit free text when allowCustomValue is false', async () => {
    const onchange = vi.fn();
    const { container } = render(Combobox, {
      options: [{ value: 'a', label: 'Alpha' }],
      allowCustomValue: false,
      onchange,
    });
    const input = getInput(container);

    await fireEvent.input(input, { target: { value: 'custom text' } });
    // No active option, no allowCustomValue → Enter should not commit
    await fireEvent.keyDown(input, { key: 'Enter' });

    expect(onchange).not.toHaveBeenCalled();
  });

  // ── Form interop ──────────────────────────────────────────────────────────

  it('serializes committed value into FormData via hidden input', () => {
    const form = document.createElement('form');
    document.body.append(form);

    render(Combobox, {
      target: form,
      props: {
        options: [
          { value: 'fr', label: 'France' },
          { value: 'de', label: 'Germany' },
        ],
        name: 'country',
        value: 'de',
      },
    });

    const formData = new FormData(form);
    expect(formData.get('country')).toBe('de');
  });

  it('serializes null value as empty string in FormData', () => {
    const form = document.createElement('form');
    document.body.append(form);

    render(Combobox, {
      target: form,
      props: {
        options: [{ value: 'fr', label: 'France' }],
        name: 'country',
        value: null,
      },
    });

    const formData = new FormData(form);
    expect(formData.get('country')).toBe('');
  });

  it('serializes numeric value as string in FormData', () => {
    const form = document.createElement('form');
    document.body.append(form);

    render(Combobox, {
      target: form,
      props: {
        options: [
          { value: 1, label: 'One' },
          { value: 2, label: 'Two' },
        ],
        name: 'level',
        value: 2,
      },
    });

    const formData = new FormData(form);
    expect(formData.get('level')).toBe('2');
  });

  it('does not render a hidden input when name is not provided', () => {
    const { container } = render(Combobox, {
      options: [{ value: 'a', label: 'Alpha' }],
      value: 'a',
    });

    const hiddenInput = container.querySelector('input[type="hidden"]');
    expect(hiddenInput).toBeNull();
  });

  it('does not render a hidden input when disabled', () => {
    const { container } = render(Combobox, {
      options: [{ value: 'a', label: 'Alpha' }],
      name: 'field',
      value: 'a',
      disabled: true,
    });

    const hiddenInput = container.querySelector('input[type="hidden"]');
    expect(hiddenInput).toBeNull();
  });

  it('does not forward name to the visible input', () => {
    const { container } = render(Combobox, {
      options: [{ value: 'a', label: 'Alpha' }],
      name: 'country',
    });

    const input = getInput(container);
    expect(input.getAttribute('name')).toBeNull();
  });

  it('forwards aria-* and other rest attributes to the visible input', () => {
    const { container } = render(Combobox, {
      options: [],
      id: 'my-combobox',
      'aria-label': 'Pick a country',
      autofocus: true,
    });

    const input = getInput(container);
    expect(input.getAttribute('id')).toBe('my-combobox');
    expect(input.getAttribute('aria-label')).toBe('Pick a country');
  });

  it('maps required to aria-required on the visible input only', () => {
    const { container } = render(Combobox, {
      options: [],
      name: 'country',
      required: true,
    });

    const input = getInput(container);
    expect(input.getAttribute('aria-required')).toBe('true');
    // required attribute must NOT appear on the visible input (wrong validation target)
    expect(input.hasAttribute('required')).toBe(false);

    const hiddenInput = container.querySelector('input[type="hidden"]');
    expect(hiddenInput?.hasAttribute('required')).toBe(false);
  });

  // ── Disabled state ────────────────────────────────────────────────────────

  it('does not open when disabled', async () => {
    const { container } = render(ComboboxFixture, { disabled: true });
    const input = getInput(container);

    await fireEvent.click(input);

    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  // ── Popover fallback ──────────────────────────────────────────────────────

  it('keeps panel inert and aria-hidden when popover APIs throw with zero-duration cleanup', async () => {
    const getComputedStyleOrig = window.getComputedStyle.bind(window);

    vi.spyOn(HTMLElement.prototype, 'showPopover').mockImplementation(() => {
      throw new Error('Popover unsupported');
    });
    vi.spyOn(HTMLElement.prototype, 'hidePopover').mockImplementation(() => {
      throw new Error('Popover unsupported');
    });
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el) =>
      withTransitionDuration(getComputedStyleOrig(el), '0s'),
    );

    const { container } = render(ComboboxFixture);
    const input = getInput(container);
    const panel = getPanel(container);

    expect(panel.hasAttribute('inert')).toBe(true);

    await fireEvent.click(input);
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(panel.hasAttribute('inert')).toBe(false);

    await fireEvent.keyDown(input, { key: 'Escape' });

    await waitFor(() => {
      expect(input.getAttribute('aria-expanded')).toBe('false');
      expect(panel.hasAttribute('inert')).toBe(true);
    });
  });
});
