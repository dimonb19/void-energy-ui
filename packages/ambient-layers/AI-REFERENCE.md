# Ambient Layers — AI Reference

Reference for AI story-generation pipelines. Describes the JSON contract, effect vocabulary, lifetime behavior, and combination guidance for driving ambient overlays from an AI backend.

---

## Output Schema

The AI returns these fields per story step. All are optional — omitted fields keep their previous value (layers are sticky). Set to `null` to remove a layer.

```json
{
  "atmosphere": { "variant": "storm", "intensity": "heavy" },
  "environment": { "variant": "night", "intensity": "heavy" },
  "psychology": { "variant": "tension", "intensity": "medium" },
  "action": { "variant": "impact", "intensity": "heavy" }
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
| `"light"` | Subtle, hint, background presence |
| `"medium"` | Clear, noticeable, standard weight |
| `"heavy"` | Dominant, overwhelming, maximum impact |

Default when omitted: `"medium"`.

### Sticky behavior — what the client does

The client maintains ambient state across story steps. The AI only needs to specify what **changes**:

```json
// Step 1: set the scene
{ "environment": { "variant": "night", "intensity": "heavy" },
  "atmosphere": { "variant": "rain", "intensity": "light" } }

// Step 2: rain intensifies — environment stays, only atmosphere changes
{ "atmosphere": { "variant": "rain", "intensity": "heavy" } }

// Step 3: rain stops, tension rises — clear atmosphere, add psychology
{ "atmosphere": null,
  "psychology": { "variant": "tension", "intensity": "medium" } }

// Step 4: just text, everything persists as-is
{}
```

### Auto-decay — what happens after each step

- **Atmosphere** and **Psychology** start at the given intensity and smoothly fade to off over time. Heavy rain gradually becomes light rain, then clears. This is automatic — the AI doesn't manage it.
- **Environment** never decays. Night stays night until the AI changes it.
- **Action** fires once and disappears. No persistence.

If the AI sets `"heavy"` rain at a dramatic beat, the reader experiences intense rain that naturally subsides. For sustained weather, the client can disable decay — but the AI doesn't control this.

---

## Atmosphere — Weather & Sensory (10 effects)

Physical overlays the reader "sees through." Auto-decay from the starting intensity.

### Precipitation
| Variant | Feeling | Use When |
|---------|---------|----------|
| `"rain"` | Melancholy, noir, isolation | Outdoor scenes, sadness, cleansing, storm buildup |
| `"snow"` | Cold, quiet, stillness | Winter, desolation, peaceful cold, frozen landscapes |
| `"ash"` | Aftermath, destruction, decay | Post-apocalypse, fire aftermath, volcanic, war zone |
| `"storm"` | Chaos, peak drama, violence | Climactic moments, overwhelming danger, nature's fury. Includes rain + wind + lightning flashes. |

### Air / Particles
| Variant | Feeling | Use When |
|---------|---------|----------|
| `"wind"` | Exposure, tension rising | Desert, plains, hilltop, approaching danger |
| `"fog"` | Mystery, liminal, unknown | Entering unknown territory, dream logic, hiding something |
| `"spores"` | Alien, organic, infected | Alien forest, fungal environment, biological hazard |
| `"fireflies"` | Magic, summer night, wonder | Enchanted forest, peaceful night, childhood memory |

### Environmental Distortion
| Variant | Feeling | Use When |
|---------|---------|----------|
| `"underwater"` | Submerged, dreaming, drowning | Underwater scenes, drowning, deep dream, pressure |
| `"heat"` | Desert, fever, scorching | Extreme heat, fever dream, fire aftermath, exhaustion |

---

## Psychology — Emotional State (12 effects)

Edge-framed vignettes and filter washes that color the reader's perception. Auto-decay from the starting intensity.

### Threat / Alarm
| Variant | Feeling | Use When |
|---------|---------|----------|
| `"danger"` | Threat, alarm, heartbeat | Active threat, monster nearby, life in danger |
| `"tension"` | Pressure, anticipation, dread | Building suspense, waiting for something bad, ticking clock |
| `"fail"` | Rejection, defeat | Failed action, bad outcome, loss |

### Disorientation
| Variant | Feeling | Use When |
|---------|---------|----------|
| `"dizzy"` | Vertigo, confusion | Poisoned, hit on the head, spinning, drugged |
| `"haze"` | Dazed, dreamy fog | Waking up dazed, psychedelic, half-conscious |
| `"filmGrain"` | Memory, vintage, unreliable | Flashback, old recording, unreliable narrator, nostalgia |

### Focus
| Variant | Feeling | Use When |
|---------|---------|----------|
| `"focus"` | Tunnel vision, lock-on | Concentrating hard, targeting, critical moment |

### Positive
| Variant | Feeling | Use When |
|---------|---------|----------|
| `"calm"` | Relief, recovery, safety | Danger passed, finding shelter, catching breath |
| `"serenity"` | Deep peace, stillness | Meditation, acceptance, beautiful landscape, transcendence |
| `"success"` | Achievement, triumph | Goal reached, enemy defeated, puzzle solved |
| `"awe"` | Wonder, revelation, sacred | First sight of something vast, divine encounter, epiphany |

### Grief
| Variant | Feeling | Use When |
|---------|---------|----------|
| `"melancholy"` | Sadness, loss, grief | Character death, farewell, remembering the lost |

---

## Action — One-Shot Beats (8 effects)

Single dramatic beats that fire once and disappear. Use sparingly — not every step needs one.

### Physical Impact
| Variant | Feeling | Use When |
|---------|---------|----------|
| `"impact"` | Shockwave, collision | Punch, explosion radius, landing hard, sonic boom |
| `"shake"` | Earthquake, tremor | Ground shaking, heavy footsteps, rumbling |
| `"zoomBurst"` | Punch-in, focus strike | Sudden appearance, boss spawn, dramatic zoom |

### Visual Flash
| Variant | Feeling | Use When |
|---------|---------|----------|
| `"flash"` | Lightning, revelation | Lightning strike, camera flash, blinding light, sudden clarity |
| `"reveal"` | Unveiling, scan | Scene entry, revealing hidden thing, radar sweep |

### Transition
| Variant | Feeling | Use When |
|---------|---------|----------|
| `"dissolve"` | Fade out, memory | Scene transition, memory fading, passing out |
| `"speed"` | Rush, acceleration | Dash, launch, time acceleration, warp speed |

### Digital
| Variant | Feeling | Use When |
|---------|---------|----------|
| `"glitch"` | Corruption, break | Reality glitch, simulation error, system failure |

---

## Environment — Color Grading (9 effects)

Baseline color temperature and lighting. Sticky — no decay, persists until changed. Sets the "when and where" without committing to weather.

### Time of Day
| Variant | Feeling | Use When |
|---------|---------|----------|
| `"dawn"` | New beginning, hope | Sunrise, first light, aftermath of long night |
| `"dusk"` | Ending, transition | Sunset, day ending, golden hour, bittersweet |
| `"night"` | Darkness, hidden, danger | Nighttime, stealth, nocturnal, unknown |
| `"overcast"` | Bleak, mundane, grey | Ordinary gloom, depression, institutional, boring day |

### Lighting Condition
| Variant | Feeling | Use When |
|---------|---------|----------|
| `"candlelit"` | Intimate, warm, old | Candlelit room, fireplace, medieval interior, ritual |
| `"neon"` | Cyberpunk, artificial, nightlife | Neon-lit streets, clubs, futuristic urban, tech noir |

### Hazard / Contamination
| Variant | Feeling | Use When |
|---------|---------|----------|
| `"sickly"` | Illness, decay, corruption | Disease, cursed place, dying environment |
| `"toxic"` | Chemical, irradiated | Nuclear zone, chemical spill, alien atmosphere |
| `"underground"` | Buried, claustrophobic | Caves, dungeons, tunnels, bunkers, no natural light |

---

## Scene Recipes

Complete ambient configurations for common story scenarios. Copy-paste ready for system prompt examples.

### Horror — Something in the dark
```json
{
  "environment": { "variant": "night", "intensity": "heavy" },
  "atmosphere": { "variant": "fog", "intensity": "medium" },
  "psychology": { "variant": "danger", "intensity": "light" }
}
```

### Horror — Jump scare beat
```json
{
  "psychology": { "variant": "tension", "intensity": "heavy" },
  "action": { "variant": "shake", "intensity": "heavy" }
}
```

### Storm climax
```json
{
  "environment": { "variant": "night", "intensity": "heavy" },
  "atmosphere": { "variant": "storm", "intensity": "heavy" },
  "psychology": { "variant": "tension", "intensity": "heavy" },
  "action": { "variant": "flash", "intensity": "heavy" }
}
```

### Peaceful forest night
```json
{
  "environment": { "variant": "night", "intensity": "light" },
  "atmosphere": { "variant": "fireflies", "intensity": "medium" },
  "psychology": { "variant": "serenity", "intensity": "light" }
}
```

### Underwater descent
```json
{
  "environment": { "variant": "night", "intensity": "medium" },
  "atmosphere": { "variant": "underwater", "intensity": "heavy" },
  "psychology": { "variant": "focus", "intensity": "medium" }
}
```

### Post-apocalypse wasteland
```json
{
  "environment": { "variant": "overcast", "intensity": "heavy" },
  "atmosphere": { "variant": "ash", "intensity": "heavy" },
  "psychology": { "variant": "melancholy", "intensity": "medium" }
}
```

### Cyberpunk street
```json
{
  "environment": { "variant": "neon", "intensity": "heavy" },
  "atmosphere": { "variant": "rain", "intensity": "light" },
  "psychology": null
}
```

### Desert heat
```json
{
  "environment": { "variant": "dusk", "intensity": "medium" },
  "atmosphere": { "variant": "heat", "intensity": "heavy" },
  "psychology": null
}
```

### Alien forest
```json
{
  "environment": { "variant": "sickly", "intensity": "medium" },
  "atmosphere": { "variant": "spores", "intensity": "medium" },
  "psychology": { "variant": "haze", "intensity": "light" }
}
```

### Cave exploration
```json
{
  "environment": { "variant": "underground", "intensity": "heavy" },
  "atmosphere": { "variant": "fog", "intensity": "light" },
  "psychology": { "variant": "focus", "intensity": "light" }
}
```

### Candlelit ritual
```json
{
  "environment": { "variant": "candlelit", "intensity": "heavy" },
  "psychology": { "variant": "awe", "intensity": "medium" }
}
```

### Victory / Achievement
```json
{
  "environment": { "variant": "dawn", "intensity": "medium" },
  "psychology": { "variant": "success", "intensity": "heavy" },
  "action": { "variant": "reveal", "intensity": "medium" }
}
```

### Character death
```json
{
  "atmosphere": { "variant": "rain", "intensity": "light" },
  "psychology": { "variant": "melancholy", "intensity": "heavy" },
  "action": { "variant": "dissolve", "intensity": "heavy" }
}
```

### Chase / Action sequence
```json
{
  "atmosphere": { "variant": "wind", "intensity": "heavy" },
  "psychology": { "variant": "focus", "intensity": "heavy" },
  "action": { "variant": "speed", "intensity": "heavy" }
}
```

### Waking up confused
```json
{
  "environment": { "variant": "overcast", "intensity": "light" },
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

## Combination Rules

1. **One layer per category.** The system renders one atmosphere, one psychology, one environment, and optionally one action at a time. Setting a new variant in the same category replaces the previous one.

2. **Action is always one-shot.** Don't send action on every step — reserve it for genuine dramatic moments (roughly 1 in 4–5 steps).

3. **Environment sets the baseline, atmosphere adds drama.** `"night"` is the color; `"storm"` is the weather on top of it. They compose naturally.

4. **Don't stack similar vibes.** `"overcast"` environment + `"fog"` atmosphere is fine (grey sky + ground fog). But `"night"` + `"underground"` is redundant — pick one.

5. **Psychology should match the character's state, not the weather.** Rain doesn't require `"melancholy"`. A character can feel `"calm"` in a storm or `"danger"` on a sunny day.

6. **Intensity escalation = narrative arc.** Start a scene at `"light"`, build to `"heavy"` at the climax, then let auto-decay handle the comedown. Don't jump straight to `"heavy"` every step.

7. **Empty object `{}` is valid.** Not every step needs ambient changes. Let the previous state persist and the auto-decay do its work.

8. **Clear with `null`.** When the narrative shifts (exit the cave into daylight), explicitly clear layers: `"environment": null` to remove the `"underground"` tint.

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
`"light"` `"medium"` `"heavy"`
