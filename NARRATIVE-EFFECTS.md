# Narrative Effects — AI Reference

Structured reference for the AI that generates CoNexus story steps. Each entry describes exactly when to assign a given `narrativeEffect` value to a step. Embed this document (or the JSON array below) as system-level context for the story generation model.

## Schema

Each story step may include a `narrativeEffect` field. The value is one of the 18 effect names below, or `null` (no effect). The field is optional — omitting it is equivalent to `null`.

```ts
interface StoryStep {
  text: string;
  narrativeEffect?: NarrativeEffect | null;
}

type NarrativeEffect =
  | 'shake' | 'quake' | 'jolt' | 'glitch'       // one-shot
  | 'surge' | 'warp'                              // one-shot
  | 'drift' | 'flicker' | 'breathe' | 'tremble'  // continuous
  | 'pulse' | 'whisper'                           // continuous
  | 'fade' | 'freeze' | 'burn' | 'static'         // continuous
  | 'distort' | 'sway';                            // continuous
```

---

## Effect Reference

```jsonc
[
  // ═══════════════════════════════════════════════════════════
  // ONE-SHOT EFFECTS
  // Fire once after kinetic reveal finishes. Use for punctuation
  // moments — a single impact, shock, or disruption that marks
  // the text and then subsides. Never combine two one-shots on
  // the same step. Do NOT use for sustained mood — use continuous.
  // ═══════════════════════════════════════════════════════════

  {
    "effect": "shake",
    "category": "one-shot",
    "intensity": "medium",
    "duration": "500ms",
    "motion": "Rapid horizontal jitter, decaying to rest.",
    "emotion": "Sudden physical impact — forceful but contained.",
    "use_when": [
      "A door slams, a fist hits a table, a vehicle collides",
      "An explosion at medium range (close but survivable)",
      "A heavy object falls or crashes nearby",
      "The ground receives a single hard strike"
    ],
    "do_not_use_when": [
      "The impact is massive or prolonged — use quake instead",
      "The shock is psychological, not physical — use jolt instead",
      "The scene is digital/technological — use glitch instead"
    ]
  },

  {
    "effect": "quake",
    "category": "one-shot",
    "intensity": "heavy",
    "duration": "800ms",
    "motion": "Violent two-axis displacement with a long, rolling settle.",
    "emotion": "Overwhelming destructive force. The world itself is breaking.",
    "use_when": [
      "A building collapses, a bridge gives way, the ground splits",
      "A detonation at close range shakes everything",
      "Thunder cracks directly overhead",
      "A massive creature impacts the ground",
      "Structural failure — ceiling caving, floor buckling"
    ],
    "do_not_use_when": [
      "The impact is small or localized — use shake instead",
      "The moment is a surprise rather than raw force — use jolt"
    ]
  },

  {
    "effect": "jolt",
    "category": "one-shot",
    "intensity": "sharp",
    "duration": "300ms",
    "motion": "Single violent displacement with an elastic snap-back.",
    "emotion": "A spike of alarm — adrenaline before the brain catches up.",
    "use_when": [
      "A jump scare — something appears without warning",
      "A character is grabbed, stabbed, or struck suddenly",
      "A sudden realization hits (betrayal revealed, trap sprung)",
      "An electric shock, a gunshot, a whip crack",
      "Waking from a nightmare with a start"
    ],
    "do_not_use_when": [
      "The force is sustained or environmental — use shake/quake",
      "The disruption is digital or reality-breaking — use glitch"
    ]
  },

  {
    "effect": "glitch",
    "category": "one-shot",
    "intensity": "medium",
    "duration": "600ms",
    "motion": "Choppy skewed displacement with stepped timing. Digital instability.",
    "emotion": "Reality is corrupted. Something is wrong with the signal itself.",
    "use_when": [
      "A simulation or virtual environment malfunctions",
      "A memory is being altered, erased, or rewritten",
      "A character hacks into a system or is being hacked",
      "Signal interference, transmission failure, static",
      "Reality fractures — dimensional tears, time skips",
      "An AI or digital entity malfunctions or breaks character"
    ],
    "do_not_use_when": [
      "The disruption is physical (impact, explosion) — use shake/quake",
      "The moment is purely emotional shock — use jolt"
    ]
  },

  {
    "effect": "surge",
    "category": "one-shot",
    "intensity": "pronounced",
    "duration": "500ms",
    "motion": "Ascending scale with brightness overshoot, then settle.",
    "emotion": "Power awakening. Something has been unleashed or realized.",
    "use_when": [
      "A spell or magical ability activates, erupts, or detonates",
      "A character transforms, evolves, or ascends",
      "Divine intervention — a god responds, a blessing manifests",
      "A sudden epiphany or breakthrough — clarity hits like a wave",
      "An artifact or power source activates for the first time"
    ],
    "do_not_use_when": [
      "The force is destructive or violent — use quake/shake",
      "The moment is digital corruption — use glitch",
      "The power is sustained rather than a single moment — use pulse (continuous)"
    ]
  },

  {
    "effect": "warp",
    "category": "one-shot",
    "intensity": "medium",
    "duration": "600ms",
    "motion": "Horizontal scaleX oscillation with subtle skew. Spatial distortion.",
    "emotion": "Space itself is bending. The rules of geometry are briefly wrong.",
    "use_when": [
      "Teleportation — a character is moved instantaneously",
      "Portal entry or exit — crossing dimensional boundaries",
      "A time warp, time skip, or temporal anomaly",
      "Gravity fails or inverts briefly",
      "Space folds, compresses, or stretches around a character"
    ],
    "do_not_use_when": [
      "The distortion is digital/data — use glitch",
      "The spatial effect is sustained — use drift (continuous)",
      "The moment is a physical impact — use jolt or shake"
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // CONTINUOUS EFFECTS
  // Loop from the moment the step starts (during kinetic reveal)
  // until the step ends. Use for sustained atmosphere — the
  // emotional weather of the scene. One continuous effect per
  // step. Most steps should have NO effect (null) — reserve
  // these for moments that genuinely need physical reinforcement.
  // ═══════════════════════════════════════════════════════════

  {
    "effect": "drift",
    "category": "continuous",
    "intensity": "gentle",
    "cycle": "3s",
    "motion": "Slow vertical sine wave. The text floats as if weightless.",
    "emotion": "Detachment, serenity, otherworldliness. Time has slowed.",
    "use_when": [
      "Underwater scenes — swimming, sinking, submerged environments",
      "Dreaming, astral projection, out-of-body experience",
      "Zero gravity, floating through space, weightless travel",
      "A calm, meditative moment after intense action",
      "Scenes in fog, mist, or clouds where grounding is lost"
    ],
    "do_not_use_when": [
      "The scene is tense or urgent — drift is too calm",
      "The character is grounded and alert",
      "There is danger present — use breathe or pulse instead"
    ]
  },

  {
    "effect": "flicker",
    "category": "continuous",
    "intensity": "medium",
    "cycle": "2s",
    "motion": "Irregular opacity drops with hard cuts between states.",
    "emotion": "Instability. The environment itself cannot be trusted.",
    "use_when": [
      "Failing lights — emergency strips, dying torches, broken neon",
      "Unstable power in a facility, ship, or machine",
      "A haunted or cursed location where presence is intermittent",
      "A fading transmission, a dying broadcast, a weak signal",
      "Something is phasing in and out of existence"
    ],
    "do_not_use_when": [
      "The instability is digital/data corruption — use glitch (one-shot)",
      "The scene is calm or emotionally warm",
      "The character is in a stable, well-lit environment"
    ]
  },

  {
    "effect": "breathe",
    "category": "continuous",
    "intensity": "subtle",
    "cycle": "4s",
    "motion": "Slow rhythmic scale pulse. The text gently expands and contracts.",
    "emotion": "Focused tension, mindful awareness, emotional weight held steady.",
    "use_when": [
      "Suspenseful moments — waiting for a verdict, hiding from danger",
      "A character centering themselves before a critical action",
      "Emotional weight — grief, love, awe — held without breaking",
      "Meditation, prayer, ritual concentration",
      "Long quiet scenes where stillness itself is the atmosphere"
    ],
    "do_not_use_when": [
      "The tension is sharp and rhythmic — use pulse instead",
      "The scene is chaotic or unstable — breathe is too controlled",
      "The character is in physical distress — use tremble"
    ]
  },

  {
    "effect": "tremble",
    "category": "continuous",
    "intensity": "restrained",
    "cycle": "100ms",
    "motion": "Fast micro-vibration. Continuous but deliberately small.",
    "emotion": "Vulnerability at the edge of breaking. Exposed nerves.",
    "use_when": [
      "A character is freezing, shivering, hypothermic",
      "Fear that is felt in the body — trembling hands, shaky voice",
      "Fragility — holding something delicate, walking a narrow ledge",
      "Suppressed emotion about to overflow (rage, grief, panic)",
      "Physical exhaustion where muscles can barely hold"
    ],
    "do_not_use_when": [
      "The shaking is from external force — use shake/quake (one-shot)",
      "The scene is calm or confident",
      "The vibration would read as mechanical — use pulse"
    ]
  },

  {
    "effect": "pulse",
    "category": "continuous",
    "intensity": "pronounced",
    "cycle": "1s",
    "motion": "Heartbeat-tempo scale with a sharp attack. Rhythmic and insistent.",
    "emotion": "Countdown pressure. Something is building toward a threshold.",
    "use_when": [
      "A heartbeat becomes audible — fear, exertion, proximity to danger",
      "Ritual energy building — a spell charging, a seal activating",
      "A countdown or timer running — bomb, launch, deadline",
      "Approaching something powerful — an artifact, an entity, a core",
      "The moment before a transformation or irreversible action"
    ],
    "do_not_use_when": [
      "The rhythm is organic and calm — use breathe instead",
      "The character is at rest or in a safe environment",
      "The tension is fragile rather than forceful — use whisper"
    ]
  },

  {
    "effect": "whisper",
    "category": "continuous",
    "intensity": "delicate",
    "cycle": "3s",
    "motion": "Opacity and scale recede together. The text feels barely there.",
    "emotion": "Fragile presence. The voice could vanish at any moment.",
    "use_when": [
      "A ghost, spirit, or echo is speaking",
      "A memory is being recalled — distant, fading, half-real",
      "Telepathy, psychic communication, inner voice",
      "A secret is being shared in near-silence",
      "A dying character's last words",
      "Text from a dream that is already dissolving on waking"
    ],
    "do_not_use_when": [
      "The voice is confident or commanding",
      "The instability is environmental — use flicker instead",
      "The fragility is physical (shaking body) — use tremble"
    ]
  },

  {
    "effect": "fade",
    "category": "continuous",
    "intensity": "heavy",
    "cycle": "5s",
    "motion": "Gradual opacity drift to half visibility and back. Pure opacity, no position or scale.",
    "emotion": "Slipping away. The world is receding or consciousness is failing.",
    "use_when": [
      "A character is losing consciousness — injury, poison, exhaustion",
      "Drugged or sedated — perception dissolving involuntarily",
      "A time skip — the present moment is fading into the next",
      "A memory dissolving on inspection — trying to hold a dream",
      "Falling asleep — the scene grows distant as awareness leaves"
    ],
    "do_not_use_when": [
      "The fading is supernatural or ghostly — use whisper instead",
      "The instability is environmental (lights) — use flicker instead",
      "The character is alert but the voice is fragile — use whisper"
    ]
  },

  {
    "effect": "freeze",
    "category": "continuous",
    "intensity": "subtle",
    "cycle": "5s",
    "motion": "Very slight scale contraction and brightness reduction. Almost imperceptible.",
    "emotion": "Complete stillness. Time or body or will has stopped.",
    "use_when": [
      "Ice magic encasing, spreading, or locking a character in place",
      "Paralysis — magical, chemical, or fear-induced",
      "Time freeze — the world pauses around a character",
      "Petrification — turning to stone, crystal, or ice",
      "Stasis — suspended animation, cryo sleep, magical preservation"
    ],
    "do_not_use_when": [
      "The cold is felt as shivering — use tremble instead",
      "The stillness is meditative or chosen — use breathe instead",
      "The scene involves any kind of movement or action"
    ]
  },

  {
    "effect": "burn",
    "category": "continuous",
    "intensity": "medium",
    "cycle": "1.5s",
    "motion": "Vertical micro-wobble with slight skew oscillation. Faster rhythm than drift.",
    "emotion": "Heat is distorting perception. The air itself is unstable.",
    "use_when": [
      "A fire scene — burning buildings, campfires with supernatural heat",
      "Desert heat — sun-baked landscapes, mirages, heat stroke",
      "Rage — internal heat manifesting as physical distortion",
      "Fever — a character burning up, delirious with temperature",
      "Volcanic or magmatic environments — lava, geothermal vents"
    ],
    "do_not_use_when": [
      "The scene is cold — use freeze or tremble instead",
      "The distortion is digital — use glitch (one-shot) or static",
      "The wobble would read as floating — use drift for underwater/dreams"
    ]
  },

  {
    "effect": "static",
    "category": "continuous",
    "intensity": "pronounced",
    "cycle": "200ms",
    "motion": "Rapid micro-jitter combined with overlapping opacity flicker drops.",
    "emotion": "The signal is breaking. Something is fighting through interference.",
    "use_when": [
      "Radio or comms transmission — receiving a damaged broadcast",
      "Broken communications — a voice cutting in and out",
      "Digital interference — data corruption on a persistent channel",
      "A corrupted data stream — text rendered through a bad connection",
      "Psychic noise — telepathic contact through a hostile medium"
    ],
    "do_not_use_when": [
      "The corruption is a single momentary event — use glitch (one-shot)",
      "The opacity instability is environmental (lights) — use flicker",
      "The vibration is physical/bodily — use tremble"
    ]
  },

  {
    "effect": "distort",
    "category": "continuous",
    "intensity": "medium",
    "cycle": "3.5s",
    "motion": "Subtle rotation oscillation with asymmetric scaleX/scaleY breathing. The text looks slightly wrong.",
    "emotion": "Perception is unreliable. The character is conscious but reality is warped.",
    "use_when": [
      "A character is drunk or intoxicated — the world tilts and sways",
      "Poisoned — perception warping involuntarily, things look wrong",
      "Hallucinating — seeing things that shift and bend",
      "Vertigo or disorientation — after a fall, a blow to the head, spinning",
      "Under psychic influence — mind being manipulated, thoughts distorted",
      "Concussion or head trauma — the room won't hold still"
    ],
    "do_not_use_when": [
      "The character is losing consciousness — use fade instead",
      "The distortion is heat-related — use burn instead",
      "The spatial warping is a one-time event (teleport) — use warp (one-shot)",
      "The instability is environmental, not perceptual — use flicker or tremble"
    ]
  },

  {
    "effect": "sway",
    "category": "continuous",
    "intensity": "medium",
    "cycle": "2.5s",
    "motion": "Horizontal translateX sine wave. The text rocks side to side like a ship in heavy seas.",
    "emotion": "The ground cannot be trusted. Balance is a constant negotiation.",
    "use_when": [
      "A character is on a ship, boat, or raft in rough water",
      "An earthquake or tremor — the ground itself is moving laterally",
      "Walking across a rope bridge, narrow beam, or unstable surface",
      "Inside a vehicle that is rocking or swaying — train, bus, aircraft in turbulence",
      "Storm winds pushing a character or environment sideways",
      "Aftermath of a blast — the character is on their feet but the world won't hold still"
    ],
    "do_not_use_when": [
      "The motion is vertical (floating, sinking) — use drift instead",
      "The instability is perceptual/internal (drunk, poisoned) — use distort instead",
      "The shaking is from a single impact — use shake or quake (one-shot)",
      "The character is trembling from fear or cold — use tremble instead"
    ]
  }
]
```

---

## Usage Rules

1. **Most steps should have no effect (`null`).** Effects are seasoning, not the meal. A story where every step shakes or drifts becomes noise. Reserve effects for moments that genuinely benefit from physical reinforcement.

2. **One effect per step.** Never assign both a one-shot and a continuous effect to the same step. Pick the one that best serves the moment.

3. **One-shot = punctuation. Continuous = atmosphere.** If the moment is a single event (a crash, a scare), use a one-shot. If the moment is a sustained state (drifting, trembling, tension), use continuous.

4. **Match intensity to narrative weight.** A casual conversation does not need `breathe`. A world-ending explosion does not need `shake` — it needs `quake`.

5. **Contrast creates impact.** Three steps of `null` followed by one `jolt` hits harder than `jolt` → `shake` → `quake` → `glitch` in sequence. Let silence make the effects meaningful.

6. **Never use effects for:** dialogue in normal conditions, scene transitions or establishing shots, internal monologue (unless the thoughts themselves are unstable — then `whisper` or `glitch` may apply), or comedy/lighthearted moments (effects read as dramatic).

---

## Timing Behavior

The two categories behave differently during kinetic text reveal:

- **Continuous effects** start **immediately** when the step begins. They are ambient atmosphere — the text drifts or flickers as it streams in, setting the mood from the first word.

- **One-shot effects** wait for kinetic reveal to **finish**. They are punctuation — a jolt only makes sense once the full sentence is visible.

The client handles this automatically via `isOneShotEffect()`. The AI only needs to set the `narrativeEffect` field — the rendering engine handles the rest.
