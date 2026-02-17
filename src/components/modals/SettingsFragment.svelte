<script lang="ts">
  import { modal } from '@lib/modal-manager.svelte';

  import Selector from '../ui/Selector.svelte';

  let {
    initialLayout = 'comfortable',
    initialNotifications = 'all',
    initialRemember = false,
    onSave = (data: DemoPreferences) => console.log('Settings saved:', data),
    onRememberChange = (value: boolean) =>
      console.log('Remember choice:', value),
  }: {
    initialLayout?: DemoLayout;
    initialNotifications?: DemoNotificationLevel;
    initialRemember?: boolean;
    onSave?: (data: DemoPreferences) => void;
    onRememberChange?: (value: boolean) => void;
  } = $props();

  let layout = $state<DemoLayout>(initialLayout);
  let notifications = $state<DemoNotificationLevel>(initialNotifications);
  let remember = $state(initialRemember);

  function handleSave() {
    onSave({ layout, notifications });
    if (remember) {
      onRememberChange(true);
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
      <h2 id="modal-title" class="text-h3">Display Preferences</h2>
      <p>Adjust how content is presented. Changes apply on save.</p>
    </div>

    <div
      class="surface-sunk p-md flex flex-col gap-md large-desktop:w-full large-desktop:grid large-desktop:grid-cols-2"
    >
      <div class="flex flex-col items-center gap-md">
        <Selector
          label="LAYOUT: {layout === 'compact'
            ? 'Reduced spacing, denser content'
            : 'Standard spacing, relaxed reading'}"
          options={[
            { value: 'compact', label: 'Compact' },
            { value: 'comfortable', label: 'Comfortable' },
          ]}
          bind:value={layout}
        />
      </div>

      <hr class="large-desktop:hidden" />

      <div class="flex flex-col items-center gap-md">
        <Selector
          label="NOTIFICATIONS: {notifications === 'all'
            ? 'Show all notifications'
            : 'Only critical alerts'}"
          options={[
            { value: 'all', label: 'All Notifications' },
            { value: 'critical', label: 'Critical Only' },
          ]}
          bind:value={notifications}
        />
      </div>
    </div>

    <label class="flex flex-row items-center gap-xs">
      <input type="checkbox" bind:checked={remember} />
      Remember this choice
    </label>
  </div>

  <div class="flex flex-row justify-center gap-md">
    <button class="btn-ghost" onclick={() => modal.close()}>Cancel</button>
    <button class="btn-success" onclick={handleSave}>Save</button>
  </div>
</div>
