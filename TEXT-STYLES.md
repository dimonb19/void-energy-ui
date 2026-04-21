# Text Styles — AI Reference

Structured reference for the AI that generates CoNexus story beats. Each entry describes exactly when to tag a word range inside `text` with a given inline style `kind`. Embed this document (or the JSON array below) as system-level context for the story generation model.

Text styles are the **third** layer the AI controls per beat, alongside [narrative effects](NARRATIVE-EFFECTS.md) (kinetic motion on the letters) and [ambient effects](AMBIENT-EFFECTS.md) (scene-level atmosphere). Styles decorate word *ranges* — they do not move, pulse, or animate. They compose cleanly with reveal animations, one-shots, and continuous effects on the same word.

## Schema

Each story beat may include a `styles` array of 0–3 style spans. Every span in the array MUST share the same `kind` — a styled beat is ONE showcase. Mixing kinds in the same beat is rejected by the schema.

```ts
interface StoryStyleSpan {
  fromWord: number;     // 0-indexed first word of the range (inclusive)
  toWord:   number;     // 0-indexed last  word of the range (inclusive; ≥ fromWord)
  kind:     StyleKind;  // all spans in a beat share one kind
}

type StyleKind =
  | 'speech'      // direct dialogue
  | 'aside'       // hushed parenthetical
  | 'emphasis'    // single load-bearing word
  | 'underline'   // stark callout
  | 'code';       // system / machine voice
```

Word indices use the same whitespace-word system as `atWord` on `StoryOneShot` / `StoryAction`. A single-word span has `fromWord === toWord`. The renderer applies `data-kt-style` + `data-kt-style-pos` on the matching `kt-word` wrappers; SCSS owns the visual treatment.

---

## Style Reference

```jsonc
[
  // ═══════════════════════════════════════════════════════════
  // SPEECH — Direct dialogue voiced by a character.
  // Italic + automatic curly quotes via CSS ::before/::after.
  // NEVER type quote characters in `text`. The renderer wraps
  // the range with opening and closing curly quotes, synced to
  // the reveal so the marks don't announce words that haven't
  // appeared yet. Multiple `speech` ranges per beat are fine
  // for back-and-forth dialogue.
  // ═══════════════════════════════════════════════════════════

  {
    "kind": "speech",
    "treatment": "Italic body text wrapped in curly double quotes (U+201C / U+201D). Quotes fade in with the first/last glyph of the range.",
    "emotion": "A voice is speaking. This text belongs to a person, not the narrator.",
    "use_when": [
      "A character speaks a line of dialogue in the beat",
      "A remembered phrase surfaces — a command, a prayer, a last word",
      "A voice from the dark, a radio, a telepathic contact",
      "Back-and-forth exchange — emit one `speech` range per spoken phrase"
    ],
    "do_not_use_when": [
      "The narrator is describing what a character said without quoting them",
      "The text is the character's unvoiced thought — leave it plain or use `aside`",
      "The voice is system / machine (terminal, screen, sign) — use `code`"
    ],
    "author_rules": [
      "NEVER include ASCII quotes (\") or curly quotes in the `text` string — the renderer adds them",
      "`fromWord` is the first spoken word, `toWord` is the last spoken word",
      "Speaker attribution (\"she says\", \"the voice asks\") sits OUTSIDE the range",
      "Multi-phrase dialogue: emit one span per phrase, not one big span covering the attribution"
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // ASIDE — Hushed parenthetical or second-layer detail.
  // Muted color only. No italic (italic is reserved for speech
  // so the two treatments never blur together). This is the
  // volume-down counterpart to `emphasis`: where `emphasis` is
  // the word the beat pivots on, `aside` is the detail the
  // narrator almost swallowed.
  // ═══════════════════════════════════════════════════════════

  {
    "kind": "aside",
    "treatment": "color: var(--text-mute). No italic, no weight change, no decoration.",
    "emotion": "A detail the narrator doesn't want to own. Whispered, deprioritized, half-real.",
    "use_when": [
      "A subordinate clause that softens the main sentence — \"the house settles, tired of morning\"",
      "A second-layer detail the narrator is half-admitting — \"you are alone, mostly\"",
      "A parenthetical observation that would weaken the sentence if given full weight",
      "The word that should be heard but not seen"
    ],
    "do_not_use_when": [
      "The text is literally spoken — use `speech`",
      "The aside is a system callout — use `code`",
      "You want the word to stand out — `aside` is the opposite of emphasis"
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // EMPHASIS — The single load-bearing word of the beat.
  // Bold. NEVER more than one `emphasis` range per beat. Often
  // overlaps with the climax anchor — the same word carrying
  // both the ambient `action` and a kinetic one-shot is a
  // natural place for `emphasis` to land.
  // ═══════════════════════════════════════════════════════════

  {
    "kind": "emphasis",
    "treatment": "font-weight: var(--font-weight-bold). No italic, no color shift, no decoration.",
    "emotion": "The beat pivots on this word. Stop. Look at it.",
    "use_when": [
      "One word carries the entire weight of the sentence (\"the world tilts\")",
      "The climax anchor word — often the same `atWord` the ambient action fires on",
      "A single verb or noun that reframes everything before it",
      "The word you would italicize in a novel to tell the reader where the stress falls"
    ],
    "do_not_use_when": [
      "You want to emphasize two words — pick the ONE that carries the weight",
      "The word is a verb of speech (\"says\", \"whispers\") — emphasis goes on what was said",
      "The whole sentence is intense — emphasis works by contrast, not by default"
    ],
    "author_rules": [
      "MAXIMUM ONE `emphasis` range per beat. The schema allows up to 3 same-kind spans but `emphasis` is capped at 1 by taste",
      "Emphasis and a climax kinetic one-shot on the same `atWord` compose naturally — bold + effect is a real moment"
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // UNDERLINE — Stark callout. Rare.
  // Plain text-decoration: underline with a tight underline-offset.
  // Use for signage, warnings, or a phrase the beat literally
  // wants to underline. Never stack underline with emphasis on
  // the same word — the schema enforces one kind per beat, and
  // even if it didn't, the result would read as shouty.
  // ═══════════════════════════════════════════════════════════

  {
    "kind": "underline",
    "treatment": "text-decoration: underline with text-underline-offset: 0.15em.",
    "emotion": "A stark callout. The kind of phrase you would underline on a page.",
    "use_when": [
      "A warning or sign the character reads aloud (\"the sign reads KEEP OUT\")",
      "A rule, edict, or instruction the beat wants you to register",
      "A phrase the narrator is flagging as important without using bold",
      "A short declarative fragment — two words maximum"
    ],
    "do_not_use_when": [
      "You want to emphasize a single pivotal word — use `emphasis`",
      "The text is a spoken phrase — use `speech`",
      "The text is signage on a machine / terminal — use `code`"
    ],
    "author_rules": [
      "MAXIMUM TWO `underline` ranges per beat",
      "Each range MUST be ≤ 2 words",
      "Rare by design — most beats should never reach for underline"
    ]
  },

  // ═══════════════════════════════════════════════════════════
  // CODE — System / machine voice.
  // Recessed inline chip: monospace + subtle --bg-sunk background +
  // subtle border + em-based padding + rounded corners. The chip
  // background fades in with the first glyph so empty boxes don't
  // announce words that haven't revealed. Multi-word spans render
  // as adjacent chips (one per word). Reads cleanly for 1 word,
  // fine for 2, busy at 3+.
  // ═══════════════════════════════════════════════════════════

  {
    "kind": "code",
    "treatment": "font-family: var(--font-code). Recessed --bg-sunk chip with border, ~0.125em/0.375em padding, radius-base × 0.5. No italic, no weight change.",
    "emotion": "This text is not prose. A machine, a sign, a terminal, a system is speaking.",
    "use_when": [
      "Terminal output or console lines (\"the screen reads INITIATE\")",
      "Signage, labels, door plates (\"the brass plate says MAINTENANCE\")",
      "Status indicators or notifications (\"a notification surfaces: OFFLINE\")",
      "Machine-voiced words the world is displaying, not speaking",
      "Pairs well with atmospheres 'neon' and 'underground' and psychologies 'filmGrain' and 'tension'"
    ],
    "do_not_use_when": [
      "The voice is a character — use `speech`",
      "The text is ordinary narration — leave it plain",
      "You want a 3+ word chip — prefer rewriting the beat so the `code` span is 1–2 words"
    ],
    "author_rules": [
      "Prefer single-word ranges. Two-word fine. Three-plus reads as busy adjacent chips",
      "Multiple `code` ranges per beat are fine when two different signs / screens speak",
      "Do NOT use `code` for user input or user speech — `code` is the world addressing the character"
    ]
  }
]
```

---

## Usage Rules

1. **Default is ZERO styles.** Most beats should be plain prose. Styled beats are the occasional showcase — plain is the baseline.

2. **A styled beat is ONE showcase.** If you emit any styles, ALL entries MUST share the same `kind`. Mixing `speech` + `emphasis` on the same beat is rejected by the schema. Pick one kind and use it as many times as the text needs (up to 3 ranges).

3. **Rotate across beats.** Session-level variety matters: if the last beat used `speech`, this one should be plain or try a different kind. Never lean on the same style two beats in a row.

4. **Multiple same-kind ranges are for natural repetition, not decoration:**
   - Two `speech` ranges when the beat has dialogue → narration → dialogue
   - Two `code` ranges when two different signs / screens speak
   - Two `underline` ranges for two short callouts — never more
   - One `emphasis` range — never more than one per beat

5. **Per-kind caps:**
   - `speech` — up to 3 ranges, no word-count limit per range
   - `aside` — up to 3 ranges
   - `emphasis` — **1 range maximum** per beat
   - `underline` — up to 2 ranges, **≤ 2 words each**
   - `code` — up to 3 ranges, prefer single-word; 2 fine; 3+ rare

6. **Styles compose with effects.** A styled word can still carry a one-shot at the same `atWord`. The climax anchor is a natural place for `emphasis` + a kinetic one-shot to land together — bold word + effect is a real moment. The two layers do not touch each other's motion / opacity / filter properties, so they compose cleanly.

7. **Never use styles for:**
   - Flavor decoration when the text doesn't earn it — plain is always valid
   - Two different treatments in the same beat (schema rejects it)
   - Replacing punctuation — `speech` auto-renders curly quotes; do not type `"` characters into `text`

---

## Interaction with Reveal and Effects

Styles are **motion-neutral**. The SCSS rules in [packages/kinetic-text/src/styles/kinetic-text.scss](packages/kinetic-text/src/styles/kinetic-text.scss) intentionally avoid `transform`, `opacity`, and `filter` on the styled word, so kinetic effects can still drive those properties at the glyph or word level without conflict.

Two treatments are **reveal-gated** — their decorative parts only appear as the underlying glyphs reveal, so they don't announce text that hasn't arrived:

- `speech` — the opening curly quote fades in with the first glyph of its range, the closing curly quote waits for the last glyph to be fully visible
- `code` — the recessed background + border fade in with the first glyph of each word (each word is its own chip)

`aside`, `emphasis`, and `underline` apply immediately on render — they carry no decorative element that would announce unrevealed text.

---

## Anchoring to Word Indices

Word indices are **0-indexed** and use whitespace splitting. Given this text:

```
The door opens without a sound.
  0    1     2       3    4  5
```

- `{ fromWord: 2, toWord: 2, kind: 'emphasis' }` bolds the word "opens"
- `{ fromWord: 1, toWord: 5, kind: 'speech' }` wraps "door opens without a sound" in italics + curly quotes
- `{ fromWord: 5, toWord: 5, kind: 'underline' }` underlines "sound"

The same indexing is used by `StoryOneShot.atWord` and `StoryAction.atWord`, so a climax-anchor word can carry an ambient action, a kinetic one-shot, **and** a style treatment simultaneously. The schema allows this; the renderer resolves it.

---

## Examples

**Plain beat — no styles (the common case).** Most beats should look like this. The text stands on its own; the kinetic + ambient layers carry the mood.

```json
{
  "text": "The hedges hum at a frequency just below hearing, and every leaf is the same shade of television grey. ...",
  "styles": []
}
```

**Single `emphasis` — the pivot word.** One word carries the beat; bold + climax one-shot on the same word is a natural composition.

```json
{
  "text": "You count five seconds before you remember to breathe.",
  "styles": [
    { "fromWord": 9, "toWord": 9, "kind": "emphasis" }
  ],
  "kinetic": {
    "oneShots": [{ "atWord": 9, "effect": "tremble" }]
  }
}
```

**Two `speech` ranges — dialogue bracketing narration.** Both ranges share `kind: 'speech'` as the schema requires. No quote characters typed in `text` — the renderer adds curly quotes.

```json
{
  "text": "The door opens without a sound. Come in, she says, the words thin as paper. You stand there, breathing the dust. Stay, she adds.",
  "styles": [
    { "fromWord": 6, "toWord": 7, "kind": "speech" },
    { "fromWord": 21, "toWord": 21, "kind": "speech" }
  ]
}
```

**Two `code` ranges — two signs speaking.** The world addresses the character twice; each sign is a separate chip.

```json
{
  "text": "One door reads MAINTENANCE. Another reads NO EXIT. You stand between them.",
  "styles": [
    { "fromWord": 2, "toWord": 2, "kind": "code" },
    { "fromWord": 5, "toWord": 6, "kind": "code" }
  ]
}
```
