# Phase 7 — Internationalization (i18n) Support

> Make Void Energy multilingual end-to-end: a small free i18n substrate in core, a deep premium `@void-energy/i18n` package that tunes every other package (Kinetic Text, Liquid Glass, Ambient, Rive, DGRS) for locale + RTL in one flip.

**Status:** Research draft (2026-04-15). Not yet planned in detail. Exploratory — captured from a design discussion to avoid losing the findings. Revisit and formalize after Phase 4 (monorepo) lands.
**Depends on:** Phase 4 (monorepo). Some prep work slots into Phase 4 and should be done opportunistically rather than deferred.
**Blocks:** Nothing hard — i18n is additive. Phase 6 (CoNexus migration) benefits strongly from having this in place, and the brand website (`dgrslabs.ink`) can be the first consumer to prove the stack.

---

## Why this exists

Void Energy is currently English-only. The brand website (`dgrslabs.ink`) currently uses the Google Translate widget — it "works" but it's:

- Runtime DOM injection (fights the design system, mangles SCSS physics)
- Zero SEO value (foreign-market search engines only see English HTML)
- Inaccessible (screen readers get confused by post-hoc translated content)
- No translation quality control (pure raw MT, forever)
- Deprecated path (Google officially steers toward Cloud Translation API + custom UI)
- Un-branded (Google's chrome sits inside our experience)

It's the "Contact Form 7" of i18n — it works, but it screams *I don't care about this.*

Beyond the brand site, every consumer app built on VE (CoNexus first, future consumer apps after) will eventually need i18n. Shipping this as a VE capability — rather than making every consumer solve it themselves — is both a product unlock and a premium moat.

---

## Strategic framing

This is the same two-tier pattern VE already uses everywhere else: free core with a premium depth layer on top.

> **Open what builds community. Close what builds moat.**

- **Core i18n substrate (open source)** — hooks, signals, DOM contract, message registry API, basic switcher. Removes the "English-only" objection from the public starter. Any consumer can plug any i18n library into this.
- **Premium `@void-energy/i18n` package (private)** — Paraglide integration, pre-translated VE strings, RTL physics variants, locale-aware Kinetic Text segmenter, Claude CI translation action, Lingo.dev adapter. The "massive update" moment — one command from English app to 12-language app that flips in one frame.

The split is not arbitrary: logical properties and a locale signal are table stakes (every framework has them), but **RTL-tuned glass physics and CJK-aware kinetic text are VE-specific depth nobody else can ship.** That's the moat.

---

## The "massive update" pitch

The demo that sells this package:

```ts
voidEngine.setLocale('ar');
```

In one frame:
1. `data-locale="ar"` + `dir="rtl"` update on `<html>`
2. Every SCSS logical property auto-mirrors
3. Every Kinetic Text instance re-segments (RTL-aware, Arabic-shaping-correct)
4. Every Rive button swaps labels
5. Every `Intl.NumberFormat` output re-formats
6. Every atmosphere's glass shimmer angle flips
7. Ambient package swaps voice/TTS profile

That's the launch video. The entire system "turns Arabic" atomically. No other design system does this.

---

## Library / tech landscape (2026)

### What big companies actually use

| Company | Stack | Pattern |
|---|---|---|
| **Apple, Microsoft, Google** | In-house TMS + ICU MessageFormat + internal translators | Not available externally, but ICU is the format everyone lands on |
| **Stripe** | Custom ICU pipeline, edge-localized SSR, hreflang-perfect | Edge-localized SSR — the gold standard |
| **Shopify** | Phrase (TMS) + react-intl / custom Ruby i18n | TMS for workflow, ICU for format |
| **Airbnb** | Lokalise + in-house "Lingua" pipeline | Hybrid professional + MT |
| **GitHub** | Crowdin (community-driven translation) | Good for OSS, less for SaaS |
| **Linear, Resend, modern SaaS** | **Lingo.dev** + **Paraglide** | AI-native, CI/CD-integrated — where the industry is moving |
| **Vercel, Netlify** | Next.js i18n routing + custom JSON | Static, edge-cached |
| **Notion** | Multi-stage: MT draft → context review → human polish | Worth reading their engineering blog |

### The three layers every real system has

Most teams conflate these, but they are orthogonal:

1. **Message format** — how strings express plurals/genders/variables
   - Winner: **ICU MessageFormat** (Unicode standard). Not negotiable at scale.
2. **Runtime/compiler** — how messages become app code
   - 2026 winner for this stack: **Paraglide (inlang)**. Compile-time, one function per message, tree-shakes per locale, framework-agnostic (Astro + Svelte friendly).
   - Old guard: i18next (runtime, bloated), react-intl (runtime, heavy).
3. **Translation Management System (TMS)** — where translators work
   - Paid professional: Lokalise, Phrase, Crowdin, Smartling
   - AI-native: **Lingo.dev**, Localizer
   - DIY: JSON files in git + Claude/DeepL API in CI (what we start with)

### Recommended stack for `@void-energy/i18n`

| Concern | Choice | Why |
|---|---|---|
| Message format | **ICU MessageFormat** | Unicode standard, future-proof |
| Compiler | **Paraglide (inlang)** | Tree-shakes, matches Astro zero-runtime ethos |
| Routing | **Astro built-in i18n** | Already supports locale prefixes + hreflang |
| MT pipeline | **Claude API in CI** (via existing `@service/` layer) | Already using Anthropic, quality matches DeepL, one vendor |
| Human review TMS | **Lingo.dev** (later, optional) | AI-native, CI-integrated, free tier |
| RTL physics | **Custom** | VE-specific — this is the moat |

---

## Cost analysis

**Headline: free for a long time.** Paid tools exist to manage human translators — not needed until paying customers demand SLA-backed translation quality.

### Tool pricing (2026)

| Tool | Free tier | Paid |
|---|---|---|
| Paraglide (inlang) | 100% free, MIT | — |
| Astro i18n routing | Built in, free | — |
| DeepL API | 500k chars/month free | $5/mo → $25/mo → enterprise |
| Google Cloud Translation | 500k chars/month free | $20 per 1M chars |
| **Claude API (Haiku)** | Pay-as-you-go | **~$6 per 1M words translated** |
| Lokalise | Free for 3 projects, tiny usage | $120/mo → $230/mo → enterprise |
| Phrase | 14-day trial | $27/user/mo → $67/user/mo |
| Crowdin | Free for open source | $59/mo paid |
| Lingo.dev | Free tier: 1k translations/mo | ~$40/mo pro |

### Monthly budget by stage

| Stage | What we need | Monthly cost |
|---|---|---|
| MVP (brand site + starter) | Claude API for CI translation only | **$0–2** |
| VE launch (brand + docs, ~5k strings × 12 locales) | Claude API only, DIY | **$2–10** |
| CoNexus public launch (~2k app strings × 12 locales) | Claude API + maybe Lingo.dev free tier | **$10–40** |
| Enterprise deals (human-reviewed SLA) | Lingo.dev or Lokalise paid | **$200–2000** |
| Global scale (compliance, legal per locale) | Lokalise Enterprise + professional translators | **$5k+** |

**Translating the entire CoNexus app into 12 languages from scratch via Claude API costs under $10 one-time.** The economics of MT have completely inverted — translation is no longer the expense, human review is.

---

## Architecture

### Three layers (mirrors L0/L1/L2 thinking)

**L0 — Core i18n hooks (open source, ships in `@void-energy/tailwind` + `void-energy`)**
- `voidEngine.locale` reactive signal (`'en' | 'ar' | 'ja' | ...`)
- `voidEngine.direction` derived signal (`'ltr' | 'rtl'`)
- `data-locale` + `dir` on `<html>` (DOM contract)
- `voidEngine.registerMessages(locale, map)` registry API
- Basic `<LocaleSwitcher>` component (L1 only, Svelte)
- VE's own ~20 internal strings, keyed (English shipped; others plug-in)
- `--direction-sign` token in design-tokens.ts
- Logical properties throughout SCSS (audited)

**L1 — Composition recipe (free, documented in `COMPOSITION-RECIPES.md`)**
- Paraglide + Astro i18n routing wired into a VE consumer app
- No code shipped — just the reference pattern

**L2 — `@void-energy/i18n` premium package (private)**
- Pre-configured Paraglide integration (zero-config init)
- Pre-translated VE strings for 12+ locales
- **RTL physics variants** — glass shimmer angles, displacement maps, atmosphere tuning for mirrored layouts
- **Locale-aware Kinetic Text segmenter** (CJK/Arabic/Devanagari via `Intl.Segmenter`)
- **Animated number/date formatters** (`<AnimatedNumber locale>` + morph transitions)
- **Claude-powered CI GitHub Action** (MT on every PR touching `messages/en.json`)
- **Lingo.dev adapter** (for teams who want human review loops)
- Locale-aware TTS voice selection for Ambient package
- Physical-property lint / audit tooling

### How the layers integrate

Premium is a **peer dependency** of core — not a fork. Core exposes hooks; premium plugs into them:

```
┌──────────────────────────────────────────────┐
│  @void-energy/core (open source)             │
│                                              │
│   voidEngine.locale ← signal                 │
│   voidEngine.registerMessages() ← hook       │
│   [dir="rtl"] ← SCSS contract                │
│   logical properties everywhere              │
│   --direction-sign token                     │
└──────────────┬───────────────────────────────┘
               │ peer dep
               │
┌──────────────▼───────────────────────────────┐
│  @void-energy/i18n (premium)                 │
│                                              │
│   • Sets voidEngine.locale from URL/browser  │
│   • Calls registerMessages() × 12 locales    │
│   • Adds RTL physics variants via SCSS       │
│   • Replaces KT segmenter via injection      │
│   • Ships CI action, TMS adapters            │
│   • AnimatedNumber / FormattedDate components│
└──────────────────────────────────────────────┘
```

**Without premium:** Core works. App is localizable by anyone willing to wire their own library. LTR/RTL physics correct but un-tuned per atmosphere. KT falls back to Latin segmentation.

**With premium:** Everything pre-wired. Arabic-ready out of the box. One command from English to 12-language.

### Per-package upgrade surface

Each premium package gets a defined i18n hook it opts into:

| Package | What flips on locale/RTL |
|---|---|
| **core (L0)** | Logical properties; `data-locale` routing; direction signal |
| **kinetic-text** | Grapheme segmentation (CJK/Arabic/Devanagari); reveal direction flips for RTL |
| **liquid-glass** | Displacement map mirrors horizontally in RTL; shimmer angle flips |
| **ambient-layers** | Voice/TTS locale selection; sound cue timing tuned per language rhythm |
| **rive** | Label morph targets swap per locale; direction-aware easing |
| **dgrs** | Dice terminology, number formatting, roll notation localization |
| **conexus** (consumer) | Full app localization — the first real consumer |

Every package imports i18n capabilities via optional sub-path (`@void-energy/i18n/optional`). No package *requires* i18n; every package *upgrades* when it's present. Same pattern as a plugin bus.

---

## Timing — when to ship, what to prep during Phase 4

**Ship the full i18n package after Phase 4 (monorepo).** The monorepo migration is already a large, risky architectural change (splitting what exists into packages without behavior change). Adding i18n on top doubles the risk surface.

**But bake i18n-readiness into Phase 4 itself**, without shipping the actual package:

| Do during Phase 4 (cheap, touches same files anyway) | Don't do during Phase 4 (defer to Phase 7) |
|---|---|
| Replace `padding-left` → `padding-inline-start` everywhere you touch SCSS | Paraglide integration |
| Add `--direction-sign` token to `design-tokens.ts` | Claude MT in CI |
| Make KT's text segmenter an injectable interface | Locale signal on voidEngine |
| Audit each package for physical directional assumptions | The premium package itself |

Rationale: Phase 4 is already rewriting — make it RTL-clean while we're there. Retrofitting later means touching every package a second time.

---

## Out-of-the-box consumer experience

The promise for a VE consumer app:

```bash
npm install @void-energy/i18n
npx void-i18n init
```

The `init` command:
1. Creates `messages/en.json` (source-of-truth strings)
2. Adds i18n config to `astro.config`
3. Wires locale routing (`/en/`, `/ar/`, etc.)
4. Adds `<LocaleSwitcher>` to the default layout
5. Installs a GitHub Action that auto-translates `messages/en.json` diffs via Claude
6. Generates `<link rel="alternate" hreflang>` tags from Astro config

**Zero-config VE strings.** Every VE component's internal strings (modal buttons, ARIA labels, toast actions, empty states) are already keyed and pre-translated. Consumers don't lift a finger for those.

**Consumer strings ride the same pipeline.** Consumers add their own `messages/en.json` entries; the same Claude CI action translates them into every locale alongside VE's. One message format, one pipeline, one switcher.

---

## Prerequisites (must be true for this to work)

This is the honest part — some of these are work-now, not work-later. Most slot into Phase 4 naturally.

- **Logical properties everywhere in SCSS.** `padding-inline`, `margin-inline-start`, `inset-inline-end`. If any physical `left:`/`right:` leaks in, RTL breaks. The premium package ships audit tooling for this, but the substrate must already be clean.
- **No hardcoded directional transforms.** `translateX(-10px)` is wrong. Use `translateX(calc(-10px * var(--direction-sign)))` or equivalent logical patterns.
- **Kinetic Text's segmenter is replaceable.** Currently assumes Latin graphemes — needs an injectable segmenter interface so the premium package can swap in `Intl.Segmenter`.
- **Atmospheres don't bake directional assets.** If any atmosphere has a shimmer gradient with a fixed angle, it needs a `--direction-sign` multiplier.
- **Peer-dep discipline.** Optional imports via subpath exports (`@void-energy/i18n/optional`) — not hard imports, or the bundle bloats for users who don't need i18n.

---

## Sequencing (inside Phase 7 itself)

Don't try to ship everything at once. Order of operations:

1. **Confirm Phase 4 prep is complete.** Logical properties audited, `--direction-sign` token present, KT segmenter injectable. If not, close those gaps first.
2. **Land i18n hooks in core** (1–2 weeks). Locale signal on `voidEngine`, DOM contract wiring, registry API, basic `<LocaleSwitcher>`. Ship as a minor version of `void-energy` + `@void-energy/tailwind`.
3. **Launch `@void-energy/i18n` v0 (premium)** (3–4 weeks). Paraglide integration, Claude CI action, RTL physics tuning for **flat physics only**, **3 locales** (English + Arabic + Japanese — Arabic exercises RTL hardest, Japanese exercises CJK segmentation).
4. **Migrate `dgrslabs.ink` off Google Translate.** First reference consumer — proves the stack, generates launch content, directly fixes a visible product pain.
5. **Expand to 12+ locales, all 3 physics presets, Lingo.dev integration.** This is the "massive system update" launch moment — coordinated release across all premium packages simultaneously.

---

## Open questions / decisions to make later

These are the real trade-offs that need concrete decisions before Phase 7 implementation begins — not today.

- **Which locales ship in v0?** Arabic + Japanese cover the hardest cases (RTL + CJK) with just two. But Spanish + Chinese + French may be higher-impact commercially. Pick 3 for v0, then expand.
- **Human review workflow — in v0 or later?** AI-only translation is good enough for launch. Human review (via Lingo.dev or Lokalise) is a paid-tier feature that doesn't need to exist on day one.
- **Do we translate atmosphere names?** "Void" in Arabic? Probably yes for UX polish, but adds workflow. Deferrable.
- **KT timing tuning per language.** Japanese and Arabic have different reading rhythms than English. Do we expose per-locale reveal speed multipliers, or trust `Intl.Segmenter` grapheme boundaries and let authors override?
- **TTS locale → voice mapping.** Do we ship defaults, or force consumers to configure per-locale voice IDs? Defaults are friendlier but every TTS provider has different voice catalogs.
- **Legal/compliance translation scope.** Do we localize license text, ToS, privacy policy? Those need human legal review, not MT. Probably out of scope for v0.
- **Brand name handling.** "Void Energy" should stay "Void Energy" in every locale. Need a glossary / do-not-translate list in the Claude prompt.

---

## Honest tradeoffs

**The first locale is 80% of the work.** Going from 1 → 12 locales is mostly translation (cheap with Claude). Going from 0 → 1 is architecture. The question is whether the prep work is worth doing *now* so the cascade is cheap later — verdict: yes for the cheap parts (logical properties, `--direction-sign`, injectable segmenter), no for the full package until CoNexus actually needs it.

**RTL matrix is real scope.** 3 physics × 2 modes × N atmospheres × RTL = a large testing surface. Starting with RTL for **one physics (flat)** only in v0 keeps the matrix manageable. Glass and retro RTL come in v1.

**The free tier really is enough for a long time.** Don't pre-buy Lokalise / Phrase / Smartling. Start with Claude API in CI and JSON files in git. Upgrade the day a paying enterprise customer demands human-reviewed translations.

**Google Translate widget removal is self-contained.** Even before the full premium package exists, dropping the widget on `dgrslabs.ink` and replacing it with Astro locale routes + Paraglide + Claude CI is a 1-2 week project that immediately improves brand credibility and proves the stack for the full package later.

---

## Related plans

- [phase-4a-monorepo-structure.md](phase-4a-monorepo-structure.md) — bake logical-properties audit + `--direction-sign` + segmenter interface in here
- [phase-4b-premium-packages.md](phase-4b-premium-packages.md) — `@void-energy/i18n` will become the 5th premium package
- [phase-6-conexus-migration.md](phase-6-conexus-migration.md) — CoNexus will be the first full-app consumer of the i18n stack
