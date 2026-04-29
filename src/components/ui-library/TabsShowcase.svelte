<script lang="ts">
  import { toast } from '@stores/toast.svelte';
  import { Settings, User, Bell, Shield, Palette } from '@lucide/svelte';

  import Tabs from '../ui/Tabs.svelte';

  // Basic demo
  let basicTab = $state('overview');

  // With icons
  let iconTab = $state('profile');

  // Controlled with callback
  let controlledTab = $state('notifications');

  // With disabled tab
  let disabledTab = $state('appearance');
</script>

<section id="tabs" class="flex flex-col gap-md">
  <h2>11 // TABS</h2>

  <div class="surface-raised p-lg flex flex-col gap-lg">
    <p class="text-dim">
      The <code>Tabs</code> component provides a horizontal tabbed interface
      with full WAI-ARIA <code>tablist</code>/<code>tab</code>/<code
        >tabpanel</code
      >
      semantics. It uses the <code>.tabs-trigger</code> physics from
      <code>_tabs.scss</code> &mdash; glass gets a glowing underline indicator, flat
      gets a solid line, and retro gets a chunky bottom border. Keyboard navigation
      follows the roving tabindex pattern with Arrow Left/Right, Home/End, and manual
      activation via Enter/Space.
    </p>

    <details>
      <summary>Technical Details</summary>
      <p class="p-md">
        Tabs are data-driven: pass an array of <code>tabs</code> and a
        <code>panel</code> snippet. ARIA wiring is automatic &mdash; each
        trigger gets <code>aria-selected</code>, <code>aria-controls</code>, and
        roving
        <code>tabindex</code>. The active indicator is a
        <code>::after</code> pseudo-element positioned over the list border,
        with physics-aware glow (glass), solid line (flat), or chunky border
        (retro). State is driven via <code>data-state="active"</code> on the trigger.
      </p>
    </details>

    <!-- ─── BASIC ─────────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Basic Tabs</h5>
      <p class="text-small text-mute">
        Minimal usage with text-only labels. The first non-disabled tab is
        selected by default when no <code>value</code> is provided.
      </p>

      <div class="surface-sunk p-md">
        <Tabs
          tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'specs', label: 'Specifications' },
            { id: 'reviews', label: 'Reviews' },
          ]}
          bind:value={basicTab}
        >
          {#snippet panel(tab)}
            {#if tab.id === 'overview'}
              <p>
                The Void Energy reactor operates at 99.7% containment
                efficiency. All subsystems are nominal. Power output is steady
                at 4.2 terawatts.
              </p>
            {:else if tab.id === 'specs'}
              <p>
                Core temperature: 15,000,000 K. Containment field: Class VII
                magnetic. Fuel type: Void-stabilized deuterium. Expected
                lifespan: 50 standard years.
              </p>
            {:else if tab.id === 'reviews'}
              <p>
                "The most reliable energy source in the sector." &mdash;
                Galactic Energy Commission. Rated 4.8/5.0 across 2,400
                installations.
              </p>
            {/if}
          {/snippet}
        </Tabs>
      </div>
    </div>

    <!-- ─── WITH ICONS ────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Tabs with Icons</h5>
      <p class="text-small text-mute">
        Each tab can include an optional <code>icon</code> prop &mdash; either a
        Lucide component or a string emoji. Icons inherit
        <code>currentColor</code> from the trigger.
      </p>

      <div class="surface-sunk p-md">
        <Tabs
          tabs={[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'appearance', label: 'Appearance', icon: Palette },
          ]}
          bind:value={iconTab}
        >
          {#snippet panel(tab)}
            {#if tab.id === 'profile'}
              <div class="flex flex-col gap-sm">
                <p>Display name, avatar, and public profile settings.</p>
              </div>
            {:else if tab.id === 'security'}
              <div class="flex flex-col gap-sm">
                <p>Password, two-factor authentication, and active sessions.</p>
              </div>
            {:else if tab.id === 'appearance'}
              <div class="flex flex-col gap-sm">
                <p>Theme, density, font preferences, and color mode.</p>
              </div>
            {/if}
          {/snippet}
        </Tabs>
      </div>
    </div>

    <!-- ─── CONTROLLED + CALLBACK ─────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Controlled with Callback</h5>
      <p class="text-small text-mute">
        Use <code>bind:value</code> for two-way binding and
        <code>onchange</code> for side effects. The current tab ID is reactive and
        displayed below.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <Tabs
          tabs={[
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'settings', label: 'Settings', icon: Settings },
          ]}
          bind:value={controlledTab}
          onchange={(id) => toast.show(`Switched to: ${id}`, 'info')}
        >
          {#snippet panel(tab)}
            {#if tab.id === 'notifications'}
              <p>
                Configure push notifications, email digests, and alert
                thresholds.
              </p>
            {:else if tab.id === 'settings'}
              <p>
                General application settings, data export, and account
                management.
              </p>
            {/if}
          {/snippet}
        </Tabs>
        <p class="text-caption text-mute px-xs">
          Active tab: <code>{controlledTab}</code>
        </p>
      </div>
    </div>

    <!-- ─── DISABLED TAB ──────────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Disabled Tabs</h5>
      <p class="text-small text-mute">
        Individual tabs can be disabled with <code>disabled: true</code>.
        Disabled tabs are skipped during arrow key navigation and rendered at
        reduced opacity.
      </p>

      <div class="surface-sunk p-md">
        <Tabs
          tabs={[
            { id: 'appearance', label: 'Appearance' },
            { id: 'plugins', label: 'Plugins' },
            { id: 'experimental', label: 'Experimental', disabled: true },
            { id: 'about', label: 'About' },
          ]}
          bind:value={disabledTab}
        >
          {#snippet panel(tab)}
            {#if tab.id === 'appearance'}
              <p>Visual customization and theme configuration.</p>
            {:else if tab.id === 'plugins'}
              <p>Manage installed plugins and browse the marketplace.</p>
            {:else if tab.id === 'about'}
              <p>Version info, credits, and system diagnostics.</p>
            {/if}
          {/snippet}
        </Tabs>
      </div>

      <p class="text-caption text-mute px-xs">
        The "Experimental" tab is <code>disabled: true</code> &mdash; it cannot be
        clicked or focused via keyboard.
      </p>
    </div>

    <!-- ─── CODE ──────────────────────────────────────────────────────── -->
    <details>
      <summary>View Code</summary>
      <pre><code
          >&lt;script&gt;
  import Tabs from './ui/Tabs.svelte';
  import &#123; Settings, User, Shield &#125; from '@lucide/svelte';

  let activeTab = $state('general');
&lt;/script&gt;

&lt;!-- Basic --&gt;
&lt;Tabs
  tabs=&#123;[
    &#123; id: 'general', label: 'General' &#125;,
    &#123; id: 'advanced', label: 'Advanced' &#125;,
  ]&#125;
  bind:value=&#123;activeTab&#125;
&gt;
  &#123;#snippet panel(tab)&#125;
    &#123;#if tab.id === 'general'&#125;
      &lt;p&gt;General content&lt;/p&gt;
    &#123;:else if tab.id === 'advanced'&#125;
      &lt;p&gt;Advanced content&lt;/p&gt;
    &#123;/if&#125;
  &#123;/snippet&#125;
&lt;/Tabs&gt;

&lt;!-- With icons --&gt;
&lt;Tabs
  tabs=&#123;[
    &#123; id: 'profile', label: 'Profile', icon: User &#125;,
    &#123; id: 'security', label: 'Security', icon: Shield &#125;,
  ]&#125;
  bind:value=&#123;tab&#125;
&gt;
  &#123;#snippet panel(tab)&#125;...&#123;/snippet&#125;
&lt;/Tabs&gt;

&lt;!-- With disabled tab --&gt;
&lt;Tabs
  tabs=&#123;[
    &#123; id: 'a', label: 'Active' &#125;,
    &#123; id: 'b', label: 'Locked', disabled: true &#125;,
  ]&#125;
  bind:value=&#123;tab&#125;
&gt;
  &#123;#snippet panel(tab)&#125;...&#123;/snippet&#125;
&lt;/Tabs&gt;</code
        ></pre>
    </details>

    <p class="text-caption text-mute px-xs">
      Props: <code>tabs</code> (TabItem[] &mdash; id, label, icon?, disabled?),
      <code>value</code> (bindable tab ID, defaults to first non-disabled),
      <code>onchange</code> (callback),
      <code>panel</code> (Snippet&lt;[TabItem]&gt; &mdash; renders panel
      content),
      <code>class</code>. Keyboard: Arrow Left/Right moves focus, Home/End jumps
      to first/last, Enter/Space activates. Disabled tabs are skipped.
    </p>
  </div>
</section>
