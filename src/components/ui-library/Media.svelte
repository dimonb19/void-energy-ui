<script lang="ts">
  import Image from '@components/ui/Image.svelte';
  import AdaptiveImage from '@components/ui/AdaptiveImage.svelte';
  import Avatar from '@components/ui/Avatar.svelte';
  import Video from '@components/ui/Video.svelte';
  import MediaSlider from '@components/ui/MediaSlider.svelte';

  // Custom-controls demo — wire MediaSlider to <video> via the element ref
  let videoEl: HTMLVideoElement | undefined = $state();
  let displayVolume = $state(50);
  let videoMuted = $state(true);
  let videoPaused = $state(true);

  $effect(() => {
    if (!videoEl) return;
    videoEl.volume = displayVolume / 100;
  });

  $effect(() => {
    if (!videoEl) return;
    videoEl.muted = videoMuted;
  });

  $effect(() => {
    if (!videoEl) return;
    if (videoPaused) videoEl.pause();
    else void videoEl.play().catch(() => (videoPaused = true));
  });

  function handleReplay() {
    if (!videoEl) return;
    videoEl.currentTime = 0;
    videoPaused = false;
  }

  // Member-list composition demo (3 members, mix of image + initials)
  const members: Array<{
    name: string;
    avatar?: string;
    presence: 'online' | 'busy' | 'away' | 'offline';
  }> = [
    {
      name: 'Jane Doe',
      avatar: 'https://picsum.photos/seed/voidpfp1/120/120',
      presence: 'online',
    },
    { name: 'Alex Lin', presence: 'away' },
    { name: 'Quinn Reyes', presence: 'offline' },
  ];

  // Sample video — Video.js's demo asset, Fastly-cached, reliable cross-region.
  const SAMPLE_VIDEO = 'https://vjs.zencdn.net/v/oceans.mp4';
  const SAMPLE_POSTER = 'https://picsum.photos/seed/voidvideoposter/640/360';
</script>

<section id="media" class="flex flex-col gap-md">
  <h2>14 // MEDIA</h2>

  <div class="surface-raised p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Native-element wrappers for content media. <code>&lt;Image&gt;</code> and
      <code>&lt;Video&gt;</code> add a skeleton during load and a muted icon on
      error; <code>&lt;Avatar&gt;</code> adds initials fallback and an optional
      presence dot; <code>&lt;AdaptiveImage&gt;</code> selects between consumer-supplied
      source URLs based on the active atmosphere's physics &times; mode. All four
      inherit physics + mode from the active atmosphere &mdash; switch atmospheres
      to see how the placeholder, skeleton shimmer, error icons, and adaptive variants
      respond across glass, flat, and retro.
    </p>

    <details>
      <summary>Technical Details</summary>
      <div class="p-md flex flex-col gap-md">
        <p>
          Per <strong>D33</strong>: Void Energy <em>wraps</em> and
          <em>selects</em> content, never modifies pixels. No filters, tints, desaturation,
          or mode-adaptive processing. The skeleton adapts to physics; the underlying
          image/video is never transformed.
        </p>
        <p>
          State is exposed via <code>data-state</code> on the wrapper:
          <code>loading</code> &rarr; <code>loaded</code>/<code>ready</code>
          &rarr; <code>error</code>. Image fades opacity on
          <code>load</code>; Video fades on <code>loadedmetadata</code> (the first
          frame is renderable, the entire file may still be downloading).
        </p>
        <p>
          Avatar wraps native <code>&lt;img&gt;</code> directly rather than
          composing <code>&lt;Image&gt;</code>: initials-during-load and
          initials-on-error are fundamentally different UX from
          skeleton-then-ImageOff. Direct wrap keeps the surface small.
        </p>
      </div>
    </details>

    <!-- ─────────────────────────────────────────────────────────────── -->
    <!-- IMAGE                                                          -->
    <!-- ─────────────────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-md">
      <h5>Image</h5>
      <p class="text-small text-mute">
        Native <code>&lt;img&gt;</code> wrapper. The wrapper carries any CSS
        aspect-ratio you set (<code>16 / 9</code>, <code>1 / 1</code>,
        <code>9 / 16</code>, <code>21 / 9</code>, etc.) so layout doesn't shift
        while the source loads. <code>objectFit</code> defaults to
        <code>cover</code> and accepts <code>contain</code>, <code>fill</code>,
        <code>none</code>, or <code>scale-down</code> for letterbox-style
        content. Lazy by default; pass <code>lazy=&#123;false&#125;</code> for
        above-the-fold imagery. The skeleton shimmer is visible on every initial
        load &mdash; below, a working image alongside the error state when
        <code>src</code> is broken.
      </p>

      <div class="grid grid-cols-1 tablet:grid-cols-2 gap-md">
        <div class="flex flex-col gap-xs">
          <Image
            src="https://picsum.photos/seed/voidhero/800/450"
            alt="Working image"
            aspectRatio="16 / 9"
          />
          <p class="text-caption text-mute">
            Working &mdash; image fades in on load
          </p>
        </div>
        <div class="flex flex-col gap-xs">
          <Image
            src="/this-image-does-not-exist.jpg"
            alt="Error demo"
            aspectRatio="16 / 9"
          />
          <p class="text-caption text-mute">
            Broken <code>src</code> &mdash; <code>ImageOff</code> icon
          </p>
        </div>
      </div>

      <details>
        <summary>View Image Code</summary>
        <pre><code
            >&lt;Image src="/hero.jpg" alt="Hero" aspectRatio="16 / 9" /&gt;
&lt;Image src="/portrait.jpg" alt="Portrait" aspectRatio="9 / 16" /&gt;
&lt;Image
  src="/banner.jpg"
  alt="Banner"
  aspectRatio="21 / 9"
  lazy=&#123;false&#125;
/&gt;
&lt;Image
  src="/logo.svg"
  alt="Logo"
  aspectRatio="3 / 1"
  objectFit="contain"
/&gt;</code
          ></pre>
      </details>
    </div>

    <!-- ─────────────────────────────────────────────────────────────── -->
    <!-- AVATAR                                                         -->
    <!-- ─────────────────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-md">
      <h5>Avatar</h5>
      <p class="text-small text-mute">
        Circular user representation. Five sizes mapped to the spacing scale:
        <code>xs</code> (<code>--space-md</code>, used by ProfileBtn for dense
        nav contexts), <code>sm</code> (<code>--space-lg</code>, compact lists),
        <code>md</code>
        (<code>--space-xl</code>, default for general use), <code>lg</code>
        (<code>--space-2xl</code>, profile cards), and
        <code>xl</code> (<code>--space-3xl</code>, hero / settings). Width and
        initials font scale together via coupled local CSS variables. When
        <code>src</code> is missing or fails to load, Avatar swaps to initials
        derived from <code>name</code> (first + last initial, max 2 chars, uppercase).
      </p>

      <h6 class="text-mute">Presence dot</h6>
      <p class="text-small text-mute">
        Optional <code>presence</code> prop with four semantic colors. Border
        uses <code>--bg-canvas</code> so the dot reads cleanly against any backdrop.
      </p>

      <div class="surface-sunk p-md flex flex-wrap items-end gap-lg">
        <div class="flex flex-col items-center gap-xs">
          <Avatar
            src="https://picsum.photos/seed/voidav2/200/200"
            name="Alex"
            size="lg"
            presence="online"
          />
          <p class="text-caption text-mute">online</p>
        </div>
        <div class="flex flex-col items-center gap-xs">
          <Avatar
            src="https://picsum.photos/seed/voidav3/200/200"
            name="Sam"
            size="lg"
            presence="busy"
          />
          <p class="text-caption text-mute">busy</p>
        </div>
        <div class="flex flex-col items-center gap-xs">
          <Avatar name="Mira" size="lg" presence="away" />
          <p class="text-caption text-mute">away</p>
        </div>
        <div class="flex flex-col items-center gap-xs">
          <Avatar name="Quinn" size="lg" presence="offline" />
          <p class="text-caption text-mute">offline</p>
        </div>
      </div>

      <h6 class="text-mute">Member list (composition)</h6>
      <p class="text-small text-mute">
        Mixed image and initials avatars at <code>sm</code> in a typical list layout.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        {#each members as member (member.name)}
          <div class="flex items-center gap-sm">
            <Avatar
              src={member.avatar}
              name={member.name}
              size="sm"
              presence={member.presence}
            />
            <div class="flex flex-col">
              <span>{member.name}</span>
              <span class="text-caption text-mute">{member.presence}</span>
            </div>
          </div>
        {/each}
      </div>

      <details>
        <summary>View Avatar Code</summary>
        <pre><code
            >&lt;Avatar name="Jane Doe" /&gt;
&lt;Avatar src="/jane.jpg" name="Jane Doe" size="lg" /&gt;
&lt;Avatar
  src="/jane.jpg"
  name="Jane Doe"
  size="xl"
  presence="online"
/&gt;
&lt;Avatar name="Quinn" presence="busy" /&gt;</code
          ></pre>
      </details>
    </div>

    <!-- ─────────────────────────────────────────────────────────────── -->
    <!-- VIDEO                                                          -->
    <!-- ─────────────────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-md">
      <h5>Video</h5>
      <p class="text-small text-mute">
        Native <code>&lt;video&gt;</code> wrapper. Defaults:
        <code>controls=&#123;true&#125;</code>,
        <code>preload="metadata"</code>, <code>aspectRatio="16 / 9"</code>. For
        non-16:9 content set <code>aspectRatio</code> directly (<code
          >9 / 16</code
        >
        for portrait, <code>1 / 1</code> for square, etc.). Pass through native
        attributes (<code>autoplay</code>,
        <code>muted</code>, <code>loop</code>, <code>playsinline</code>) for
        background-loop patterns. <code>&lt;source&gt;</code> and
        <code>&lt;track&gt;</code> elements pass through as children. For custom
        playback chrome, set
        <code>controls=&#123;false&#125;</code>, capture the inner element via
        <code>bind:element</code>, and pair with
        <code>&lt;MediaSlider&gt;</code> wired through
        <code>$effect</code> blocks (demo at the bottom).
      </p>

      <h6 class="text-mute">Standard playback &amp; error state</h6>
      <p class="text-small text-mute">
        Native browser controls with poster on the left. Broken
        <code>src</code> on the right surfaces the
        <code>VideoOff</code> icon over the
        <code>--bg-sunk</code> placeholder; <code>preload="auto"</code> is set
        on the error demo so the browser actually fetches and the 404 triggers
        the <code>error</code> event &mdash; with the default
        <code>preload="metadata"</code> modern browsers may defer the fetch until
        user interaction, hiding broken-source failures behind the play affordance.
      </p>

      <div class="grid grid-cols-1 tablet:grid-cols-2 gap-md">
        <div class="flex flex-col gap-xs">
          <Video src={SAMPLE_VIDEO} poster={SAMPLE_POSTER} />
          <p class="text-caption text-mute">
            Working &mdash; standard playback
          </p>
        </div>
        <div class="flex flex-col gap-xs">
          <Video src="/this-video-does-not-exist.mp4" preload="auto" />
          <p class="text-caption text-mute">
            Broken <code>src</code> &mdash; <code>VideoOff</code> icon
          </p>
        </div>
      </div>

      <h6 class="text-mute">Background loop</h6>
      <p class="text-small text-mute">
        <code>controls=&#123;false&#125;</code> with
        <code>autoplay muted loop playsinline</code> &mdash; browsers gate autoplay
        on muted; this combo plays without a user gesture.
      </p>
      <Video
        src={SAMPLE_VIDEO}
        poster={SAMPLE_POSTER}
        controls={false}
        autoplay
        muted
        loop
        playsinline
      />

      <h6 class="text-mute">Custom controls (MediaSlider)</h6>
      <p class="text-small text-mute">
        Capture the inner <code>&lt;video&gt;</code> via
        <code>bind:element</code>. <code>&lt;MediaSlider&gt;</code> emits volume
        / mute / pause / replay; <code>$effect</code> blocks sync the MediaSlider
        state back to the video element.
      </p>
      <div class="flex flex-col gap-md">
        <Video
          src={SAMPLE_VIDEO}
          poster={SAMPLE_POSTER}
          controls={false}
          bind:element={videoEl}
        />
        <MediaSlider
          bind:volume={displayVolume}
          bind:muted={videoMuted}
          bind:paused={videoPaused}
          playback
          replay
          onreplay={handleReplay}
        />
      </div>

      <details>
        <summary>View Video Code</summary>
        <pre><code
            >&lt;!-- Standard --&gt;
&lt;Video src="/clip.mp4" poster="/poster.jpg" /&gt;

&lt;!-- Background loop --&gt;
&lt;Video
  src="/loop.mp4"
  controls=&#123;false&#125;
  autoplay muted loop playsinline
/&gt;

&lt;!-- Vertical --&gt;
&lt;Video src="/short.mp4" aspectRatio="9 / 16" /&gt;

&lt;!-- With captions --&gt;
&lt;Video src="/clip.mp4"&gt;
  &lt;track
    kind="captions"
    src="/captions.vtt"
    srclang="en"
    label="English"
    default
  /&gt;
&lt;/Video&gt;

&lt;!-- Custom controls --&gt;
&lt;Video src="/clip.mp4" controls=&#123;false&#125; bind:element=&#123;videoEl&#125; /&gt;
&lt;MediaSlider
  bind:volume bind:muted bind:paused playback replay onreplay=&#123;replay&#125;
/&gt;</code
          ></pre>
      </details>
    </div>

    <!-- ─────────────────────────────────────────────────────────────── -->
    <!-- ADAPTIVE IMAGE                                                 -->
    <!-- ─────────────────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-md">
      <h5>Adaptive Image</h5>
      <p class="text-small text-mute">
        Selects between consumer-supplied source URLs based on the active
        atmosphere's <strong>physics &times; mode</strong> &mdash; the two
        finite axes (four valid combinations: <code>glass-dark</code>,
        <code>flat-dark</code>, <code>flat-light</code>,
        <code>retro-dark</code>). Built on the same <code>.image</code> SCSS
        surface as <code>&lt;Image&gt;</code> (skeleton, error, aspect-ratio,
        opacity fade) but holds the previous frame across atmosphere-driven
        swaps via <code>Image().decode()</code> &mdash; no skeleton flash, no
        opacity reset. Per <strong>D33</strong>: never modifies pixels &mdash;
        selects only between URLs the consumer provides. The demo below binds
        <code>glass</code>, <code>retro</code>, <code>dark</code>, and
        <code>light</code> to distinct <code>picsum</code> seeds; the
        <code>flat</code> physics-prop is intentionally omitted so flat atmospheres
        fall through to the mode-prop &mdash; giving four visually distinct images,
        one per valid physics &times; mode combination. Switch atmospheres via the
        navigation to watch the resolver advance.
      </p>

      <AdaptiveImage
        src="https://picsum.photos/seed/voidadaptive-default/800/450"
        dark="https://picsum.photos/seed/voidadaptive-dark/800/450"
        light="https://picsum.photos/seed/voidadaptive-light/800/450"
        glass="https://picsum.photos/seed/voidadaptive-glass/800/450"
        retro="https://picsum.photos/seed/voidadaptive-retro/800/450"
        alt="Adaptive image — distinct variant per glass-dark, flat-dark, flat-light, retro-dark"
        aspectRatio="16 / 9"
      />

      <details>
        <summary>How resolution works</summary>
        <div class="p-md flex flex-col gap-md">
          <p>
            <strong>Precedence: physics &gt; mode &gt; <code>src</code>.</strong
            > On each atmosphere change the resolver checks props in this order and
            stops at the first match.
          </p>
          <ol class="flex flex-col gap-xs">
            <li>
              If the active <code>data-physics</code> matches a physics-prop (<code
                >glass</code
              >, <code>flat</code>, <code>retro</code>) and that prop is bound,
              that URL wins.
            </li>
            <li>
              Otherwise, if the active <code>data-mode</code> matches (<code
                >dark</code
              >
              or <code>light</code>) and that prop is bound, that URL wins.
            </li>
            <li>
              Otherwise, the default <code>src</code> URL is used.
            </li>
          </ol>
          <p>
            <strong>Mode-prop reach.</strong> Glass and retro physics both force
            dark mode (auto-corrected by the engine), so the <code>light</code>
            prop only ever fires under flat physics. The <code>dark</code> prop fires
            under flat-dark, retro-dark, and any glass atmosphere that doesn't have
            a physics-prop bound.
          </p>
          <p>
            <strong>Swap behaviour.</strong> On atmosphere change the next
            variant is fetched and decoded off-DOM via
            <code>Image().decode()</code>; only after decode resolves does the
            visible <code>&lt;img&gt;</code> src advance. The browser holds the
            previous frame on the element across the swap &mdash; the wrapper
            does <em>not</em> return to the loading state, so no skeleton flash,
            no opacity reset, no missing-image gap. The skeleton is therefore only
            ever visible on initial mount, before any variant has loaded.
          </p>
          <p>
            <strong>First-paint trade-off.</strong> The visible
            <code>&lt;img&gt;</code> is gated on a client-only
            <code>mounted</code> flag, so SSR emits skeleton-only HTML &mdash;
            no stale <code>&lt;img src&gt;</code> for hydration to reconcile. On
            the first client effect <code>displayedSrc</code> snaps to the
            resolved variant for the visitor's persisted atmosphere and the
            <code>&lt;img&gt;</code> mounts already pointing at the right URL,
            so the browser's first fetch is the right one. The trade-off is
            visibility: search engines that don't execute JS, and visitors with
            JS disabled, see only the skeleton. For SEO-critical hero imagery
            without atmosphere variants, prefer plain
            <code>&lt;Image&gt;</code>.
          </p>
          <p>
            <strong>What it does <em>not</em> do.</strong> Never keys on
            atmosphere name (atmospheres are unbounded; physics &times; mode is
            finite); never applies filters, tints, or pixel processing; never
            auto-inverts between light and dark. If only <code>src</code> is provided
            and the user switches modes, the image does not change &mdash; variants
            are explicit.
          </p>
        </div>
      </details>

      <details>
        <summary>View AdaptiveImage Code</summary>
        <pre><code
            >&lt;!-- Full variant set --&gt;
&lt;AdaptiveImage
  src="/hero.jpg"
  dark="/hero-dark.jpg"
  light="/hero-light.jpg"
  glass="/hero-glass.jpg"
  flat="/hero-flat.jpg"
  retro="/hero-retro.jpg"
  alt="Hero image"
  aspectRatio="16 / 9"
/&gt;

&lt;!-- Single override (others fall through to src) --&gt;
&lt;AdaptiveImage
  src="/hero.jpg"
  glass="/hero-glass.jpg"
  alt="Hero image"
  aspectRatio="16 / 9"
/&gt;

&lt;!-- Precedence: physics &gt; mode &gt; src --&gt;
&lt;AdaptiveImage
  src="/hero.jpg"
  dark="/hero-dark.jpg"
  glass="/hero-glass.jpg"
  alt="Hero image"
  aspectRatio="16 / 9"
/&gt;</code
          ></pre>
      </details>
    </div>
  </div>
</section>
