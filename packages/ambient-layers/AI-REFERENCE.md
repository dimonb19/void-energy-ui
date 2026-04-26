# Ambient Layers — AI Reference

Reference for AI story-generation pipelines. Describes the JSON contract, effect vocabulary, lifetime behavior, and combination guidance for driving ambient overlays from an AI backend.

This file is the canonical source for the ambient effect vocabulary. A scene may activate any combination of layers — at most one variant per category at a time. Categories compose freely: Environment + Atmosphere + Psychology can all be on together, with Action firing one-shot beats over the top.

---

## Output Schema

The AI returns these fields per story step. All are optional — omitted fields keep their previous value (layers are sticky). Set to `null` to remove a layer.

```json
{
  "atmosphere": { "variant": "storm", "intensity": "high" },
  "environment": { "variant": "night", "intensity": "high" },
  "psychology": { "variant": "tension", "intensity": "medium" },
  "action": { "variant": "impact", "intensity": "high" }
}
```

| Field | Type | Behavior | Description |
|-------|------|----------|-------------|
| `atmosphere` | `{ variant, intensity }` or `null` | **Sticky + auto-decay.** Persists until changed. Fades naturally from initial intensity down to off. | Weather and physical sensory overlays (rain, fog, storm...) |
| `environment` | `{ variant, intensity }` or `null` | **Sticky, no decay.** Persists until explicitly changed or cleared. | Color grading — hour-of-day, place, lighting condition |
| `psychology` | `{ variant, intensity }` or `null` | **Sticky + auto-decay.** Same decay as atmosphere. | Emotional / mental state overlays (danger, tension, calm...) |
| `action` | `{ variant, intensity }` | **One-shot.** Fires once and auto-removes. No `null` needed. | Single dramatic beat (impact, flash, shake). Omit when no beat. |

### Intensity

All four categories use the same scale:

| Value | Meaning |
|-------|---------|
| `"low"` | Subtle, hint, background presence |
| `"medium"` | Clear, noticeable, standard weight |
| `"high"` | Dominant, overwhelming, maximum impact |

Default when omitted: `"medium"`.

### Sticky behavior — what the client does

The client maintains ambient state across story steps. The AI only needs to specify what **changes**:

```json
// Step 1: set the scene
{ "environment": { "variant": "night", "intensity": "high" },
  "atmosphere": { "variant": "rain", "intensity": "low" } }

// Step 2: rain intensifies — environment stays, only atmosphere changes
{ "atmosphere": { "variant": "rain", "intensity": "high" } }

// Step 3: rain stops, tension rises — clear atmosphere, add psychology
{ "atmosphere": null,
  "psychology": { "variant": "tension", "intensity": "medium" } }

// Step 4: just text, everything persists as-is
{}
```

### Auto-decay — what happens after each step

- **Atmosphere** and **Psychology** start at the given intensity and smoothly fade to off over time. Heavy rain gradually becomes light rain, then clears. This is automatic — the AI doesn't manage it.
- **Environment** never auto-decays. Night stays night until the AI changes it.
- **Action** fires once and disappears. No persistence.

If the AI sets `"high"` rain at a dramatic beat, the reader experiences intense rain that naturally subsides. For sustained weather, the client can disable decay — but the AI doesn't control this.

### Visual transitions

Every persistent layer (Atmosphere, Psychology, Environment) has a smooth transition envelope — the AI doesn't think about this, but it's worth knowing:

- **Mount:** layers rise from invisible up to the requested intensity over a per-variant `riseMs` (snappy for `rain` / `storm` / `danger`; slower for `fog` / `underwater` / `awe`). No pop-in.
- **Clear (`null`):** layers fade out over ~1s and then unmount. No jump-cut.
- **Crossfade:** when a category is replaced (e.g. `rain` → `snow`), the old layer fades while the new one rises. The transitions overlap smoothly.

Action one-shots have their own self-contained animations (impact ring, flash pulse, etc.) — no rise / fade envelope.

---

## Environment — Color Grading (9 variants)

Sticky baseline color grades. Set the HOUR and PLACE of a scene. No decay. Use exactly one Environment variant per scene. Think of it as the LUT or camera white-balance, not the weather.

### `dawn` — Time of Day

**Motion:** Cool blue sky above, warm peach on the horizon, slow sunrise bloom.
**Emotion:** Hope, new beginnings, fragile optimism after a long night.

**Use when:**
- A scene begins at or near sunrise
- A long darkness ends — the survivors see first light
- A journey starts at the edge of morning
- Emotional recovery after grief or defeat

**Do not use when:**
- The scene is fully daylit — use `overcast` or no environment
- The mood is warm but sunset — use `dusk` instead
- The scene is indoor and unlit by the sky

### `dusk` — Time of Day

**Motion:** Deep orange bleeding vertically into violet. Still, held breath.
**Emotion:** Endings, nostalgia, the last warmth of day.

**Use when:**
- Sunset scenes — the light is dying
- A final conversation before a hard night
- Looking back on a long day or a long life
- Romantic or elegiac moments outdoors

**Do not use when:**
- The scene is a new beginning — use `dawn` instead
- The mood is cold or hopeless — use `night` instead
- Heavy weather dominates the sky — use `overcast` or `storm`

### `night` — Time of Day

**Motion:** Even cool deep-blue wash across the viewport.
**Emotion:** Quiet, cold, the neutral baseline of darkness.

**Use when:**
- Generic nighttime — outdoor or indoor in the dark
- A character walks alone under stars
- Stealth or infiltration scenes with cool moonlight
- Calm night dialogue — no immediate danger

**Do not use when:**
- The darkness is menacing — use `underground` or `sickly`
- The scene is lit by fire — use `candlelit`
- The scene is neon-lit urban — use `neon`
- A storm dominates — let `storm` and `overcast` carry it

### `overcast` — Time of Day

**Motion:** Flat grey-blue desaturated wash with a slight green undertone.
**Emotion:** Mundane dread, drained hope, the day refuses to care.

**Use when:**
- An overcast sky without committing to rain
- Bleak daytime exteriors — cemeteries, battlefields, ruins
- Emotional numbness, depression, post-trauma
- A world where color itself has been leached out

**Do not use when:**
- Actual precipitation is falling — use `rain` or `storm` atmosphere
- The scene needs warmth or hope — use `dawn`
- The greyness should feel sickening — use `sickly`

### `candlelit` — Lighting Condition

**Motion:** Warm golden radial spotlight, strong edge falloff to near-black.
**Emotion:** Intimacy, safety in a small circle of light, secrets.

**Use when:**
- An interior lit only by fire — candles, torches, hearth
- A quiet confession or prayer in a dark room
- A ritual chamber, shrine, or confessional
- Medieval interiors, gothic libraries, underground sanctuaries

**Do not use when:**
- The light source is modern or electric — use `night` or `neon`
- The scene is outdoor — use `dawn`, `dusk`, or `night`
- The warmth should feel sickly — use `sickly` instead

### `neon` — Lighting Condition

**Motion:** Cyan and magenta cast bleeding across the scene.
**Emotion:** Urban night, synthetic glow, cyberpunk unreality.

**Use when:**
- A city street lit by signs and billboards
- Inside a club, arcade, or neon-drenched corridor
- A near-future or cyberpunk scene at night
- Reflective wet streets after rain in a city

**Do not use when:**
- The scene is rural or wilderness — use `night`
- The technology is warm/organic — use `candlelit`
- The color should feel corrupted — use `toxic` or `sickly`

### `sickly` — Hazard / Contamination

**Motion:** Green-yellow radial glow with vignette darkening at edges.
**Emotion:** Wrongness. Something about this place is unwell.

**Use when:**
- A plague zone, a contaminated hospital, a cursed village
- Fever delirium — the world itself looks diseased
- An environment poisoning its inhabitants slowly
- Abandoned medical facilities, alchemical labs

**Do not use when:**
- The chemical danger is acute and saturated — use `toxic`
- The wrongness is psychological, not visual — use `haze` or `tension`
- The environment is neutral or healthy

### `toxic` — Hazard / Contamination

**Motion:** Saturated irradiated green, evenly distributed chemical cast.
**Emotion:** Active hazard. This place will kill you if you stay.

**Use when:**
- Radioactive zones, chemical spills, nuclear fallout
- Alien swamps, acid rain, poison gas rooms
- A reactor core leaking, a lab containment failing
- Biohazard interiors, quarantine zones

**Do not use when:**
- The environment is merely unsettling — use `sickly`
- The green should feel natural — use no environment
- The threat is supernatural rather than chemical — use `underground` or `night`

### `underground` — Hazard / Contamination

**Motion:** Dark cool-grey radial darkness with heavy edge vignette.
**Emotion:** Enclosed, far from the sun, pressure of earth above.

**Use when:**
- Caves, tunnels, catacombs, sewers
- Deep mines, buried vaults, dungeons
- Submarine interiors, bunker depths
- Scenes that need claustrophobic darkness without warmth

**Do not use when:**
- The space is warmly lit — use `candlelit`
- The darkness is sky-based night — use `night`
- The enclosure should feel diseased — use `sickly`

---

## Atmosphere — Weather & Sensory (10 variants)

Persistent weather and physical sensory layers. Auto-decays heavy → medium → light → off unless `durationMs` is set to 0. Sits BEHIND the UI content. Pair with an Environment when the sky/light should also be colored.

### `rain` — Precipitation

**Motion:** Vertical particle field of water drops across three parallax depth bands.
**Emotion:** Melancholy, washing away, quiet sorrow.

**Use when:**
- Ordinary rainfall — from drizzle (light) to downpour (heavy)
- Noir scenes, detective stories, night city streets
- Emotional release — a character finally breaks in the rain
- Cleansing or grief moments after violence

**Do not use when:**
- Lightning and wind are part of the scene — use `storm`
- The precipitation is snow or ash — use those instead
- The air should feel dry and hot — use `heat` or `wind`

### `snow` — Precipitation

**Motion:** Soft radial flakes with gentle sway and slow rotation.
**Emotion:** Quiet, cold, suspended time, fragile beauty.

**Use when:**
- Winter scenes — forests, mountains, frozen cities
- A hushed moment where the world goes still
- Christmas, memorial, or wake scenes
- Arctic or polar environments

**Do not use when:**
- The flakes should feel ominous or dead — use `ash`
- A blizzard requires wind and density — stack `storm` + `snow` carefully
- The cold is felt internally — use `freeze` (kinetic) or `tremble` (kinetic)

### `ash` — Precipitation

**Motion:** Torn-paper flakes tumbling downward, ~10% glowing embers mixed in.
**Emotion:** Aftermath. Something has burned and this is what remains.

**Use when:**
- A world after a fire — scorched cities, volcanic eruptions
- Post-apocalyptic scenes, nuclear winter
- Near a funeral pyre or crematorium
- A battlefield where the burning has only just stopped

**Do not use when:**
- The fire is still active and hot — pair `heat` instead
- The precipitation is cold — use `snow`
- The scene is clean or hopeful

### `storm` — Precipitation

**Motion:** Dense rain particles + irregular lightning flashes + horizontal wind drift.
**Emotion:** Overwhelming weather drama. The sky itself is hostile.

**Use when:**
- A full thunderstorm — the peak of bad weather
- Chaos beats where the environment joins the conflict
- A critical climax that needs the sky to feel it too
- Sea voyages in peril, open-field battles in heavy weather

**Do not use when:**
- Only rain is falling without drama — use `rain`
- Only wind is present — use `wind`
- The scene is indoor or sheltered from the sky

### `wind` — Air / Particles

**Motion:** Horizontal streaks of dust, leaves, or grit. No precipitation.
**Emotion:** Dry tension, exposure, something approaching.

**Use when:**
- Deserts, plains, wasteland exteriors
- The stillness before a fight — wind rising through the grass
- A dust storm or sandstorm building
- Rising supernatural pressure on a calm day

**Do not use when:**
- Rain or snow is also falling — use `storm` or combine carefully
- The scene is indoor and shielded
- The movement should feel underwater or dreamlike — use `underwater` or kinetic `drift`

### `fog` — Air / Particles

**Motion:** Volumetric turbulence — vertical gradient plus two turbulence-masked fog banks.
**Emotion:** Mystery, loss of bearings, something hidden nearby.

**Use when:**
- Misty forests, moors, graveyards, coastal cliffs
- Horror scenes where the threat is unseen
- A liminal transition — the character has crossed into somewhere else
- Dream logic, memory fragments, unreliable perception

**Do not use when:**
- Visibility must remain clear for the scene to read
- The obscurity is mental rather than environmental — use `haze`
- The moisture is actively falling — use `rain`

### `spores` — Air / Particles

**Motion:** Drifting organic particulate — slow, uneven, asymmetric descent with occasional rising motes.
**Emotion:** Alien fertility. The air itself is alive and propagating.

**Use when:**
- Alien or fungal forests — mushroom canopies, bioluminescent growth
- Infected zones where a biological contaminant floats free
- Pollen-thick meadows at the edge of wrongness
- Dormant sporing organisms disturbed by a character's passage

**Do not use when:**
- The particulate is burned material — use `ash`
- The scene is sterile or technological — use `toxic` for chemical, `fog` for obscurity
- The particles read as magical rather than biological — use kinetic `sparkle` or `glow`

### `fireflies` — Air / Particles

**Motion:** Warm pinpoint glows drifting slowly on soft vertical curves, flickering in and out.
**Emotion:** Enchantment. The night is not empty — it is populated by small, friendly lights.

**Use when:**
- Summer-night meadows, enchanted forests, riverbanks at dusk
- A peaceful moment of wonder — childhood memory, fairytale arrival
- Magical residue floating after a spell or ritual has resolved
- A sanctuary scene where danger has receded

**Do not use when:**
- The scene is threatening or chaotic — fireflies read as safe
- The lights should feel industrial or synthetic — use `neon` environment
- The motes are cosmic / stellar — use kinetic `sparkle` on the text

### `underwater` — Environmental Distortion

**Motion:** Soft SVG displacement refraction with cool tint and drifting caustics.
**Emotion:** Submerged, weightless, cut off from air and sound.

**Use when:**
- Literal underwater scenes — diving, drowning, submarines
- Dreams of drowning or floating
- Amniotic or womb-like metaphors
- A near-death moment where the world feels submerged

**Do not use when:**
- The scene is above water — even if wet, use `rain`/`storm`
- The floating feeling is dreamy but not wet — use `fog` or `haze`
- The distortion is a glitch or warp — use action `glitch` or kinetic `warp`

### `heat` — Environmental Distortion

**Motion:** Real SVG displacement melt above a warm wash.
**Emotion:** Oppressive heat warping the world, delirium.

**Use when:**
- Desert exteriors under the sun
- Near a bonfire, forge, volcanic vent, or engine core
- A fever dream where temperature distorts everything
- Walking across burning sand or metal

**Do not use when:**
- The scene is cold — use `snow` or kinetic `freeze`
- The distortion is psychological — use `dizzy` or `haze`
- The fire has already passed — use `ash`

---

## Psychology — Emotional State (12 variants)

Persistent edge-framed emotional states. Auto-decays heavy → medium → light → off unless `durationMs` is 0. Rendered as vignettes/blooms at the screen edge — they color MOOD without obscuring the scene center. Use sparingly — most scenes should have NO psychology layer.

### `danger` — Threat / Alarm

**Motion:** Crimson vignette pulsing on a heartbeat rhythm from the edges inward.
**Emotion:** Active threat. Survival pressure.

**Use when:**
- A predator is stalking, a boss is near, combat is imminent
- Low-health or critical-state moments
- A trap is about to trigger and the player knows it
- The red alert of a failing system

**Do not use when:**
- The threat is abstract or social — use `tension`
- The failure has already happened — use `fail`
- The mood is dread without immediate danger — use `melancholy`

### `tension` — Threat / Alarm

**Motion:** Staccato micro-tremors with a slowly constricting vignette.
**Emotion:** Pressure building under the skin. Something must give.

**Use when:**
- A negotiation about to break
- Sneaking through a patrol route
- The silence before an ambush
- A character withholding a truth that is starting to crack

**Do not use when:**
- The threat is physical and immediate — use `danger`
- The pressure is spatial/vertigo — use `dizzy`
- The tension is internal focus rather than fear — use `focus`

### `fail` — Threat / Alarm

**Motion:** Red edge flash with a sharp attack and a quick decay.
**Emotion:** Rejection. It didn't work. The cost is now.

**Use when:**
- A failed action, a wrong answer, a denied access
- A critical miss or counter
- Death of a companion, loss of a key item
- A decision resolves against the character

**Do not use when:**
- The danger is ongoing — use `danger`
- The failure is absorbed into grief — use `melancholy`
- The failure is a specific hit — use action `impact`

### `dizzy` — Disorientation

**Motion:** Two off-center dark lobes moving in slow counter-orbits.
**Emotion:** The world is pivoting around you. Equilibrium is lost.

**Use when:**
- A blow to the head — concussion, daze
- Drunk, drugged, or poisoned perception
- Vertigo on a high ledge or during a fall
- Waking disoriented after unconsciousness

**Do not use when:**
- The distortion is heat-based — use atmosphere `heat`
- The disorientation is digital corruption — use action `glitch`
- The character is perfectly lucid

### `haze` — Disorientation

**Motion:** Multi-bloom drift with wide hue rotation across the frame.
**Emotion:** Dreamlike, drugged, layered reality, softened edges of the real.

**Use when:**
- Psychedelic or hallucinogenic sequences
- A dream, a vision, a drugged trance
- Romantic or ecstatic overwhelm
- Memory softening into reverie

**Do not use when:**
- The fog is environmental — use atmosphere `fog`
- The disorientation is physical — use `dizzy`
- The mood should be threatening — use `danger` or `tension`

### `filmGrain` — Disorientation

**Motion:** Heavy sepia wash with irregular frame-drop flickers.
**Emotion:** This is a memory, a recording, or a story told from the wrong side of time.

**Use when:**
- Flashbacks and memory sequences
- Old-film stylization — noir, period pieces
- Found-footage or archival segments
- An unreliable narrator recounting events

**Do not use when:**
- The flicker is a dying light — use atmosphere `fog` or environment `underground`
- The scene is present-tense and grounded
- The corruption is digital, not analog — use action `glitch`

### `focus` — Focus

**Motion:** A living tunnel vision that slowly breathes and tightens toward center.
**Emotion:** Locked in. The world outside the target has stopped mattering.

**Use when:**
- Aiming, lining up a critical action, the final shot
- A character entering a flow state under pressure
- Meditation or skill mastery moments
- Hacker concentration, sniper patience, surgeon precision

**Do not use when:**
- The narrowing is threatening — use `danger` or `tension`
- The character is unfocused or confused — use `dizzy` or `haze`
- The stillness is grief rather than concentration — use `melancholy`

### `calm` — Positive

**Motion:** Cool vignette with a slow breathing pulse.
**Emotion:** Relief. Safety after danger. The pulse slowing down.

**Use when:**
- Returning to a safe zone after combat
- A healing or resting scene
- Emotional reconciliation between characters
- The quiet moment after a long exertion

**Do not use when:**
- The calm is pushed into stillness — use `serenity`
- The mood is achievement, not recovery — use `success`
- There is still danger in the scene

### `serenity` — Positive

**Motion:** Pale outer glow with near-imperceptible drift.
**Emotion:** Stillness as a state of being. Peace as an ending.

**Use when:**
- Deep meditation, final acceptance, spiritual arrival
- A death that is welcome and chosen
- The true ending of a long journey
- Moments of transcendence or enlightenment

**Do not use when:**
- The calm is earned relief, not transcendence — use `calm`
- The scene is warm with achievement — use `success`
- The mood is bittersweet — use `melancholy`

### `success` — Positive

**Motion:** Warm green vignette with a single outward bloom from center.
**Emotion:** Earned victory. A threshold crossed. Confirmation.

**Use when:**
- A quest completed, a lock opened, a trial passed
- A successful cast, hack, or critical action
- Level-up, ability unlock, promotion moments
- The moment a plan visibly works

**Do not use when:**
- The victory is peaceful rather than triumphant — use `calm`
- The success is a single mechanical hit — use action `impact` or `flash`
- The moment is transcendent — use `awe`

### `awe` — Positive

**Motion:** Pale gold/white radial brightening emerging from center.
**Emotion:** Wonder at something vast. Revelation. The sublime.

**Use when:**
- First sight of a cathedral, a god, a cosmic vista
- Witnessing a miracle or impossible event
- A revelation that reframes the entire story
- Standing before something whose scale breaks the frame

**Do not use when:**
- The wonder is earned victory — use `success`
- The brightness is a one-shot flash — use action `flash`
- The mood is peaceful rather than overwhelming — use `serenity`

### `melancholy` — Grief

**Motion:** Desaturated cool vignette with a slow downward drift.
**Emotion:** Grief held without breaking. The weight of loss carried forward.

**Use when:**
- After a death or permanent loss
- A character remembering what they can no longer have
- Bittersweet endings where something is gained only by losing
- Long walks after failure, rain-soaked goodbyes

**Do not use when:**
- The grief is active and sharp — use `fail`
- The mood is hopeful recovery — use `calm`
- The weight is physical, not emotional — use `danger` or `tension`

---

## Action — One-Shot Beats (8 variants)

Transient one-shot beats. Fire once, auto-unmount. Use for DISCRETE moments — a single impact, flash, or cut. Never stack two Action beats at the same instant. Never use Action to sustain mood — that's what Psychology is for.

### `impact` — Physical Impact

**Motion:** Radial shockwave ring expanding outward from center.
**Emotion:** A hit landed. Weight transferred. Something just happened.

**Use when:**
- A heavy punch, landing, collision, or explosion nearby
- A critical hit in combat
- A door being breached or a wall coming down
- A boss entering the arena

**Do not use when:**
- The impact is prolonged shaking — use `shake`
- The moment is visual white-out — use `flash`
- The event is digital/corruption — use `glitch`

### `shake` — Physical Impact

**Motion:** Damped translate random walk on the layer root.
**Emotion:** The whole world shook. Not a hit — a tremor.

**Use when:**
- A nearby explosion rattles the environment
- A large creature steps near the camera
- Earthquake or ground tremor in the scene
- A building taking structural damage

**Do not use when:**
- The hit is a single focused strike — use `impact`
- The shaking is internal (fear, cold) — use kinetic `tremble`
- The ground motion is continuous — use kinetic `sway`

### `zoomBurst` — Physical Impact

**Motion:** Brief radial scale with outward motion blur from center.
**Emotion:** Sudden narrative focus. The camera punches in.

**Use when:**
- A dramatic reveal of a key object or character
- The moment a decision is made — the camera snaps into it
- A boss spawn or signature entrance
- A realization beat where attention collapses to one point

**Do not use when:**
- The moment is motion, not punch — use `speed`
- The attention expands outward — use `reveal`
- The scene is a hit — use `impact`

### `flash` — Visual Flash

**Motion:** Full-screen bright pulse, quick rise and decay.
**Emotion:** A single white event. Lightning, revelation, camera shutter.

**Use when:**
- Lightning strike within the scene
- A spell detonating or a flash grenade
- A sudden memory or revelation breaking through
- Teleportation arrival/departure

**Do not use when:**
- The brightness should feel sacred/slow — use psychology `awe`
- The event is a physical hit — use `impact`
- The flash is the START of a scene reveal — use `reveal`

### `reveal` — Visual Flash

**Motion:** Radial expand wipe from center outward.
**Emotion:** The curtain rises. Attention moves from nothing to something.

**Use when:**
- Scene opening, chapter start, cutscene beginning
- Unveiling a new location or character
- A scan or detection pulse finding its target
- A map or menu opening into the world

**Do not use when:**
- The scene is already visible — use no action
- The reveal is a single bright frame — use `flash`
- The entry is a character attack — use `impact`

### `dissolve` — Transition

**Motion:** Soft fade to transparent across a gentle blur.
**Emotion:** The scene releases its hold. Exit by erasure rather than cut.

**Use when:**
- Scene ending, chapter close, fade-to-black equivalent
- A memory dissolving, a dream ending
- Death transitions handled gently
- Fast-forward or time-skip exits

**Do not use when:**
- The scene exits with a hit — use `impact`
- The scene should cut hard — use `flash`
- Consciousness is fading during gameplay — use kinetic `fade`

### `speed` — Transition

**Motion:** Three-layer horizontal motion-blur streaks at different speeds and blur depths.
**Emotion:** Acceleration. Wind being knocked out of the frame.

**Use when:**
- A dash, sprint, launch, or sudden acceleration
- Entering a chase sequence
- A fast-travel cut or scene transition by movement
- A vehicle taking off

**Do not use when:**
- The motion should distort rather than streak — use `zoomBurst`
- The scene is continuous drift — use no action
- The acceleration is dimensional — use kinetic `warp`

### `glitch` — Digital

**Motion:** RGB chromatic aberration applied briefly to the underlying content.
**Emotion:** Reality glitched. The signal broke and reknit.

**Use when:**
- A simulation hiccup, hack attack, or corrupted memory moment
- A reality tear, dimensional stutter, timeline edit
- An AI character breaking its mask
- A vision interrupted by interference

**Do not use when:**
- The corruption is sustained — use kinetic `static` instead
- The disruption is physical — use `impact` or `shake`
- The effect is meant to be beautiful — use `flash` or `awe`

---

## Scene Recipes

Complete ambient configurations for common story scenarios. Copy-paste ready for system prompt examples.

### Horror — Something in the dark
```json
{
  "environment": { "variant": "night", "intensity": "high" },
  "atmosphere": { "variant": "fog", "intensity": "medium" },
  "psychology": { "variant": "danger", "intensity": "low" }
}
```

### Horror — Jump scare beat
```json
{
  "psychology": { "variant": "tension", "intensity": "high" },
  "action": { "variant": "shake", "intensity": "high" }
}
```

### Storm climax
```json
{
  "environment": { "variant": "night", "intensity": "high" },
  "atmosphere": { "variant": "storm", "intensity": "high" },
  "psychology": { "variant": "tension", "intensity": "high" },
  "action": { "variant": "flash", "intensity": "high" }
}
```

### Peaceful forest night
```json
{
  "environment": { "variant": "night", "intensity": "low" },
  "atmosphere": { "variant": "fireflies", "intensity": "medium" },
  "psychology": { "variant": "serenity", "intensity": "low" }
}
```

### Underwater descent
```json
{
  "environment": { "variant": "night", "intensity": "medium" },
  "atmosphere": { "variant": "underwater", "intensity": "high" },
  "psychology": { "variant": "focus", "intensity": "medium" }
}
```

### Post-apocalypse wasteland
```json
{
  "environment": { "variant": "overcast", "intensity": "high" },
  "atmosphere": { "variant": "ash", "intensity": "high" },
  "psychology": { "variant": "melancholy", "intensity": "medium" }
}
```

### Cyberpunk street
```json
{
  "environment": { "variant": "neon", "intensity": "high" },
  "atmosphere": { "variant": "rain", "intensity": "low" },
  "psychology": null
}
```

### Desert heat
```json
{
  "environment": { "variant": "dusk", "intensity": "medium" },
  "atmosphere": { "variant": "heat", "intensity": "high" },
  "psychology": null
}
```

### Alien forest
```json
{
  "environment": { "variant": "sickly", "intensity": "medium" },
  "atmosphere": { "variant": "spores", "intensity": "medium" },
  "psychology": { "variant": "haze", "intensity": "low" }
}
```

### Cave exploration
```json
{
  "environment": { "variant": "underground", "intensity": "high" },
  "atmosphere": { "variant": "fog", "intensity": "low" },
  "psychology": { "variant": "focus", "intensity": "low" }
}
```

### Candlelit ritual
```json
{
  "environment": { "variant": "candlelit", "intensity": "high" },
  "psychology": { "variant": "awe", "intensity": "medium" }
}
```

### Victory / Achievement
```json
{
  "environment": { "variant": "dawn", "intensity": "medium" },
  "psychology": { "variant": "success", "intensity": "high" },
  "action": { "variant": "reveal", "intensity": "medium" }
}
```

### Character death
```json
{
  "atmosphere": { "variant": "rain", "intensity": "low" },
  "psychology": { "variant": "melancholy", "intensity": "high" },
  "action": { "variant": "dissolve", "intensity": "high" }
}
```

### Chase / Action sequence
```json
{
  "atmosphere": { "variant": "wind", "intensity": "high" },
  "psychology": { "variant": "focus", "intensity": "high" },
  "action": { "variant": "speed", "intensity": "high" }
}
```

### Waking up confused
```json
{
  "environment": { "variant": "overcast", "intensity": "low" },
  "psychology": { "variant": "dizzy", "intensity": "medium" }
}
```

### Flashback / Memory
```json
{
  "psychology": { "variant": "filmGrain", "intensity": "medium" }
}
```

---

## Usage Rules

1. **Most scenes need at most one or two layers.** Ambient is seasoning, not the meal. An Environment tint plus one Psychology beat is usually enough. Stacking all four categories in every scene creates noise.

2. **One variant per category at a time.** Never run two Atmosphere variants (rain + snow) or two Psychology variants (danger + tension) simultaneously — pick the one that best serves the moment.

3. **Categories have distinct jobs:**
   - **Environment** = hour of day and place. Sticky, rare to change within a scene.
   - **Atmosphere** = weather and physical sensory. Persistent but decays.
   - **Psychology** = mood framing at the edges. Persistent but decays.
   - **Action** = single discrete beats. One-shot only.

4. **Do not use Action for mood.** If you want sustained trembling, use kinetic text `tremble` or psychology `tension`. If you want sustained corruption, use kinetic text `static`. Action beats are punctuation — one strike, then gone.

5. **Match intensity to narrative weight.** A minor hit uses `action.impact` at `low`. A boss entry uses `action.impact` at `high` plus `psychology.danger` at `high`. Do not default everything to `medium`.

6. **Contrast creates impact.** A long calm scene broken by one `action.flash` hits harder than chained beats. Let silence and steady state make the effects meaningful.

7. **Ambient vs Kinetic — who owns what:**
   - **Kinetic Text** owns the letters themselves — `tremble`, `pulse`, `glitch`, `drift` belong to the text.
   - **Ambient Layers** own the framing around the letters — `danger`, `storm`, `impact` belong to the world.
   - If both layers could carry the feeling, prefer the one closer to the cause (world event → ambient, character interiority → kinetic).

8. **Never use ambient for:** normal dialogue without weight, routine scene transitions, comedy/lighthearted moments (reads as melodrama), or UI-only moments where the world is not in play.

---

## Combination Rules

1. **One layer per category.** The system renders one atmosphere, one psychology, one environment, and optionally one action at a time. Setting a new variant in the same category replaces the previous one.

2. **Action is always one-shot.** Don't send action on every step — reserve it for genuine dramatic moments (roughly 1 in 4–5 steps).

3. **Environment sets the baseline, atmosphere adds drama.** `"night"` is the color; `"storm"` is the weather on top of it. They compose naturally.

4. **Don't stack similar vibes.** `"overcast"` environment + `"fog"` atmosphere is fine (grey sky + ground fog). But `"night"` + `"underground"` is redundant — pick one.

5. **Psychology should match the character's state, not the weather.** Rain doesn't require `"melancholy"`. A character can feel `"calm"` in a storm or `"danger"` on a sunny day.

6. **Intensity escalation = narrative arc.** Start a scene at `"low"`, build to `"high"` at the climax, then let auto-decay handle the comedown. Don't jump straight to `"high"` every step.

7. **Empty object `{}` is valid.** Not every step needs ambient changes. Let the previous state persist and the auto-decay do its work.

8. **Clear with `null`.** When the narrative shifts (exit the cave into daylight), explicitly clear layers: `"environment": null` to remove the `"underground"` tint.

---

## Decay Behavior

Atmosphere and Psychology layers **auto-decay** through the intensity ladder:
`heavy → medium → light → off`, one step per `durationMs` milliseconds. The default `durationMs` is per-variant (see `src/core/effects/params.ts` inside this package).

- To have a layer **decay quickly** (punctuating beats), use the default or a short `durationMs`.
- To have a layer **stick around** until the next scene, set `durationMs={0}` — decay is disabled and the layer stays at its initial intensity.
- Environment layers **never decay** — they persist until the prop changes.
- Action layers **never decay** — they play once for their full duration and auto-unmount.

The director AI only needs to set the variant, intensity, and optionally a `durationMs` override. The runtime handles the rest.

---

## Valid Values — Quick Reference

### atmosphere (10)
`"rain"` `"snow"` `"ash"` `"storm"` `"wind"` `"fog"` `"spores"` `"fireflies"` `"underwater"` `"heat"`

### psychology (12)
`"danger"` `"tension"` `"dizzy"` `"focus"` `"filmGrain"` `"haze"` `"calm"` `"serenity"` `"success"` `"fail"` `"awe"` `"melancholy"`

### action (8)
`"impact"` `"speed"` `"glitch"` `"flash"` `"reveal"` `"dissolve"` `"shake"` `"zoomBurst"`

### environment (9)
`"dawn"` `"dusk"` `"candlelit"` `"night"` `"neon"` `"overcast"` `"sickly"` `"toxic"` `"underground"`

### intensity (3)
`"low"` `"medium"` `"high"`
