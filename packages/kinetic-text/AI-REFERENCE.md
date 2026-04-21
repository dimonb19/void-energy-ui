# Kinetic Text — AI Reference

Reference for AI story-generation pipelines. Describes the JSON contract, effect vocabulary, and combination guidance for driving KineticText from an AI backend.

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

## Continuous Effects — Sustained Mood

These loop indefinitely on the text, creating atmosphere. Only one can be active at a time. Grouped by emotional family for prompt engineering.

### Fear / Tension
| Effect | Feeling | Use When |
|--------|---------|----------|
| `"tremble"` | Cold, fear, fragility | Character is afraid, cold, or in danger |
| `"flicker"` | Unstable, failing | Lights going out, power loss, haunted space |
| `"static"` | Corrupted, noisy | Digital interference, radio noise, reality glitch |
| `"burn"` | Rage, heat, fire | Fire scenes, anger, fever, desert heat |
| `"vibrate"` | Mechanical, charged | Machinery, engines, electrical surge, building pressure |

### Unease / Disorientation
| Effect | Feeling | Use When |
|--------|---------|----------|
| `"distort"` | Drunk, hallucinating | Poison, vertigo, hallucination, unreliable perception |
| `"sway"` | Unstable footing | Ship travel, earthquake aftermath, drunkenness |
| `"wobble"` | Jelly, instability | Ground shifting, transformation, melting reality |
| `"stretch"` | Body horror, distortion | Physical mutation, nightmare, spatial warping |
| `"drip"` | Melting, dissolving | Rain on glass, cave dripping, melting, decay |

### Mystery / Supernatural
| Effect | Feeling | Use When |
|--------|---------|----------|
| `"haunt"` | Ghostly, liminal | Ghosts, afterimages, between-worlds, spirit contact |
| `"whisper"` | Fading, secret | Ghosts speaking, fading memory, dying words |
| `"fade"` | Losing consciousness | Passing out, time skip, death, losing grip |
| `"sparkle"` | Magic, starlight | Enchantment, treasure, divine presence, wish |
| `"glow"` | Enchantment, bioluminescence | Magic aura, glowing artifact, forest spirits |

### Wonder / Calm
| Effect | Feeling | Use When |
|--------|---------|----------|
| `"breathe"` | Suspense, emotional weight | Quiet before storm, awe, holding breath |
| `"drift"` | Weightless, dreaming | Underwater, floating, dreaming, zero gravity |
| `"float"` | Levitation, zero-G | Space, levitation, ascension, out-of-body |
| `"wave"` | Ocean, rhythm | Sea travel, crowd motion, musical moments |
| `"pulse"` | Heartbeat, ritual | Countdown, ritual energy, approaching climax |

### Neutral / Atmospheric
| Effect | Feeling | Use When |
|--------|---------|----------|
| `"freeze"` | Ice, paralysis, stasis | Frozen in place, ice magic, time stop |

---

## One-Shot Effects — Dramatic Punctuation

These fire once when the text finishes revealing. Use them to punctuate key narrative beats — a door slamming, an explosion, a revelation.

### Impact / Force
| Effect | Feeling | Use When |
|--------|---------|----------|
| `"shake"` | Collision, slam | Door slam, punch, impact, sudden noise |
| `"quake"` | Earthquake, heavy impact | Explosion, structural collapse, ground breaking |
| `"slam"` | Crushing weight | Boss landing, heavy object falling, overwhelming force |
| `"jolt"` | Jump scare, shock | Sudden fright, electric shock, startling discovery |
| `"bounce"` | Landing, playful | Soft landing, playful energy, cartoonish impact |

### Destruction / Chaos
| Effect | Feeling | Use When |
|--------|---------|----------|
| `"explode"` | Detonation, blast | Bomb, catastrophic failure, rage outburst |
| `"shatter"` | Breaking, fracture | Glass breaking, shield failure, trust broken |
| `"collapse"` | Demolition, fall | Building falling, cave-in, defeat |
| `"scatter"` | Dispersal, wind | Wind blowing things away, memory fragmenting, ashes |

### Energy / Power
| Effect | Feeling | Use When |
|--------|---------|----------|
| `"surge"` | Power-up, activation | Magic cast, gaining power, engine igniting |
| `"flash"` | Lightning, revelation | Lightning strike, camera flash, sudden clarity |
| `"ripple"` | Shockwave, psychic | Sonic boom, psychic wave, force field activation |
| `"spin"` | Vertigo, activation | Mechanical activation, vertigo, whirlwind |

### Reality Break
| Effect | Feeling | Use When |
|--------|---------|----------|
| `"glitch"` | Digital corruption | Reality glitch, simulation break, system error |
| `"warp"` | Dimensional shift | Teleportation, portal, spatial distortion |
| `"vortex"` | Summoning, black hole | Black hole, whirlpool, summoning ritual |

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

## Inline Style Spans — Word-Range Decoration

A fourth, motion-neutral layer. The AI may tag 0–3 word ranges inside `text` with a visual `kind`. Applied as `data-kt-style` (+ `data-kt-style-pos` for position within the range) on the matching `kt-word` wrappers; SCSS owns the visual treatment. Composes cleanly with reveal, continuous, and one-shot — a styled word can still be a cue target at the same word.

Passed to `<KineticText>` as the `styleSpans` prop:

```typescript
import type { StyleSpan } from '@dgrslabs/void-energy-kinetic-text/types';

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
