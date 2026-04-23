# Kinetic Text — AI Reference

Reference for AI story-generation pipelines. Describes the JSON contract, effect vocabulary, and combination guidance for driving KineticText from an AI backend.

This file is the canonical source for the narrative text-effect vocabulary. Each story step may include a `narrativeEffect` (via `activeEffect` or `punctuation`). Continuous effects loop from the moment the step starts (during kinetic reveal) until the step ends. One-shot effects fire once when the reveal completes — they are punctuation, not atmosphere.

---

## Output Schema

The AI returns this per story step. All fields except `text` are optional — omitted fields use defaults.

```json
{
  "text": "The door creaks open, revealing nothing but darkness.",
  "revealStyle": "blur",
  "speedPreset": "slow",
  "activeEffect": "breathe",
  "punctuation": "jolt"
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `text` | `string` | — | **Required.** The story text to display. |
| `revealStyle` | `RevealStyle` | `"pop"` | How text enters the screen. Sets the visual tone of arrival. |
| `speedPreset` | `"slow" \| "default" \| "fast"` | `"default"` | Pacing of the text reveal. |
| `activeEffect` | `ContinuousEffect \| null` | `null` | Sustained mood loop running on the text. `null` = no effect. |
| `punctuation` | `OneShotEffect \| null` | `null` | Dramatic beat that fires once when reveal completes. `null` = no punctuation. |

### Fields the AI should NOT set

These are handled by the client runtime — the AI never needs to specify them:

- `revealMode` — always `"word"` for story text
- `stagger`, `speed`, `charSpeed` — derived from `speedPreset`
- `styleSnapshot` — resolved from the live DOM
- `cues` with `at-time` timing — the AI doesn't know character positions; use `punctuation` (fires on complete) instead
- Physics/mode adaptation — automatic from the active theme

---

## Speed Presets — Narrative Pacing

| Preset | Meaning | Best For |
|--------|---------|----------|
| `"slow"` | Deliberate, dramatic | Revelations, horror, emotional weight, final moments |
| `"default"` | Natural reading pace | Standard narration, dialogue, exploration |
| `"fast"` | Urgent, breathless | Action sequences, chases, panic, time pressure |

---

## Reveal Styles — How Text Arrives

Each style sets the emotional tone of the text's entrance before any effects apply.

| Style | Narrative Meaning | Best For |
|-------|-------------------|----------|
| `"pop"` | **Default.** Chaotic, energetic, alive | Action, surprise, instability, general narration |
| `"drop"` | Weight, gravity, inevitability | Bad news, heavy revelations, landing, doom |
| `"rise"` | Hope, emergence, awakening | Recovery, dawn, ascent, freedom, rebirth |
| `"blur"` | Dream, memory, uncertainty | Flashbacks, visions, confusion, waking up |
| `"scale"` | Growth, importance, emphasis | Power moments, transformation, realization |
| `"scramble"` | Decoding, discovery, interference | Sci-fi terminals, puzzle solving, intercepted signals |
| `"instant"` | Cold, matter-of-fact, clinical | System messages, death screens, stark truths |

---

## Continuous Effects — Sustained Mood (21 variants)

These loop from the moment the step begins (during reveal) until the step ends. They are ambient atmosphere — the text drifts or flickers as it streams in, setting the mood from the first word. Only one can be active at a time. Grouped by emotional family for prompt engineering.

### Fear / Tension

#### `tremble`

**Motion:** Fast micro-vibration. Continuous but deliberately small.
**Emotion:** Vulnerability at the edge of breaking. Exposed nerves.

**Use when:**
- A character is freezing, shivering, hypothermic
- Fear that is felt in the body — trembling hands, shaky voice
- Fragility — holding something delicate, walking a narrow ledge
- Suppressed emotion about to overflow (rage, grief, panic)
- Physical exhaustion where muscles can barely hold

**Do not use when:**
- The shaking is from external force — use `shake`/`quake` (one-shot)
- The scene is calm or confident
- The vibration would read as mechanical — use `vibrate`

#### `flicker`

**Motion:** Irregular opacity drops with hard cuts between states.
**Emotion:** Instability. The environment itself cannot be trusted.

**Use when:**
- Failing lights — emergency strips, dying torches, broken neon
- Unstable power in a facility, ship, or machine
- A haunted or cursed location where presence is intermittent
- A fading transmission, a dying broadcast, a weak signal
- Something is phasing in and out of existence

**Do not use when:**
- The instability is digital/data corruption — use `glitch` (one-shot)
- The scene is calm or emotionally warm
- The character is in a stable, well-lit environment

#### `static`

**Motion:** Rapid micro-jitter combined with overlapping opacity flicker drops.
**Emotion:** The signal is breaking. Something is fighting through interference.

**Use when:**
- Radio or comms transmission — receiving a damaged broadcast
- Broken communications — a voice cutting in and out
- Digital interference — data corruption on a persistent channel
- A corrupted data stream — text rendered through a bad connection
- Psychic noise — telepathic contact through a hostile medium

**Do not use when:**
- The corruption is a single momentary event — use `glitch` (one-shot)
- The opacity instability is environmental (lights) — use `flicker`
- The vibration is physical/bodily — use `tremble`

#### `burn`

**Motion:** Vertical micro-wobble with slight skew oscillation. Faster rhythm than drift.
**Emotion:** Heat is distorting perception. The air itself is unstable.

**Use when:**
- A fire scene — burning buildings, campfires with supernatural heat
- Desert heat — sun-baked landscapes, mirages, heat stroke
- Rage — internal heat manifesting as physical distortion
- Fever — a character burning up, delirious with temperature
- Volcanic or magmatic environments — lava, geothermal vents

**Do not use when:**
- The scene is cold — use `freeze` or `tremble` instead
- The distortion is digital — use `glitch` (one-shot) or `static`
- The wobble would read as floating — use `drift` for underwater/dreams

#### `vibrate`

**Motion:** High-frequency micro-oscillation on each letter — tighter and faster than `tremble`, with a mechanical edge.
**Emotion:** Electrical potential. The word is charged and about to discharge.

**Use when:**
- Machinery running hot, engines under load, reactors approaching critical
- Electrical buildup — capacitors charging, weapons powering up
- Magical charge gathering before release
- Mechanical resonance — a bridge flexing, metal under tension

**Do not use when:**
- The shaking is organic fear or cold — use `tremble`
- The disruption is digital/signal — use `static`
- The heat itself is the cause — use `burn`

### Unease / Disorientation

#### `distort`

**Motion:** Subtle rotation oscillation with asymmetric scaleX/scaleY breathing. The text looks slightly wrong.
**Emotion:** Perception is unreliable. The character is conscious but reality is warped.

**Use when:**
- A character is drunk or intoxicated — the world tilts and sways
- Poisoned — perception warping involuntarily, things look wrong
- Hallucinating — seeing things that shift and bend
- Vertigo or disorientation — after a fall, a blow to the head, spinning
- Under psychic influence — mind being manipulated, thoughts distorted
- Concussion or head trauma — the room won't hold still

**Do not use when:**
- The character is losing consciousness — use `fade` instead
- The distortion is heat-related — use `burn` instead
- The spatial warping is a one-time event (teleport) — use `warp` (one-shot)
- The instability is environmental, not perceptual — use `flicker` or `tremble`

#### `sway`

**Motion:** Horizontal translateX sine wave. The text rocks side to side like a ship in heavy seas.
**Emotion:** The ground cannot be trusted. Balance is a constant negotiation.

**Use when:**
- A character is on a ship, boat, or raft in rough water
- An earthquake or tremor — the ground itself is moving laterally
- Walking across a rope bridge, narrow beam, or unstable surface
- Inside a vehicle that is rocking or swaying — train, bus, aircraft in turbulence
- Storm winds pushing a character or environment sideways
- Aftermath of a blast — the character is on their feet but the world won't hold still

**Do not use when:**
- The motion is vertical (floating, sinking) — use `drift` instead
- The instability is perceptual/internal (drunk, poisoned) — use `distort` instead
- The shaking is from a single impact — use `shake`/`quake` (one-shot)
- The character is trembling from fear or cold — use `tremble` instead

#### `wobble`

**Motion:** Asymmetric scaleX/scaleY wobble with slight rotation — text rendered as if in gelatin.
**Emotion:** The floor is soft rubber. Nothing holds its shape.

**Use when:**
- Reality softening mid-scene — the world becoming negotiable
- Transformation in progress — body or form mid-mutation
- Ground becoming unstable underfoot in a surreal/dream logic scene
- A jelly-world, cartoon physics, or deliberately squishy atmosphere

**Do not use when:**
- The instability is digital corruption — use `glitch` (one-shot) or `static`
- The disorientation is perceptual — use `distort`
- The motion is subtle body fear — use `tremble`

#### `stretch`

**Motion:** Horizontal scaleX extension and release on each word — elastic distortion.
**Emotion:** Form itself is plastic. Something is being pulled beyond its shape.

**Use when:**
- Body horror — a character mutating, limbs lengthening
- Spatial compression or elongation — a corridor pulling longer than it should
- Nightmare logic where text and space stretch unnaturally
- A character being pulled toward a force (black hole edge, tractor beam)

**Do not use when:**
- The spatial warp is a single event — use `warp` (one-shot)
- The character is dizzy rather than stretched — use `distort`
- The scene is grounded and stable

#### `drip`

**Motion:** Each word occasionally sags downward before recovering — slow organic drift, wet with gravity.
**Emotion:** The ink itself won't stay put. Something is decomposing.

**Use when:**
- Rain on glass, water dripping in a cave, condensation on cold metal
- Wax melting, flesh rotting, organic decay in progress
- Memory or time eroding — the words won't hold their shape
- A scene where moisture/gravity/decomposition is the motif

**Do not use when:**
- The collapse is violent — use `collapse` or `shatter` (one-shot)
- The motion is upward (floating) — use `float`
- The scene is clean and dry

### Mystery / Supernatural

#### `haunt`

**Motion:** Slight drift plus overlapping opacity ghosts — each word leaves faint afterimages.
**Emotion:** A presence that isn't quite here. Memory bleeding through the wall of the present.

**Use when:**
- Ghosts, spirits, or echoes speaking through the text
- Afterimages — the residue of someone who used to be in this room
- Liminal thresholds — crossing into a space where the dead have weight
- A between-worlds contact — séance, mediumship, dream visitation

**Do not use when:**
- The voice is confident and fully present — use no effect or `breathe`
- The fading is consciousness loss — use `fade`
- The fragility is secret-keeping, not supernatural — use `whisper`

#### `whisper`

**Motion:** Opacity and scale recede together. The text feels barely there.
**Emotion:** Fragile presence. The voice could vanish at any moment.

**Use when:**
- A ghost, spirit, or echo is speaking
- A memory is being recalled — distant, fading, half-real
- Telepathy, psychic communication, inner voice
- A secret is being shared in near-silence
- A dying character's last words
- Text from a dream that is already dissolving on waking

**Do not use when:**
- The voice is confident or commanding
- The instability is environmental — use `flicker` instead
- The fragility is physical (shaking body) — use `tremble`

#### `fade`

**Motion:** Gradual opacity drift to half visibility and back. Pure opacity, no position or scale.
**Emotion:** Slipping away. The world is receding or consciousness is failing.

**Use when:**
- A character is losing consciousness — injury, poison, exhaustion
- Drugged or sedated — perception dissolving involuntarily
- A time skip — the present moment is fading into the next
- A memory dissolving on inspection — trying to hold a dream
- Falling asleep — the scene grows distant as awareness leaves

**Do not use when:**
- The fading is supernatural or ghostly — use `whisper` instead
- The instability is environmental (lights) — use `flicker` instead
- The character is alert but the voice is fragile — use `whisper`

#### `sparkle`

**Motion:** Scattered twinkling brightness points across letters — random shimmer, never uniform.
**Emotion:** Something precious is being witnessed. Magic is in the air.

**Use when:**
- Treasure revealed, enchantment taking hold, wishes granted
- Divine favor or blessing manifesting
- Starlight revelation — first sight of a constellation, cosmic wonder
- A fairy presence, sprite magic, soft wonder

**Do not use when:**
- The scene is grounded and mundane
- The brightness is artificial flicker — use `flicker`
- The magic is dark or destructive — use `burn` or `vibrate`
- The light is singular/sustained — use `glow`

#### `glow`

**Motion:** Soft brightness pulse on each letter with a gentle color bleed. The text looks lit from within.
**Emotion:** Enchanted presence. Something holy or magical inhabits the word itself.

**Use when:**
- A magical aura surrounds the speaker or object
- A glowing artifact narrates or is described mid-emanation
- Bioluminescent environments — deep-sea organisms, enchanted fungi
- A divine or supernatural voice with benevolent presence

**Do not use when:**
- The scene is grounded or realistic
- The light flickers or fails — use `flicker`
- The aura is threatening — use `burn` or `vibrate`
- The brightness is discrete twinkles — use `sparkle`

### Wonder / Calm

#### `breathe`

**Motion:** Slow rhythmic scale pulse. The text gently expands and contracts.
**Emotion:** Focused tension, mindful awareness, emotional weight held steady.

**Use when:**
- Suspenseful moments — waiting for a verdict, hiding from danger
- A character centering themselves before a critical action
- Emotional weight — grief, love, awe — held without breaking
- Meditation, prayer, ritual concentration
- Long quiet scenes where stillness itself is the atmosphere

**Do not use when:**
- The tension is sharp and rhythmic — use `pulse` instead
- The scene is chaotic or unstable — `breathe` is too controlled
- The character is in physical distress — use `tremble`

#### `drift`

**Motion:** Slow vertical sine wave. The text floats as if weightless.
**Emotion:** Detachment, serenity, otherworldliness. Time has slowed.

**Use when:**
- Underwater scenes — swimming, sinking, submerged environments
- Dreaming, astral projection, out-of-body experience
- Zero gravity, floating through space, weightless travel
- A calm, meditative moment after intense action
- Scenes in fog, mist, or clouds where grounding is lost

**Do not use when:**
- The scene is tense or urgent — `drift` is too calm
- The character is grounded and alert
- There is danger present — use `breathe` or `pulse` instead

#### `float`

**Motion:** Each word drifts upward in a slow random walk, settling gently.
**Emotion:** Gravity has let go. The text is rising rather than drifting.

**Use when:**
- Space scenes with visible upward motion — ascension, liftoff
- Levitation — magical lift, lighter-than-air moments
- Out-of-body experience where the soul rises out of the scene
- Balloons, bubbles, embers rising, prayer rising

**Do not use when:**
- The weightlessness has no direction — use `drift`
- The motion is active chaos — use `pulse` or action
- The scene is grounded

#### `wave`

**Motion:** Slow vertical sine on each word along the line, like a ripple moving left to right.
**Emotion:** Rhythmic pull. The sea's breathing, or music moving through a crowd.

**Use when:**
- Sea travel, ocean scenes, rhythmic tides
- Crowd motion — a wave of people, cheering, collective sway
- Musical moments — a chorus rising, a melody landing
- Lullabies, incantations, rhythmic spells

**Do not use when:**
- Stillness is required — use `breathe`
- The motion is panic or chaos
- The text should feel solid and grounded

#### `pulse`

**Motion:** Heartbeat-tempo scale with a sharp attack. Rhythmic and insistent.
**Emotion:** Countdown pressure. Something is building toward a threshold.

**Use when:**
- A heartbeat becomes audible — fear, exertion, proximity to danger
- Ritual energy building — a spell charging, a seal activating
- A countdown or timer running — bomb, launch, deadline
- Approaching something powerful — an artifact, an entity, a core
- The moment before a transformation or irreversible action

**Do not use when:**
- The rhythm is organic and calm — use `breathe` instead
- The character is at rest or in a safe environment
- The tension is fragile rather than forceful — use `whisper`

### Neutral / Atmospheric

#### `freeze`

**Motion:** Very slight scale contraction and brightness reduction. Almost imperceptible.
**Emotion:** Complete stillness. Time or body or will has stopped.

**Use when:**
- Ice magic encasing, spreading, or locking a character in place
- Paralysis — magical, chemical, or fear-induced
- Time freeze — the world pauses around a character
- Petrification — turning to stone, crystal, or ice
- Stasis — suspended animation, cryo sleep, magical preservation

**Do not use when:**
- The cold is felt as shivering — use `tremble` instead
- The stillness is meditative or chosen — use `breathe` instead
- The scene involves any kind of movement or action

---

## One-Shot Effects — Dramatic Punctuation (16 variants)

These fire once when the text finishes revealing. They are punctuation moments — a single impact, shock, or disruption that marks the text and then subsides. Use them to punctuate key narrative beats. Never combine two one-shots on the same step.

### Impact / Force

#### `shake`

**Motion:** Rapid horizontal jitter, decaying to rest.
**Emotion:** Sudden physical impact — forceful but contained.

**Use when:**
- A door slams, a fist hits a table, a vehicle collides
- An explosion at medium range (close but survivable)
- A heavy object falls or crashes nearby
- The ground receives a single hard strike

**Do not use when:**
- The impact is massive or prolonged — use `quake` instead
- The shock is psychological, not physical — use `jolt` instead
- The scene is digital/technological — use `glitch` instead

#### `quake`

**Motion:** Violent two-axis displacement with a long, rolling settle.
**Emotion:** Overwhelming destructive force. The world itself is breaking.

**Use when:**
- A building collapses, a bridge gives way, the ground splits
- A detonation at close range shakes everything
- Thunder cracks directly overhead
- A massive creature impacts the ground
- Structural failure — ceiling caving, floor buckling

**Do not use when:**
- The impact is small or localized — use `shake` instead
- The moment is a surprise rather than raw force — use `jolt`

#### `slam`

**Motion:** Each word drops sharply and compresses vertically at impact, then settles.
**Emotion:** Mass lands. The weight is final.

**Use when:**
- A boss creature landing, a heavy object falling
- Overwhelming force arriving — a verdict, a gavel, a door crashing shut
- A decisive blow that ends the beat
- Gravity winning — something falling under its own weight

**Do not use when:**
- The hit is lighter or vibratory — use `shake`
- The landing is playful or soft — use `bounce`
- The force is outward rather than downward — use `explode`

#### `jolt`

**Motion:** Single violent displacement with an elastic snap-back.
**Emotion:** A spike of alarm — adrenaline before the brain catches up.

**Use when:**
- A jump scare — something appears without warning
- A character is grabbed, stabbed, or struck suddenly
- A sudden realization hits (betrayal revealed, trap sprung)
- An electric shock, a gunshot, a whip crack
- Waking from a nightmare with a start

**Do not use when:**
- The force is sustained or environmental — use `shake`/`quake`
- The disruption is digital or reality-breaking — use `glitch`

#### `bounce`

**Motion:** Each word drops briefly and springs back — elastic, playful landing.
**Emotion:** Soft impact. A playful collision, not destructive.

**Use when:**
- A soft landing — a character hopping down, a ball bouncing
- Playful energy — cartoonish moments, comedy beats
- A gentle surprise that recovers immediately
- A child's scene, a dream-logic moment, a whimsical beat

**Do not use when:**
- The impact has real weight — use `shake` or `slam`
- The scene is serious and the bounce would undercut it
- The character is hurt — use `jolt` or `shake`

### Destruction / Chaos

#### `explode`

**Motion:** Each word scales outward rapidly while blurring, then dissolves.
**Emotion:** Pure kinetic release. The line bursts outward.

**Use when:**
- A bomb detonation, a weapon's muzzle flash landing
- Catastrophic failure — reactor breach, vessel rupture
- Rage outburst — a character finally losing control
- A cataclysmic moment where containment fails

**Do not use when:**
- The failure is structural collapse — use `collapse`
- The breakage is fracture — use `shatter`
- The exit is gentle or fade-like — use ambient `dissolve`

#### `shatter`

**Motion:** Each word fractures into pieces that fly outward and fade.
**Emotion:** A clean thing is broken into unrecoverable parts.

**Use when:**
- Glass breaking, ice cracking, mirror splintering
- A shield, barrier, or wall failing dramatically
- Trust broken — a relationship irreversibly fractured
- A lie exposed — the surface of something falsely whole cracking open

**Do not use when:**
- The breakage is collapse, not fracture — use `collapse`
- The release is outward force without pieces — use `explode`
- The break is reversible or soft — use `bounce`

#### `collapse`

**Motion:** Each word falls into a stack at the baseline — the line buckles downward.
**Emotion:** Structure gives up. What was standing is no longer standing.

**Use when:**
- A building falling, a cave-in, a ceiling coming down
- Morale breaking — a character giving up, surrendering
- Physical structure failure — a bridge, a wall, a mechanism
- Defeat — the moment before a fall becomes final

**Do not use when:**
- The scene is intact — use no effect
- The force is outward — use `explode` or `shatter`
- The exit is gentle — use ambient `dissolve`

#### `scatter`

**Motion:** Each word drifts outward in random directions before fading.
**Emotion:** Something coherent flies apart. The message scatters.

**Use when:**
- Wind blowing things away — leaves, papers, sparks
- Memory fragmenting — a recollection dissolving into pieces
- Ashes being released, dust dispersing
- A crowd breaking up, a ritual ending mid-word

**Do not use when:**
- The scene stays coherent — use no effect
- The force is violent and outward — use `explode`
- The presence is ghostly rather than dispersing — use `haunt` (continuous)

### Energy / Power

#### `surge`

**Motion:** Ascending scale with brightness overshoot, then settle.
**Emotion:** Power awakening. Something has been unleashed or realized.

**Use when:**
- A spell or magical ability activates, erupts, or detonates
- A character transforms, evolves, or ascends
- Divine intervention — a god responds, a blessing manifests
- A sudden epiphany or breakthrough — clarity hits like a wave
- An artifact or power source activates for the first time

**Do not use when:**
- The force is destructive or violent — use `quake`/`shake`
- The moment is digital corruption — use `glitch`
- The power is sustained rather than a single moment — use `pulse` (continuous)

#### `flash`

**Motion:** Bright pulse on the text — scale up, brightness surge, quick decay.
**Emotion:** A single white event lands on the words themselves. Revelation.

**Use when:**
- The text carries a lightning realization or sudden clarity
- A camera flash or photographic capture of the moment
- A spell discharging within the line being spoken
- A revelation that snaps the scene into focus

**Do not use when:**
- The brightness is sustained aura — use `glow` (continuous)
- The moment is a physical hit — use `shake` or `slam`
- The flash is environment-level (lightning across the sky) — use ambient `flash` action

#### `ripple`

**Motion:** A wave propagates across the line — each word displaces in sequence.
**Emotion:** A wave passes through. Something has been transmitted.

**Use when:**
- A sonic boom, a shockwave crossing the scene
- A psychic wave — telepathic push, empathic broadcast
- A force-field activation, a barrier projecting outward
- A pulse of energy moving through the speaker

**Do not use when:**
- The impact is a single point — use `shake`
- The wave is sustained and rhythmic — use `wave` (continuous)
- The release is explosive — use `explode`

#### `spin`

**Motion:** Each word rotates sharply on its own axis, then resolves.
**Emotion:** Torque. Something has been wound up and released.

**Use when:**
- A mechanical activation — a wheel, a dial, a gear locking
- A whirlwind, a cyclone, a vortex spinning up
- A vertigo beat — a single spin of the room
- A roulette, a die, a tarot card flipped

**Do not use when:**
- The scene is still — use no effect
- The rotation is continuous — use `distort`
- The transport is spatial — use `warp`

### Reality Break

#### `glitch`

**Motion:** Choppy skewed displacement with stepped timing. Digital instability.
**Emotion:** Reality is corrupted. Something is wrong with the signal itself.

**Use when:**
- A simulation or virtual environment malfunctions
- A memory is being altered, erased, or rewritten
- A character hacks into a system or is being hacked
- Signal interference, transmission failure, static
- Reality fractures — dimensional tears, time skips
- An AI or digital entity malfunctions or breaks character

**Do not use when:**
- The disruption is physical (impact, explosion) — use `shake`/`quake`
- The moment is purely emotional shock — use `jolt`

#### `warp`

**Motion:** Horizontal scaleX oscillation with subtle skew. Spatial distortion.
**Emotion:** Space itself is bending. The rules of geometry are briefly wrong.

**Use when:**
- Teleportation — a character is moved instantaneously
- Portal entry or exit — crossing dimensional boundaries
- A time warp, time skip, or temporal anomaly
- Gravity fails or inverts briefly
- Space folds, compresses, or stretches around a character

**Do not use when:**
- The distortion is digital/data — use `glitch`
- The spatial effect is sustained — use `drift` or `stretch` (continuous)
- The moment is a physical impact — use `jolt` or `shake`

#### `vortex`

**Motion:** Each word spirals inward toward a center point before compressing away.
**Emotion:** Gravity well. Everything pulls toward one point.

**Use when:**
- A black hole, a whirlpool, a singularity
- A summoning ritual pulling an entity through
- A portal forming inward — not a warp across but a drain toward
- A mind being pulled into an obsession or compulsion

**Do not use when:**
- The motion is outward — use `explode` or `scatter`
- The spatial shift is a transit — use `warp`
- The scene is stable — use no effect

---

## Inline Style Spans — Word-Range Decoration

A fourth, motion-neutral layer. The AI may tag 0–3 word ranges inside `text` with a visual `kind`. Applied as `data-kt-style` (+ `data-kt-style-pos` for position within the range) on the matching `kt-word` wrappers; SCSS owns the visual treatment. Composes cleanly with reveal, continuous, and one-shot — a styled word can still be a cue target at the same word.

Passed to `<KineticText>` as the `styleSpans` prop:

```typescript
import type { StyleSpan } from '@void-energy/kinetic-text/types';

const styleSpans: StyleSpan[] = [
  { fromWord: 6, toWord: 7,  kind: 'speech' },
  { fromWord: 21, toWord: 21, kind: 'speech' },
];
```

### Kinds (5)

| Kind | Treatment | Use When |
|------|-----------|----------|
| `speech` | Italic + **automatic curly quotes** (never type `"` in `text`) | A character speaks — dialogue, remembered phrase, radio voice |
| `aside` | Muted color only (no italic — reserved for `speech`) | Hushed parenthetical, second-layer detail, volume-down pair to `emphasis` |
| `emphasis` | Bold | One single load-bearing word — the beat's pivot. **Max 1 per beat.** |
| `underline` | Text-decoration underline | Stark callouts, signage the character reads. **Max 2 ranges, ≤2 words each.** |
| `code` | Mono + recessed inline chip (`--bg-sunk` bg + border + rounded) | System / machine voice — terminal lines, screen labels, signage. Prefer single word. |

### Schema rules (enforced)

- **0–3 spans per beat.** Default zero — plain prose is the baseline.
- **One kind per beat.** All spans in `styleSpans` MUST share the same `kind`. Mixing (e.g. `speech` + `emphasis`) is rejected.
- **Word indices are 0-indexed, inclusive.** `fromWord === toWord` is a single-word span. `toWord` must be `≥ fromWord`.
- **Rotate across beats.** If the previous beat used `speech`, don't use `speech` again this beat — let variety breathe across the session.

### Author rules (taste)

- `emphasis` — **ONE range maximum** per beat. Pick the one word that carries the weight.
- `underline` — rare; ≤2 ranges per beat; each ≤2 words.
- `code` — prefer 1-word spans; 2 is fine; 3+ reads as busy adjacent chips.
- `speech` — NEVER include quote characters in `text`. The renderer adds curly quotes via CSS `::before` / `::after`, synced to the reveal so marks don't announce unrevealed words.
- Styles are motion-neutral (no `transform` / `opacity` / `filter`), so they compose with kinetic effects on the same word.

### Composition examples

| Scenario | `styleSpans` | Notes |
|----------|--------------|-------|
| Pivot word + climax one-shot | `[{ fromWord: 9, toWord: 9, kind: 'emphasis' }]` + cue at word 9 | Bold + effect on same word = one bigger landed moment |
| Two-phrase dialogue | `[{ fromWord: 6, toWord: 7, kind: 'speech' }, { fromWord: 21, toWord: 21, kind: 'speech' }]` | Attribution ("she says") sits OUTSIDE the ranges |
| Two signs speaking | `[{ fromWord: 2, toWord: 2, kind: 'code' }, { fromWord: 5, toWord: 6, kind: 'code' }]` | Each word renders as its own chip |

---

## Combination Guidance

### Which reveal style + effect pairings work best

| Scenario | revealStyle | activeEffect | punctuation | speedPreset |
|----------|-------------|-------------|-------------|-------------|
| Horror reveal | `"blur"` | `"tremble"` | `"jolt"` | `"slow"` |
| Action beat | `"pop"` | `"pulse"` | `"shake"` | `"fast"` |
| Dream sequence | `"blur"` | `"drift"` | — | `"slow"` |
| Power moment | `"scale"` | `"glow"` | `"surge"` | `"default"` |
| Death / fade out | `"blur"` | `"fade"` | — | `"slow"` |
| Sci-fi terminal | `"scramble"` | `"static"` | `"glitch"` | `"fast"` |
| Underwater | `"rise"` | `"drift"` | — | `"slow"` |
| Boss encounter | `"drop"` | `"pulse"` | `"slam"` | `"slow"` |
| Peaceful moment | `"rise"` | `"breathe"` | — | `"default"` |
| Ghost speaking | `"blur"` | `"haunt"` | `"scatter"` | `"slow"` |
| Explosion aftermath | `"pop"` | `"flicker"` | `"quake"` | `"fast"` |
| Final revelation | `"scale"` | `"sparkle"` | `"flash"` | `"slow"` |

### Rules of thumb

1. **One continuous effect at a time.** Never stack multiple — the system only accepts one.
2. **Punctuation is optional.** Most story steps don't need it — save it for genuine dramatic beats (1 in 3–5 steps).
3. **Match speed to tension.** Slow for dread/weight, fast for urgency/action, default for everything else.
4. **`"instant"` reveal = emotional void.** Use sparingly — death screens, cold system messages, the moment hope dies.
5. **Don't over-effect.** A step with no `activeEffect` and no `punctuation` is perfectly valid. Silence has power.

---

## Usage Rules

1. **Most steps should have no effect.** Effects are seasoning, not the meal. A story where every step shakes or drifts becomes noise. Reserve effects for moments that genuinely benefit from physical reinforcement.

2. **One effect per step.** Never assign both a one-shot and a continuous effect on the same word. Pick the one that best serves the moment. A continuous `activeEffect` and a one-shot `punctuation` on the same step are fine — they fire at different times.

3. **One-shot = punctuation. Continuous = atmosphere.** If the moment is a single event (a crash, a scare), use a one-shot. If the moment is a sustained state (drifting, trembling, tension), use continuous.

4. **Match intensity to narrative weight.** A casual conversation does not need `breathe`. A world-ending explosion does not need `shake` — it needs `quake`.

5. **Contrast creates impact.** Three steps of no effect followed by one `jolt` hits harder than `jolt` → `shake` → `quake` → `glitch` in sequence. Let silence make the effects meaningful.

6. **Never use effects for:** dialogue in normal conditions, scene transitions or establishing shots, internal monologue (unless the thoughts themselves are unstable — then `whisper` or `glitch` may apply), or comedy/lighthearted moments (effects read as dramatic).

---

## Timing Behavior

The two categories behave differently during kinetic text reveal:

- **Continuous effects** start **immediately** when the step begins. They are ambient atmosphere — the text drifts or flickers as it streams in, setting the mood from the first word.

- **One-shot effects** wait for kinetic reveal to **finish**. They are punctuation — a jolt only makes sense once the full sentence is visible.

The client handles this automatically via `isOneShotEffect()`. The AI only needs to set the field — the rendering engine handles the rest.

---

## Valid Values — Quick Reference

### revealStyle (7)
`"pop"` `"drop"` `"rise"` `"blur"` `"scale"` `"scramble"` `"instant"`

### speedPreset (3)
`"slow"` `"default"` `"fast"`

### activeEffect — continuous (21)
`"drift"` `"flicker"` `"breathe"` `"tremble"` `"pulse"` `"whisper"` `"fade"` `"freeze"` `"burn"` `"static"` `"distort"` `"sway"` `"glow"` `"wave"` `"float"` `"wobble"` `"sparkle"` `"drip"` `"stretch"` `"vibrate"` `"haunt"`

### punctuation — one-shot (16)
`"shake"` `"quake"` `"jolt"` `"glitch"` `"surge"` `"warp"` `"explode"` `"collapse"` `"scatter"` `"spin"` `"bounce"` `"flash"` `"shatter"` `"vortex"` `"ripple"` `"slam"`

### styleSpans.kind (5)
`"speech"` `"aside"` `"emphasis"` `"underline"` `"code"`
