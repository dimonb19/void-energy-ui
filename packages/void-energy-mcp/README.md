# @void-energy/mcp

MCP server for the [Void Energy](https://github.com/void-energy/void-energy) design system. Stdio transport, read-only, zero side effects.

Exposes **3 Resources + 1 Tool**. The split follows 2026 MCP doctrine: static metadata that exists before the conversation and doesn't change per model action is a Resource (URI-addressable, client-cached, subscribe-on-change); only computation, mutation, or external API calls are Tools. Three of the four surfaces here are static reads of the design system; only `void_validate_atmosphere` runs code.

| Surface | Type | URI / Name | Returns |
|---|---|---|---|
| `void_atmosphere_list` | Resource | `void://atmospheres` | `{ id, label, mode, physics }[]` |
| `void_atmosphere_tokens` | Resource (template) | `void://atmospheres/{id}` | full token JSON |
| `void_design_md` | Resource (template) | `void://atmospheres/{id}/design.md` | spec-compliant markdown (Frost only) |
| `void_validate_atmosphere` | Tool | — | Safety Merge result `{ ok, errors, normalized }` |

## Install (Claude Code)

```bash
claude mcp add --transport stdio void-energy -- npx -y @void-energy/mcp
```

## DESIGN.md spec version

The `void_design_md` Resource emits markdown compliant with **`@google/design.md` v0.1.1** — pinned exactly in the parent monorepo's `package.json`. The pin is intentional; the Stitch DESIGN.md spec is young and will drift. Verify the on-disk pin alignment via `npm run check:design-md` (root). Bumping `@google/design.md` requires regenerating `DESIGN.md` and reviewing the diff.

## Scope notes

- `void://atmospheres/{id}/design.md` is **Frost-only** by design — the spec-export tool is intentionally a single canonical-snapshot exporter (see CLAUDE.md §9 in the monorepo root). Other ids return MCP resource-not-found with didactic content text. For full token data of any atmosphere, use `void://atmospheres/{id}`.
- Exclusions per D6: no `void_preview_atmosphere`, no `void_apply_atmosphere`, no `void_generate_from_url`. v1 is read-only metadata + Safety-Merge validation.

## License

BUSL-1.1. See [LICENSE.md](./LICENSE.md).
