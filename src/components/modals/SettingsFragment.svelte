<script lang="ts">
  import { modal } from '../../lib/modal-manager.svelte';
  import { toast } from '../../stores/toast.svelte';

  let {
    initialMusic = 50,
    initialVoice = 80,
    initialHaptics = true,
    // Callback Protocol
    onSave = (data: any) => console.log('Settings Saved:', data),
  } = $props();

  // Buffer State (Local editing state)
  let music = $state(initialMusic);
  let voice = $state(initialVoice);
  let haptics = $state(initialHaptics);

  function handleSave() {
    // A. Execute Logic
    onSave({ music, voice, haptics });

    // B. Provide Feedback
    toast.show('Configuration Updated', 'success');

    // C. Close
    modal.close();
  }
</script>

<div class="flex flex-col gap-lg">
  <div class="text-center">
    <h2 id="modal-title" class="text-h3 text-main">Audio & Immersion</h2>
    <p class="text-dim">Tune the void to your frequency.</p>
  </div>

  <div
    class="surface-sunk p-md rounded-md flex flex-col gap-md border border-white/5"
  >
    <label class="flex flex-col gap-xs cursor-pointer group">
      <div class="flex justify-between">
        <span
          class="text-small uppercase tracking-wider text-dim group-hover:text-primary transition-colors"
          >Music Volume</span
        >
        <span class="font-mono text-primary">{music}%</span>
      </div>
      <input type="range" min="0" max="100" bind:value={music} class="w-full" />
    </label>

    <label class="flex flex-col gap-xs cursor-pointer group">
      <div class="flex justify-between">
        <span
          class="text-small uppercase tracking-wider text-dim group-hover:text-primary transition-colors"
          >Voice Synthesis</span
        >
        <span class="font-mono text-primary">{voice}%</span>
      </div>
      <input type="range" min="0" max="100" bind:value={voice} class="w-full" />
    </label>

    <hr class="border-white/10" />

    <label
      class="flex flex-row justify-between items-center cursor-pointer p-xs -mx-xs rounded hover:bg-white/5 transition-colors"
    >
      <span class="text-main">Haptic Feedback</span>
      <input
        type="checkbox"
        bind:checked={haptics}
        class="w-5 h-5 accent-primary"
      />
    </label>
  </div>
</div>

<div class="flex flex-row justify-end gap-md pt-lg">
  <button
    class="btn-void text-mute hover:text-main"
    onclick={() => modal.close()}
  >
    Cancel
  </button>
  <button class="btn-cta" onclick={handleSave}> Save Configuration </button>
</div>
