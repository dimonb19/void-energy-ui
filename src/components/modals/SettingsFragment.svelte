<script lang="ts">
  import { modal } from '@lib/modal-manager.svelte';

  import Selector from '../ui/Selector.svelte';

  let {
    initialSettings = 'default',
    initialPlayMode = 'play_unlimited',
    initialDontShowAgain = false,
    onSave = (data: SettingsPreferences) =>
      console.log('Settings Saved:', data),
    onDontShowAgainChange = (value: boolean) =>
      console.log('Dont show again:', value),
  }: {
    initialSettings?: SettingMode;
    initialPlayMode?: PlayMode;
    initialDontShowAgain?: boolean;
    onSave?: (data: SettingsPreferences) => void;
    onDontShowAgainChange?: (value: boolean) => void;
  } = $props();

  // Local editing buffer.
  let preferredSettings = $state<SettingMode>(initialSettings);
  let playMode = $state<PlayMode>(initialPlayMode);
  let dontShowAgain = $state(initialDontShowAgain);

  function handleSave() {
    onSave({ settings: preferredSettings, play_mode: playMode });
    if (dontShowAgain) {
      onDontShowAgainChange(true);
    }
    modal.close();
  }
</script>

<div
  class="modal-content"
  onclick={(e) => e.stopPropagation()}
  role="presentation"
>
  <div class="flex flex-col gap-md items-center">
    <div class="text-center flex flex-col gap-md">
      <h2 id="modal-title" class="text-h3">Play options</h2>
      <p>
        These choices are also
        <a class="link" href="/">in your profile.</a>
        Changes apply immediately.
      </p>
    </div>

    <div
      class="surface-sunk p-md flex flex-col gap-md large-desktop:w-full large-desktop:grid large-desktop:grid-cols-2"
    >
      <div class="flex flex-col items-center gap-md">
        <Selector
          label="SETTINGS: {preferredSettings === 'personal'
            ? 'Use your profile settings'
            : "Use the author's settings"}"
          options={[
            { value: 'personal', label: 'Personal' },
            { value: 'default', label: "Author's Default" },
          ]}
          bind:value={preferredSettings}
        />
      </div>

      <hr class="large-desktop:hidden" />

      <div class="flex flex-col items-center gap-md">
        <Selector
          label="PLAY MODE: {playMode === 'play_limited'
            ? 'No images or audio'
            : 'Images and audio on each step'}"
          options={[
            { value: 'play_limited', label: 'Text-only (1 credit)' },
            { value: 'play_unlimited', label: 'With Media (3 credits)' },
          ]}
          bind:value={playMode}
        />
      </div>
    </div>

    <label class="flex flex-row items-center gap-xs">
      <input type="checkbox" bind:checked={dontShowAgain} />
      Don't show this again
    </label>
  </div>

  <div class="flex flex-row justify-center gap-md">
    <button class="btn-alert" onclick={() => modal.close()}> Cancel </button>
    <button class="btn-cta" onclick={handleSave}>
      {playMode === 'play_limited' ? 'Play: 1 credit' : 'Play: 3 credits'}
    </button>
  </div>
</div>
