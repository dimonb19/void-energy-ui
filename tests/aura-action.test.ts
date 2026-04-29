import { describe, expect, it } from 'vitest';

import { aura } from '@actions/aura';

describe('aura action — explicit color', () => {
  it('writes --aura-color and sets data-aura=on', () => {
    const node = document.createElement('div');
    aura(node, { color: '#33e2e6' });
    expect(node.style.getPropertyValue('--aura-color')).toBe('#33e2e6');
    expect(node.dataset.aura).toBe('on');
  });

  it('updates --aura-color via update()', () => {
    const node = document.createElement('div');
    const handle = aura(node, { color: '#33e2e6' });
    handle.update({ color: '#ff80a0' });
    expect(node.style.getPropertyValue('--aura-color')).toBe('#ff80a0');
  });
});

describe('aura action — color optional', () => {
  it('omits --aura-color when no color is passed', () => {
    const node = document.createElement('div');
    aura(node, {});
    expect(node.style.getPropertyValue('--aura-color')).toBe('');
    expect(node.dataset.aura).toBe('on');
  });

  it('clears --aura-color when update() drops the color', () => {
    const node = document.createElement('div');
    const handle = aura(node, { color: '#33e2e6' });
    handle.update({});
    expect(node.style.getPropertyValue('--aura-color')).toBe('');
  });

  it('treats no options as bare {use:aura}', () => {
    const node = document.createElement('div');
    aura(node);
    expect(node.dataset.aura).toBe('on');
    expect(node.style.getPropertyValue('--aura-color')).toBe('');
  });
});

describe('aura action — enabled toggle', () => {
  it('sets data-aura=off when enabled is false', () => {
    const node = document.createElement('div');
    aura(node, { color: '#33e2e6', enabled: false });
    expect(node.dataset.aura).toBe('off');
  });

  it('flips data-aura on/off via update()', () => {
    const node = document.createElement('div');
    const handle = aura(node, { color: '#33e2e6' });
    expect(node.dataset.aura).toBe('on');
    handle.update({ color: '#33e2e6', enabled: false });
    expect(node.dataset.aura).toBe('off');
    handle.update({ color: '#33e2e6', enabled: true });
    expect(node.dataset.aura).toBe('on');
  });
});

describe('aura action — destroy', () => {
  it('cleans up --aura-color and data-aura', () => {
    const node = document.createElement('div');
    const handle = aura(node, { color: '#33e2e6' });
    handle.destroy();
    expect(node.style.getPropertyValue('--aura-color')).toBe('');
    expect(node.dataset.aura).toBeUndefined();
  });
});
