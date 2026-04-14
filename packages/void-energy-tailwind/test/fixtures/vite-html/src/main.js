import {
  init,
  setAtmosphere,
  registerAtmosphere,
  unregisterAtmosphere,
  getAtmospheres,
  subscribe,
} from '@void-energy/tailwind/runtime';
import manifest from 'virtual:void-energy/manifest.json';

// 1. Hydrate runtime with the config manifest.
init({ manifest });

// 2. Register a runtime-only user theme so all three tiers are visible.
registerAtmosphere('user-theme', {
  physics: 'flat',
  mode: 'dark',
  tokens: {
    '--bg-canvas': '#1a0b2e',
    '--bg-surface': '#2a1545',
    '--energy-primary': '#f43f5e',
    '--text-main': '#fafafa',
  },
});

const picker = document.getElementById('picker');

function renderPicker() {
  picker.innerHTML = '';
  for (const entry of getAtmospheres()) {
    const row = document.createElement('div');
    row.className = 'flex gap-xs';

    const switchBtn = document.createElement('button');
    switchBtn.className = 'btn';
    switchBtn.textContent = `${entry.label ?? entry.name} (${entry.source})`;
    switchBtn.addEventListener('click', () => setAtmosphere(entry.name));
    row.appendChild(switchBtn);

    if (entry.source === 'runtime') {
      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn';
      removeBtn.textContent = '×';
      removeBtn.title = 'Remove runtime atmosphere';
      removeBtn.addEventListener('click', () =>
        unregisterAtmosphere(entry.name),
      );
      row.appendChild(removeBtn);
    }

    picker.appendChild(row);
  }
}

subscribe(renderPicker);
renderPicker();
