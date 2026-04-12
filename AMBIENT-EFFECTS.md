# Ambient Effects — AI Reference

Structured reference for the AI that directs ambient overlay layers in CoNexus scenes. Each entry describes exactly when to activate a given ambient variant within its layer category. Embed this document (or the JSON array below) as system-level context for the scene director model.

## Schema

A scene may activate any combination of layers — at most one variant per category at a time. Categories compose freely: Environment + Atmosphere + Psychology can all be on together, with Action firing one-shot beats over the top.

```ts
interface AmbientScene {
  environment?: EnvironmentVariant | null;   // sticky baseline color grade
  atmosphere?:  AtmosphereVariant  | null;   // persistent weather / sensory
  psychology?:  PsychologyVariant  | null;   // persistent emotional framing
  action?:      ActionVariant      | null;   // transient one-shot beat
  intensity?:   'low' | 'medium' | 'high';
}

type EnvironmentVariant =
  | 'dawn' | 'dusk' | 'candlelit' | 'night' | 'neon'
  | 'overcast' | 'sickly' | 'toxic' | 'underground';

type AtmosphereVariant =
  | 'rain' | 'snow' | 'ash' | 'storm' | 'wind'
  | 'fog' | 'underwater' | 'heat';

type PsychologyVariant =
  | 'danger' | 'tension' | 'dizzy' | 'focus'
  | 'filmGrain' | 'haze'
  | 'calm' | 'serenity' | 'success' | 'fail'
  | 'awe' | 'melancholy';

type ActionVariant =
  | 'impact' | 'speed' | 'glitch' | 'flash'
  | 'reveal' | 'dissolve' | 'shake' | 'zoomBurst';
```

---

## Effect Reference

```jsonc
[
  // ═══════════════════════════════════════════════════════════
  // ENVIRONMENT — Sticky baseline color grades.
  // Sets the HOUR and PLACE of a scene. No decay. No animation.
  // Use exactly one Environment variant per scene. Think of it
  // as the LUT or camera white-balance, not the weather.
  // ═══════════════════════════════════════════════════════════

  {
    "effect": "dawn",
    "category": "environment",
    "motion": "Cool blue sky above, warm peach on the horizon, slow sunrise bloom.",
    "emotion": "Hope, new beginnings, fragile optimism after a long night.",
    "use_when": [
      "A scene begins at or near sunrise",
      "A long darkness ends — the survivors see first light",
      "A journey starts at the edge of morning",
      "Emotional recovery after grief or defeat"
    ],
    "do_not_use_when": [
      "The scene is fully daylit — use overcast or no environment",
      "The mood is warm but sunset — use dusk instead",
      "The scene is indoor and unlit by the sky"
    ]
  },

  {
    "effect": "dusk",
    "category": "environment",
    "motion": "Deep orange bleeding vertically into violet. Still, held breath.",
    "emotion": "Endings, nostalgia, the last warmth of day.",
    "use_when": [
      "Sunset scenes — the light is dying",
      "A final conversation before a hard night",
      "Looking back on a long day or a long life",
      "Romantic or elegiac moments outdoors"
    ],
    "do_not_use_when": [
      "The scene is a new beginning — use dawn instead",
      "The mood is cold or hopeless — use night instead",
      "Heavy weather dominates the sky — use overcast or storm"
    ]
  },

  {
    "effect": "candlelit",
    "category": "environment",
    "motion": "Warm golden radial spotlight, strong edge falloff to near-black.",
    "emotion": "Intimacy, safety in a small circle of light, secrets.",
    "use_when": [
      "An interior lit only by fire — candles, torches, hearth",
      "A quiet confession or prayer in a dark room",
      "A ritual chamber, shrine, or confessional",
      "Medieval interiors, gothic libraries, underground sanctuaries"
    ],
    "do_not_use_when": [
      "The light source is modern or electric — use night or neon",
      "The scene is outdoor — use dawn, dusk, or night",
      "The warmth should feel sickly — use sickly instead"
    ]
  },

  {
    "effect": "night",
    "category": "environment",
    "motion": "Even cool deep-blue wash across the viewport.",
    "emotion": "Quiet, cold, the neutral baseline of darkness.",
    "use_when": [
      "Generic nighttime — outdoor or indoor in the dark",
      "A character walks alone under stars",
      "Stealth or infiltration scenes with cool moonlight",
      "Calm night dialogue — no immediate danger"
    ],
    "do_not_use_when": [
      "The darkness is menacing — use underground or sickly",
      "The scene is lit by fire — use candlelit",
      "The scene is neon-lit urban — use neon",
      "A storm dominates — let storm and overcast carry it"
    ]
  },

  {
    "effect": "neon",
    "category": "environment",
    "motion": "Cyan and magenta cast bleeding across the scene.",
    "emotion": "Urban night, synthetic glow, cyberpunk unreality.",
    "use_when": [
      "A city street lit by signs and billboards",
      "Inside a club, arcade, or neon-drenched corridor",
      "A near-future or cyberpunk scene at night",
      "Reflective wet streets after rain in a city"
    ],
    "do_not_use_when": [
      "The scene is rural or wilderness — use night",
      "The technology is warm/organic — use candlelit",
      "The color should feel corrupted — use toxic or sickly"
    ]
  },

  {
    "effect": "overcast",
    "category": "environment",
    "motion": "Flat grey-blue desaturated wash with a slight green undertone.",
    "emotion": "Mundane dread, drained hope, the day refuses to care.",
    "use_when": [
      "An overcast sky without committing to rain",
      "Bleak daytime exteriors — cemeteries, battlefields, ruins",
      "Emotional numbness, depression, post-trauma",
      "A world where color itself has been leached out"
    ],
    "do_not_use_when": [
      "Actual precipitation is falling — use rain or storm atmosphere",
      "The scene needs warmth or hope — use dawn",
      "The greyness should feel sickening — use sickly"
    ]
  },

  {
    "effect": "sickly",
    "category": "environment",
    "motion": "Green-yellow radial glow with vignette darkening at edges.",
    "emotion": "Wrongness. Something about this place is unwell.",
    "use_when": [
      "A plague zone, a contaminated hospital, a cursed village",
      "Fever delirium — the world itself looks diseased",
      "An environment poisoning its inhabitants slowly",
      "Abandoned medical facilities, alchemical labs"
    ],
    "do_not_use_when": [
      "The chemical danger is acute and saturated — use toxic",
      "The wrongness is psychological, not visual — use haze or tension",
      "The environment is neutral or healthy"
    ]
  },

  {
    "effect": "toxic",
    "category": "environment",
    "motion": "Saturated irradiated green, evenly distributed chemical cast.",
    "emotion": "Active hazard. This place will kill you if you stay.",
    "use_when": [
      "Radioactive zones, chemical spills, nuclear fallout",
      "Alien swamps, acid rain, poison gas rooms",
      "A reactor core leaking, a lab containment failing",
      "Biohazard interiors, quarantine zones"
    ],
    "do_not_use_when": [
      "The environment is merely unsettling — use sickly",
      "The green should feel natural — use no environment",
      "The threat is supernatural rather than chemical — use underground or night"
    ]
  },

  {
    "effect": "underground",
    "category": "environment",
    "motion": "Dark cool-grey radial darkness with heavy edge vignette.",
    "emotion": "Enclosed, far from the sun, pressure of earth above.",
    "use_when": [
      "Caves, tunnels, catacombs, sewers",
      "Deep mines, buried vaults, dungeons",
      "Submarine interiors, bunker depths",
      "Scenes that need claustrophobic darkness without warmth"
    ],
    "do_not_use_when": [
      "The space is warmly lit — use candlelit",
      "The darkness is sky-based night — use night",
      "The enclosure should feel diseased — use sickly"
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // ATMOSPHERE — Persistent weather and physical sensory layers.
  // Auto-decays heavy → medium → light → off unless durationMs
  // is set to 0. Sits BEHIND the UI content. Pair with an
  // Environment when the sky/light should also be colored.
  // ═══════════════════════════════════════════════════════════

  {
    "effect": "rain",
    "category": "atmosphere",
    "motion": "Vertical particle field of water drops across three parallax depth bands.",
    "emotion": "Melancholy, washing away, quiet sorrow.",
    "use_when": [
      "Ordinary rainfall — from drizzle (light) to downpour (heavy)",
      "Noir scenes, detective stories, night city streets",
      "Emotional release — a character finally breaks in the rain",
      "Cleansing or grief moments after violence"
    ],
    "do_not_use_when": [
      "Lightning and wind are part of the scene — use storm",
      "The precipitation is snow or ash — use those instead",
      "The air should feel dry and hot — use heat or wind"
    ]
  },

  {
    "effect": "snow",
    "category": "atmosphere",
    "motion": "Soft radial flakes with gentle sway and slow rotation.",
    "emotion": "Quiet, cold, suspended time, fragile beauty.",
    "use_when": [
      "Winter scenes — forests, mountains, frozen cities",
      "A hushed moment where the world goes still",
      "Christmas, memorial, or wake scenes",
      "Arctic or polar environments"
    ],
    "do_not_use_when": [
      "The flakes should feel ominous or dead — use ash",
      "A blizzard requires wind and density — stack storm + snow carefully",
      "The cold is felt internally — use freeze (psychology) or tremble (kinetic)"
    ]
  },

  {
    "effect": "ash",
    "category": "atmosphere",
    "motion": "Torn-paper flakes tumbling downward, ~10% glowing embers mixed in.",
    "emotion": "Aftermath. Something has burned and this is what remains.",
    "use_when": [
      "A world after a fire — scorched cities, volcanic eruptions",
      "Post-apocalyptic scenes, nuclear winter",
      "Near a funeral pyre or crematorium",
      "A battlefield where the burning has only just stopped"
    ],
    "do_not_use_when": [
      "The fire is still active and hot — pair heat instead",
      "The precipitation is cold — use snow",
      "The scene is clean or hopeful"
    ]
  },

  {
    "effect": "storm",
    "category": "atmosphere",
    "motion": "Dense rain particles + irregular lightning flashes + horizontal wind drift.",
    "emotion": "Overwhelming weather drama. The sky itself is hostile.",
    "use_when": [
      "A full thunderstorm — the peak of bad weather",
      "Chaos beats where the environment joins the conflict",
      "A critical climax that needs the sky to feel it too",
      "Sea voyages in peril, open-field battles in heavy weather"
    ],
    "do_not_use_when": [
      "Only rain is falling without drama — use rain",
      "Only wind is present — use wind",
      "The scene is indoor or sheltered from the sky"
    ]
  },

  {
    "effect": "wind",
    "category": "atmosphere",
    "motion": "Horizontal streaks of dust, leaves, or grit. No precipitation.",
    "emotion": "Dry tension, exposure, something approaching.",
    "use_when": [
      "Deserts, plains, wasteland exteriors",
      "The stillness before a fight — wind rising through the grass",
      "A dust storm or sandstorm building",
      "Rising supernatural pressure on a calm day"
    ],
    "do_not_use_when": [
      "Rain or snow is also falling — use storm or combine with rain/snow",
      "The scene is indoor and shielded",
      "The movement should feel underwater or dreamlike — use drift/underwater"
    ]
  },

  {
    "effect": "fog",
    "category": "atmosphere",
    "motion": "Volumetric turbulence — vertical gradient plus two turbulence-masked fog banks.",
    "emotion": "Mystery, loss of bearings, something hidden nearby.",
    "use_when": [
      "Misty forests, moors, graveyards, coastal cliffs",
      "Horror scenes where the threat is unseen",
      "A liminal transition — the character has crossed into somewhere else",
      "Dream logic, memory fragments, unreliable perception"
    ],
    "do_not_use_when": [
      "Visibility must remain clear for the scene to read",
      "The obscurity is mental rather than environmental — use haze",
      "The moisture is actively falling — use rain"
    ]
  },

  {
    "effect": "underwater",
    "category": "atmosphere",
    "motion": "Soft SVG displacement refraction with cool tint and drifting caustics.",
    "emotion": "Submerged, weightless, cut off from air and sound.",
    "use_when": [
      "Literal underwater scenes — diving, drowning, submarines",
      "Dreams of drowning or floating",
      "Amniotic or womb-like metaphors",
      "A near-death moment where the world feels submerged"
    ],
    "do_not_use_when": [
      "The scene is above water — even if wet, use rain/storm",
      "The floating feeling is dreamy but not wet — use fog or haze",
      "The distortion is a glitch or warp — use action.glitch or kinetic warp"
    ]
  },

  {
    "effect": "heat",
    "category": "atmosphere",
    "motion": "Real SVG displacement melt above a warm wash.",
    "emotion": "Oppressive heat warping the world, delirium.",
    "use_when": [
      "Desert exteriors under the sun",
      "Near a bonfire, forge, volcanic vent, or engine core",
      "A fever dream where temperature distorts everything",
      "Walking across burning sand or metal"
    ],
    "do_not_use_when": [
      "The scene is cold — use snow or freeze (psychology)",
      "The distortion is psychological — use dizzy or haze",
      "The fire has already passed — use ash"
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // PSYCHOLOGY — Persistent edge-framed emotional states.
  // Auto-decays heavy → medium → light → off unless durationMs
  // is 0. Rendered as vignettes/blooms at the screen edge —
  // they color MOOD without obscuring the scene center.
  // Use sparingly. Most scenes should have NO psychology layer.
  // ═══════════════════════════════════════════════════════════

  {
    "effect": "danger",
    "category": "psychology",
    "motion": "Crimson vignette pulsing on a heartbeat rhythm from the edges inward.",
    "emotion": "Active threat. Survival pressure.",
    "use_when": [
      "A predator is stalking, a boss is near, combat is imminent",
      "Low-health or critical-state moments",
      "A trap is about to trigger and the player knows it",
      "The red alert of a failing system"
    ],
    "do_not_use_when": [
      "The threat is abstract or social — use tension",
      "The failure has already happened — use fail",
      "The mood is dread without immediate danger — use melancholy"
    ]
  },

  {
    "effect": "tension",
    "category": "psychology",
    "motion": "Staccato micro-tremors with a slowly constricting vignette.",
    "emotion": "Pressure building under the skin. Something must give.",
    "use_when": [
      "A negotiation about to break",
      "Sneaking through a patrol route",
      "The silence before an ambush",
      "A character withholding a truth that is starting to crack"
    ],
    "do_not_use_when": [
      "The threat is physical and immediate — use danger",
      "The pressure is spatial/vertigo — use dizzy",
      "The tension is internal focus rather than fear — use focus"
    ]
  },

  {
    "effect": "dizzy",
    "category": "psychology",
    "motion": "Two off-center dark lobes moving in slow counter-orbits.",
    "emotion": "The world is pivoting around you. Equilibrium is lost.",
    "use_when": [
      "A blow to the head — concussion, daze",
      "Drunk, drugged, or poisoned perception",
      "Vertigo on a high ledge or during a fall",
      "Waking disoriented after unconsciousness"
    ],
    "do_not_use_when": [
      "The distortion is heat-based — use atmosphere heat",
      "The disorientation is digital corruption — use action glitch",
      "The character is perfectly lucid"
    ]
  },

  {
    "effect": "focus",
    "category": "psychology",
    "motion": "A living tunnel vision that slowly breathes and tightens toward center.",
    "emotion": "Locked in. The world outside the target has stopped mattering.",
    "use_when": [
      "Aiming, lining up a critical action, the final shot",
      "A character entering a flow state under pressure",
      "Meditation or skill mastery moments",
      "Hacker concentration, sniper patience, surgeon precision"
    ],
    "do_not_use_when": [
      "The narrowing is threatening — use danger or tension",
      "The character is unfocused or confused — use dizzy or haze",
      "The stillness is grief rather than concentration — use melancholy"
    ]
  },

  {
    "effect": "filmGrain",
    "category": "psychology",
    "motion": "Heavy sepia wash with irregular frame-drop flickers.",
    "emotion": "This is a memory, a recording, or a story told from the wrong side of time.",
    "use_when": [
      "Flashbacks and memory sequences",
      "Old-film stylization — noir, period pieces",
      "Found-footage or archival segments",
      "An unreliable narrator recounting events"
    ],
    "do_not_use_when": [
      "The flicker is a dying light — use atmosphere fog or environment underground",
      "The scene is present-tense and grounded",
      "The corruption is digital, not analog — use action glitch"
    ]
  },

  {
    "effect": "haze",
    "category": "psychology",
    "motion": "Multi-bloom drift with wide hue rotation across the frame.",
    "emotion": "Dreamlike, drugged, layered reality, softened edges of the real.",
    "use_when": [
      "Psychedelic or hallucinogenic sequences",
      "A dream, a vision, a drugged trance",
      "Romantic or ecstatic overwhelm",
      "Memory softening into reverie"
    ],
    "do_not_use_when": [
      "The fog is environmental — use atmosphere fog",
      "The disorientation is physical — use dizzy",
      "The mood should be threatening — use danger or tension"
    ]
  },

  {
    "effect": "calm",
    "category": "psychology",
    "motion": "Cool vignette with a slow breathing pulse.",
    "emotion": "Relief. Safety after danger. The pulse slowing down.",
    "use_when": [
      "Returning to a safe zone after combat",
      "A healing or resting scene",
      "Emotional reconciliation between characters",
      "The quiet moment after a long exertion"
    ],
    "do_not_use_when": [
      "The calm is pushed into stillness — use serenity",
      "The mood is achievement, not recovery — use success",
      "There is still danger in the scene"
    ]
  },

  {
    "effect": "serenity",
    "category": "psychology",
    "motion": "Pale outer glow with near-imperceptible drift.",
    "emotion": "Stillness as a state of being. Peace as an ending.",
    "use_when": [
      "Deep meditation, final acceptance, spiritual arrival",
      "A death that is welcome and chosen",
      "The true ending of a long journey",
      "Moments of transcendence or enlightenment"
    ],
    "do_not_use_when": [
      "The calm is earned relief, not transcendence — use calm",
      "The scene is warm with achievement — use success",
      "The mood is bittersweet — use melancholy"
    ]
  },

  {
    "effect": "success",
    "category": "psychology",
    "motion": "Warm green vignette with a single outward bloom from center.",
    "emotion": "Earned victory. A threshold crossed. Confirmation.",
    "use_when": [
      "A quest completed, a lock opened, a trial passed",
      "A successful cast, hack, or critical action",
      "Level-up, ability unlock, promotion moments",
      "The moment a plan visibly works"
    ],
    "do_not_use_when": [
      "The victory is peaceful rather than triumphant — use calm",
      "The success is a single mechanical hit — use action impact or flash",
      "The moment is transcendent — use awe"
    ]
  },

  {
    "effect": "fail",
    "category": "psychology",
    "motion": "Red edge flash with a sharp attack and a quick decay.",
    "emotion": "Rejection. It didn't work. The cost is now.",
    "use_when": [
      "A failed action, a wrong answer, a denied access",
      "A critical miss or counter",
      "Death of a companion, loss of a key item",
      "A decision resolves against the character"
    ],
    "do_not_use_when": [
      "The danger is ongoing — use danger",
      "The failure is absorbed into grief — use melancholy",
      "The failure is a specific hit — use action impact"
    ]
  },

  {
    "effect": "awe",
    "category": "psychology",
    "motion": "Pale gold/white radial brightening emerging from center.",
    "emotion": "Wonder at something vast. Revelation. The sublime.",
    "use_when": [
      "First sight of a cathedral, a god, a cosmic vista",
      "Witnessing a miracle or impossible event",
      "A revelation that reframes the entire story",
      "Standing before something whose scale breaks the frame"
    ],
    "do_not_use_when": [
      "The wonder is earned victory — use success",
      "The brightness is a one-shot flash — use action flash",
      "The mood is peaceful rather than overwhelming — use serenity"
    ]
  },

  {
    "effect": "melancholy",
    "category": "psychology",
    "motion": "Desaturated cool vignette with a slow downward drift.",
    "emotion": "Grief held without breaking. The weight of loss carried forward.",
    "use_when": [
      "After a death or permanent loss",
      "A character remembering what they can no longer have",
      "Bittersweet endings where something is gained only by losing",
      "Long walks after failure, rain-soaked goodbyes"
    ],
    "do_not_use_when": [
      "The grief is active and sharp — use fail",
      "The mood is hopeful recovery — use calm",
      "The weight is physical, not emotional — use danger or tension"
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // ACTION — Transient one-shot beats. Fire once, auto-unmount.
  // Use for DISCRETE moments — a single impact, flash, or cut.
  // Never stack two Action beats at the same instant. Never use
  // Action to sustain mood — that's what Psychology is for.
  // ═══════════════════════════════════════════════════════════

  {
    "effect": "impact",
    "category": "action",
    "motion": "Radial shockwave ring expanding outward from center.",
    "emotion": "A hit landed. Weight transferred. Something just happened.",
    "use_when": [
      "A heavy punch, landing, collision, or explosion nearby",
      "A critical hit in combat",
      "A door being breached or a wall coming down",
      "A boss entering the arena"
    ],
    "do_not_use_when": [
      "The impact is prolonged shaking — use shake",
      "The moment is visual white-out — use flash",
      "The event is digital/corruption — use glitch"
    ]
  },

  {
    "effect": "speed",
    "category": "action",
    "motion": "Three-layer parallax sweep with a radial edge mask.",
    "emotion": "Acceleration. Wind being knocked out of the frame.",
    "use_when": [
      "A dash, sprint, launch, or sudden acceleration",
      "Entering a chase sequence",
      "A fast-travel cut or scene transition by movement",
      "A vehicle taking off"
    ],
    "do_not_use_when": [
      "The motion should distort rather than streak — use zoomBurst",
      "The scene is continuous drift — use no action",
      "The acceleration is dimensional — use kinetic warp"
    ]
  },

  {
    "effect": "glitch",
    "category": "action",
    "motion": "RGB chromatic aberration applied briefly to the underlying content.",
    "emotion": "Reality glitched. The signal broke and reknit.",
    "use_when": [
      "A simulation hiccup, hack attack, or corrupted memory moment",
      "A reality tear, dimensional stutter, timeline edit",
      "An AI character breaking its mask",
      "A vision interrupted by interference"
    ],
    "do_not_use_when": [
      "The corruption is sustained — use kinetic static instead",
      "The disruption is physical — use impact or shake",
      "The effect is meant to be beautiful — use flash or awe"
    ]
  },

  {
    "effect": "flash",
    "category": "action",
    "motion": "Full-screen bright pulse, quick rise and decay.",
    "emotion": "A single white event. Lightning, revelation, camera shutter.",
    "use_when": [
      "Lightning strike within the scene",
      "A spell detonating or a flash grenade",
      "A sudden memory or revelation breaking through",
      "Teleportation arrival/departure"
    ],
    "do_not_use_when": [
      "The brightness should feel sacred/slow — use psychology awe",
      "The event is a physical hit — use impact",
      "The flash is the START of a scene reveal — use reveal"
    ]
  },

  {
    "effect": "reveal",
    "category": "action",
    "motion": "Radial expand wipe from center outward.",
    "emotion": "The curtain rises. Attention moves from nothing to something.",
    "use_when": [
      "Scene opening, chapter start, cutscene beginning",
      "Unveiling a new location or character",
      "A scan or detection pulse finding its target",
      "A map or menu opening into the world"
    ],
    "do_not_use_when": [
      "The scene is already visible — use no action",
      "The reveal is a single bright frame — use flash",
      "The entry is a character attack — use impact"
    ]
  },

  {
    "effect": "dissolve",
    "category": "action",
    "motion": "Soft fade to transparent across a gentle blur.",
    "emotion": "The scene releases its hold. Exit by erasure rather than cut.",
    "use_when": [
      "Scene ending, chapter close, fade-to-black equivalent",
      "A memory dissolving, a dream ending",
      "Death transitions handled gently",
      "Fast-forward or time-skip exits"
    ],
    "do_not_use_when": [
      "The scene exits with a hit — use impact",
      "The scene should cut hard — use flash",
      "Consciousness is fading during gameplay — use kinetic fade"
    ]
  },

  {
    "effect": "shake",
    "category": "action",
    "motion": "Damped translate random walk on the layer root.",
    "emotion": "The whole world shook. Not a hit — a tremor.",
    "use_when": [
      "A nearby explosion rattles the environment",
      "A large creature steps near the camera",
      "Earthquake or ground tremor in the scene",
      "A building taking structural damage"
    ],
    "do_not_use_when": [
      "The hit is a single focused strike — use impact",
      "The shaking is internal (fear, cold) — use kinetic tremble",
      "The ground motion is continuous — use kinetic sway"
    ]
  },

  {
    "effect": "zoomBurst",
    "category": "action",
    "motion": "Brief radial scale with outward motion blur from center.",
    "emotion": "Sudden narrative focus. The camera punches in.",
    "use_when": [
      "A dramatic reveal of a key object or character",
      "The moment a decision is made — the camera snaps into it",
      "A boss spawn or signature entrance",
      "A realization beat where attention collapses to one point"
    ],
    "do_not_use_when": [
      "The moment is motion, not punch — use speed",
      "The attention expands outward — use reveal",
      "The scene is a hit — use impact"
    ]
  }
]
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

5. **Match intensity to narrative weight.** A minor hit uses `action.impact` at `light`. A boss entry uses `action.impact` at `heavy` plus `psychology.danger` at `heavy`. Do not default everything to `medium`.

6. **Contrast creates impact.** A long calm scene broken by one `action.flash` hits harder than chained beats. Let silence and steady state make the effects meaningful.

7. **Ambient vs Kinetic — who owns what:**
   - **Kinetic Text** owns the letters themselves — `tremble`, `pulse`, `glitch`, `drift` belong to the text.
   - **Ambient Layers** own the framing around the letters — `danger`, `storm`, `impact` belong to the world.
   - If both layers could carry the feeling, prefer the one closer to the cause (world event → ambient, character interiority → kinetic).

8. **Never use ambient for:** normal dialogue without weight, routine scene transitions, comedy/lighthearted moments (reads as melodrama), or UI-only moments where the world is not in play.

---

## Decay Behavior

Atmosphere and Psychology layers **auto-decay** through the intensity ladder:
`heavy → medium → light → off`, one step per `durationMs` milliseconds. The default `durationMs` is per-variant (see [`packages/ambient-layers/src/core/effects/params.ts`](packages/ambient-layers/src/core/effects/params.ts)).

- To have a layer **decay quickly** (punctuating beats), use the default or a short `durationMs`.
- To have a layer **stick around** until the next scene, set `durationMs={0}` — decay is disabled and the layer stays at its initial intensity.
- Environment layers **never decay** — they persist until the prop changes.
- Action layers **never decay** — they play once for their full duration and auto-unmount.

The director AI only needs to set the variant, intensity, and optionally a `durationMs` override. The runtime handles the rest.
