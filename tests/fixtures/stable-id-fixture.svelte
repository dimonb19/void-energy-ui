<script lang="ts">
  import Eye from '@components/icons/Eye.svelte';
  import PortalRing from '@components/icons/PortalRing.svelte';
  import PasswordField from '@components/ui/PasswordField.svelte';
  import Sparkline from '@components/ui/Sparkline.svelte';
</script>

<div>
  <Eye />
  <Eye />
  <PortalRing />
  <PortalRing />
  <Sparkline data={[1, 3, 2]} />
  <Sparkline data={[3, 2, 4]} />
  <PasswordField value="alpha" />
  <PasswordField value="beta" />
</div>
