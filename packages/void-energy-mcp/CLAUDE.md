# Package Rules — `packages/void-energy-mcp/`

You are editing **`@void-energy/mcp`**, the stdio MCP server. Root [CLAUDE.md](../../CLAUDE.md) 5 Laws apply. The strict L1 audit in [src/CLAUDE.md](../../src/CLAUDE.md) does **not** — this package has different boundaries.

---

## 1. Build-time vs runtime split (load-bearing)

This package needs L1 atmosphere data, but its **runtime must not** reach into `../../src/...`. Future maintainer: do not back-port a runtime reach.

- **Build time only** — [scripts/build-data.ts](scripts/build-data.ts) imports from `src/config/atmospheres.ts` and `src/lib/spec-design-md.ts` to write `dist/data/atmospheres.json` + `dist/data/design-md/frost.md`. Runs from repo-root cwd via `npm run build:mcp:data` so root tsconfig path aliases resolve.
- **Runtime** — only reads `dist/data/*.json` / `*.md` via `node:fs`. No L1 imports, no path aliases.
- `dist/data/` is gitignored; regenerated each build.

## 2. Surface scope (per [D6](../../plans/phase-1-decisions.md#d6) + [D9](../../plans/phase-1-decisions.md#d9))

3 Resources + 1 Tool. Read-only. No filesystem writes, no rendering, no hosted dependencies. Do **not** add `void_preview_atmosphere`, `void_apply_atmosphere`, or `void_generate_from_url` — explicitly excluded.

## 3. Stdio hygiene

stdout is owned by JSON-RPC. **Never `console.log` or `process.stdout.write` from server code.** Diagnostics → `process.stderr.write` only. The MCP SDK enforces this on the wire, but every helper in the package has to as well.

## 4. Safety-Merge drift

[src/safety-merge.ts](src/safety-merge.ts) is a pure port of `normalizeThemeDefinition` in [src/adapters/void-engine.svelte.ts](../../src/adapters/void-engine.svelte.ts). When the engine version changes, this port must change with it. The drift contract is enforced by [tests/mcp-safety-merge-equivalence.test.ts](../../tests/mcp-safety-merge-equivalence.test.ts) — keep it green.
