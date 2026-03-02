# Phase 6: Gaps & Missing Coverage

> **Scope:** Address remaining consistency gaps and missing system pieces identified across all phases.
> **This phase collects cross-cutting issues** that don't fit neatly into a single earlier phase.

---

## 6A. Cross-Phase Summary

Some issues from earlier phases have dependencies on each other. This section groups them by component/area for efficient fixing.

### Switcher (touches Phase 2A + 2B)

The Switcher component needs the most work of any single component:

1. **Create SCSS styles** for `.switcher-option` (Phase 2A, HIGH)
2. **Move `SwitcherProps` interface** from `void-ui.d.ts` to the component file (Phase 2B, LOW)

These should be done together in one session. Read `Toggle.svelte` + `_toggle.scss` as the analog — both are binary/multi-state controls with glass-sunk tracks.

### SettingsRow (touches Phase 2B)

1. **Migrate from `$props<T>()` to named interface** (Phase 2B, HIGH)
2. **Add `class?: string` passthrough** (Phase 2B, MED)

Small, self-contained fix.

### ThemesFragment (touches Phase 1E + 2C)

1. **Fix spacing `p-xs gap-xs` to `p-md gap-md`** (Phase 1E, HIGH)
2. **Add `id="modal-title"` to `<h2>`** (Phase 2C, HIGH)

Both are one-line fixes in the same file. Do them together.

### Navigation + Page Sidebar (touches Phase 1B + 3A)

1. **`.arrow` chevron `2px` to `var(--physics-border-width)`** (Phase 1B, MED)
2. **`0.3s` retro transitions to `var(--speed-base)`** — 2 in `_navigation.scss`, 2 in `_page-sidebar.scss` (Phase 3A, MED)
3. **`var(--font-weight-normal)` to `var(--font-weight-regular)`** in `_page-sidebar.scss` (Phase 3A, HIGH)

All SCSS-only fixes in 2 files. Do them in one session.

---

## 6B. Consistency Gaps

### Button variants — PASS
All semantic variants (success, error, premium, system) follow the same structural pattern in `_buttons.scss`. No gaps.

### Field components — PASS (with Switcher exception)
All field types (SearchField, EditField, EditTextarea, PasswordField, CopyField, GenerateField, GenerateTextarea, SliderField, MediaSlider) share the `.field` class pattern consistently. Switcher is the only outlier — it uses `.switcher-option` with no backing SCSS.

### Surface classes — PASS
All surface classes (`surface-glass`, `surface-glass-action`, `surface-sunk`, `surface-spotlight`, `surface-void`) are documented in CHEAT-SHEET.md and used in templates.

### `void-ignore` annotation consistency
Some glow/motion physics values are annotated with `// void-ignore (Glow Physics)` or `// void-ignore (Motion Physics)`, but identical patterns in other files are not. Phase 1B Fix annotations address this.

---

## 6C. Recommended Session Order

If tackling one phase per session, the recommended order prioritizes highest impact and groups related changes:

| Session | Phase | Focus | HIGH fixes | Total fixes |
|---------|-------|-------|------------|-------------|
| 1 | **Phase 2C subset** | A11y quick wins (Toast button, ThemesFragment title, Toggle focus ring) | 3 | 3 |
| 2 | **Phase 3A** | Token fixes (broken font-weight, retro timings, Tailwind config) | 2 | 8 |
| 3 | **Phase 1E** | Spacing gravity (ThemesFragment + index.svelte sunk surfaces) | 1 | 7 |
| 4 | **Phase 2A** | Switcher SCSS creation + Skeleton retro shimmer | 1 | 2 |
| 5 | **Phase 2B** | Props interface cleanup (SettingsRow, ThemesBtn, PullRefresh, KineticText) | 1 | 6 |
| 6 | **Phase 1B** | Token law (chevron border, shimmer gradient, void-ignore annotations) | 0 | 7 |
| 7 | **Phase 5** | Documentation sync (CLAUDE.md + CHEAT-SHEET.md) | 0 | 12 |
| 8 | **Phase 2D** | Icon class prefixes (ArrowBack, Dream, Quill) | 0 | 3 |

**Phase 4 requires no session** — it passed clean.

### Alternative: Group by file

If you prefer to minimize context switching, group by the files being touched:

| Session | Files | Fixes from |
|---------|-------|-----------|
| 1 | `ThemesFragment.svelte` | Phase 1E (spacing) + Phase 2C (aria title) |
| 2 | `Toast.svelte` | Phase 2C (native button) |
| 3 | `_toggle.scss` | Phase 2C (focus ring) |
| 4 | `_navigation.scss` + `_page-sidebar.scss` | Phase 1B (chevron) + Phase 3A (retro timing, font-weight) |
| 5 | `tailwind.config.mjs` | Phase 3C (line-height + letter-spacing vars) |
| 6 | `Switcher.svelte` + new `_switcher.scss` | Phase 2A (SCSS) + Phase 2B (props location) |
| 7 | `SettingsRow.svelte` + `PullRefresh.svelte` + `ThemesBtn.svelte` | Phase 2B (props interfaces) |
| 8 | `KineticText.svelte` + `PortalLoader.svelte` | Phase 2B (callback naming, interface naming) |
| 9 | `_mixins.scss` + `_inputs.scss` + `_toasts.scss` | Phase 1B (shimmer gradient, void-ignore annotations) |
| 10 | `CLAUDE.md` + `CHEAT-SHEET.md` | Phase 5 (documentation) |
| 11 | Icon components (ArrowBack, Dream, Quill) | Phase 2D (class prefixes) |

---

## Final Audit Stats

| Category | HIGH | MED | LOW | Total |
|----------|------|-----|-----|-------|
| Law 1 (Hybrid) | 0 | 0 | 0 | 0 |
| Law 2 (Tokens) | 0 | 2 | 5 | 7 |
| Law 3 (Runes) | 0 | 0 | 0 | 0 |
| Law 4 (State) | 0 | 0 | 0 | 0 |
| Law 5 (Spacing) | 1 | 6 | 0 | 7 |
| Component-SCSS | 1 | 1 | 2 | 4 |
| Props Interface | 1 | 5 | 4 | 10 |
| Accessibility | 3 | 2 | 0 | 5 |
| Icons | 0 | 2 | 1 | 3 |
| Token Coverage | 1 | 4 | 3 | 8 |
| Physics Triad | 0 | 0 | 0 | 0 |
| Generated Files | 1 | 3 | 0 | 4 |
| Singletons | 0 | 0 | 0 | 0 |
| Layer Stack | 0 | 0 | 0 | 0 |
| Transitions | 0 | 0 | 0 | 0 |
| CLAUDE.md | 0 | 6 | 2 | 8 |
| CHEAT-SHEET.md | 0 | 0 | 4 | 4 |
| **TOTALS** | **8** | **31** | **21** | **60** |

**System health: 7.5 / 10**

### Areas of Excellence (no fixes needed)
- Runes migration (100% complete)
- State protocol (100% compliant)
- Singleton architecture (zero violations)
- Layer stack & escape handling (zero conflicts)
- Transition system (zero leakage of Svelte built-ins)
- Physics triad coverage (all components handle all 3 presets)
