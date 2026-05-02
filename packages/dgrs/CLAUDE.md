# Package Rules — `packages/dgrs/` (staging) → `@dgrslabs/dgrs-ui` (final)

You are editing the **DGRS atmospheres + shared DGRS UI** package. This is the one carve-out from [packages/_TEMPLATE/CLAUDE.md](../_TEMPLATE/CLAUDE.md) — the package boundary still applies, but the npm scope and final repo are different. The 5 Laws (root [CLAUDE.md](../../CLAUDE.md)) apply.

---

## Staging vs. final (read this first)

- **Staging name** (today, this monorepo): `packages/dgrs/`. No `package.json` yet — code stages here while the VE roadmap runs.
- **Final name** (after the premium-packages extraction): **`@dgrslabs/dgrs-ui`** in the new private repo `github.com/dgrslabs/dgrs-ui`, published to GitHub Packages under the `@dgrslabs` scope. Per [decisions.md §D30](../../plans/decisions.md#d30--dgrs-atmospheres--shared-ui-carve-out), this package is **not** part of the VE premium repo or the VE sale — it is DGRS Labs proprietary, used by CoNexus and future DGRS apps.

The carve-out exists so a future VE acquirer cannot accidentally inherit DGRS's private UI kit. Keep the boundary clean from day one — write this code as if it already lived in the DGRS repo.

## Package boundary (same as any other package)

`@dgrslabs/dgrs-ui` is a **peer of `void-energy`**, like any external consumer. Same rules as the template:
- Never reach into `src/` via relative paths. Use the published `void-energy` exports.
- No imports from other `packages/*` (including `@void-energy/kinetic-text`, `@void-energy/ambient-layers`). If DGRS UI needs an effect from a premium package, depend on it as a peer the same way an external consumer would.
- No backdoor imports — the cleaner this package is today, the more mechanical the eventual extraction.

## Package surface

- **DGRS atmospheres**: 12 DGRS-branded themes registered at app boot via `registerDGRSAtmospheres()`.
- **Shared DGRS UI components**: `Tile`, `StoryCategory`, `PortalLoader`, `LoadingTextCycler`, `StoryFeed`, plus app-specific components (`CoNexus`, `VibeMachine`, `ReorderShowcase`) staging here until extraction.

When adding atmospheres or components, follow the same VE conventions as L1 (5 Laws, native-first, runes doctrine, state via `data-*` and ARIA). DGRS UI is VE-shaped — only the ownership and final repo differ.
