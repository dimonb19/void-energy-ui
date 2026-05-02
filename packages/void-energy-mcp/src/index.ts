#!/usr/bin/env node
/*
 * @void-energy/mcp — stdio MCP server.
 *
 * Surfaces (per plans/phase-1-decisions.md D6/D9):
 *   - 3 Resources (read-only metadata, URI scheme `void://`):
 *       void://atmospheres                       — list of atmospheres
 *       void://atmospheres/{id}                  — full token JSON
 *       void://atmospheres/{id}/design.md        — Frost-only spec snapshot
 *   - 1 Tool (computation, readOnlyHint=true):
 *       void_validate_atmosphere(json)           — Safety Merge as a service
 *
 * Stdio hygiene: JSON-RPC owns stdout. Diagnostics go to stderr only.
 */

import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { McpError } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import {
  loadAtmospheres,
  loadFrostDesignMd,
  SPEC_DESIGN_MD_ID,
} from './data.js';
import { normalizeAtmosphere } from './safety-merge.js';

// JSON-RPC error code for resource-not-found per MCP spec 2025-06-18.
// Not present in SDK's ErrorCode enum; spec defines it as -32002.
const RESOURCE_NOT_FOUND = -32002;

function createServer(): McpServer {
  const server = new McpServer({
    name: 'void-energy',
    version: '0.1.0',
  });

  // -------------------------------------------------------------------------
  // Resource 1: void://atmospheres  (static URI, list of all atmospheres)
  // -------------------------------------------------------------------------
  server.registerResource(
    'void_atmosphere_list',
    'void://atmospheres',
    {
      title: 'Void Energy atmospheres (index)',
      description:
        'Lists every atmosphere registered in the Void Energy design system. Each entry has { id, label, mode, physics }. Read this first to discover what is available before reading a specific atmosphere via void://atmospheres/{id}.',
      mimeType: 'application/json',
    },
    async (uri) => {
      const snapshot = loadAtmospheres();
      const list = Object.values(snapshot).map(
        ({ id, label, mode, physics }) => ({
          id,
          label,
          mode,
          physics,
        }),
      );
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(list, null, 2),
          },
        ],
      };
    },
  );

  // -------------------------------------------------------------------------
  // Resource 2: void://atmospheres/{id}  (full token JSON for one atmosphere)
  // -------------------------------------------------------------------------
  server.registerResource(
    'void_atmosphere_tokens',
    new ResourceTemplate('void://atmospheres/{id}', {
      list: async () => {
        const snapshot = loadAtmospheres();
        return {
          resources: Object.values(snapshot).map((atmos) => ({
            uri: `void://atmospheres/${atmos.id}`,
            name: `void_atmosphere_tokens:${atmos.id}`,
            title: `${atmos.label} (${atmos.mode}, ${atmos.physics})`,
            description: `Full token JSON for the "${atmos.id}" atmosphere — palette, mode, physics, fonts.`,
            mimeType: 'application/json',
          })),
        };
      },
    }),
    {
      title: 'Void Energy atmosphere tokens',
      description:
        'Returns the full token definition for a single atmosphere — { id, label, mode, physics, tagline, palette, fonts }. Substitute {id} with a value from void://atmospheres (e.g. frost, graphite, meridian, terminal). Use this to read an atmosphere into agent context for any downstream design task.',
      mimeType: 'application/json',
    },
    async (uri, variables) => {
      const id = String(variables.id);
      const snapshot = loadAtmospheres();
      const atmos = snapshot[id];
      if (!atmos) {
        const known = Object.keys(snapshot).join(', ');
        throw new McpError(
          RESOURCE_NOT_FOUND,
          `Unknown atmosphere "${id}". Known atmospheres: ${known}. List all via void://atmospheres.`,
        );
      }
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(atmos, null, 2),
          },
        ],
      };
    },
  );

  // -------------------------------------------------------------------------
  // Resource 3: void://atmospheres/{id}/design.md  (Frost spec snapshot only)
  // -------------------------------------------------------------------------
  server.registerResource(
    'void_design_md',
    new ResourceTemplate('void://atmospheres/{id}/design.md', {
      list: async () => {
        const snapshot = loadAtmospheres();
        const frost = snapshot[SPEC_DESIGN_MD_ID];
        if (!frost) return { resources: [] };
        return {
          resources: [
            {
              uri: `void://atmospheres/${SPEC_DESIGN_MD_ID}/design.md`,
              name: `void_design_md:${SPEC_DESIGN_MD_ID}`,
              title: 'Void Energy DESIGN.md (Frost snapshot)',
              description:
                'Spec-compliant @google/design.md snapshot of the Frost atmosphere. Byte-identical to `npm run atmosphere-md -- spec-export`.',
              mimeType: 'text/markdown',
            },
          ],
        };
      },
    }),
    {
      title: 'Void Energy DESIGN.md spec snapshot',
      description:
        'Spec-compliant @google/design.md snapshot for an atmosphere. Currently available only for the canonical reference atmosphere "frost" (Arctic / Glass). Other ids return resource-not-found by design — for full token JSON of any atmosphere, use void://atmospheres/{id}.',
      mimeType: 'text/markdown',
    },
    async (uri, variables) => {
      const id = String(variables.id);
      if (id !== SPEC_DESIGN_MD_ID) {
        const snapshot = loadAtmospheres();
        const known = snapshot[id]
          ? `Atmosphere "${id}" exists, but spec-compliant DESIGN.md is currently a single-snapshot exporter scoped to "${SPEC_DESIGN_MD_ID}" by design. For full token data of "${id}", read void://atmospheres/${id} instead.`
          : `Unknown atmosphere "${id}". Known atmospheres: ${Object.keys(snapshot).join(', ')}.`;
        throw new McpError(
          RESOURCE_NOT_FOUND,
          `No design.md for "${id}". ${known}`,
        );
      }
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/markdown',
            text: loadFrostDesignMd(),
          },
        ],
      };
    },
  );

  // -------------------------------------------------------------------------
  // Tool: void_validate_atmosphere
  // -------------------------------------------------------------------------
  server.registerTool(
    'void_validate_atmosphere',
    {
      title: 'Validate a Void Energy atmosphere candidate',
      description:
        'Runs Void Energy Safety Merge against a candidate atmosphere JSON. Validates physics x mode constraints (glass+light auto-corrects to flat; retro+light forces dark), merges a partial palette over the mode-appropriate base, and returns { ok, errors, normalized }. Use before registering a generated or hand-authored atmosphere to surface constraint violations.',
      inputSchema: {
        json: z
          .record(z.string(), z.unknown())
          .describe(
            'Candidate atmosphere — { id?, label?, tagline?, mode, physics, palette, fonts? }. Palette may be partial; missing tokens fill from the mode-matched base atmosphere.',
          ),
      },
      annotations: {
        readOnlyHint: true,
        openWorldHint: false,
      },
    },
    async (args) => {
      const candidate = args.json;
      const snapshot = loadAtmospheres();
      const id =
        candidate &&
        typeof candidate === 'object' &&
        !Array.isArray(candidate) &&
        typeof (candidate as { id?: unknown }).id === 'string'
          ? (candidate as { id: string }).id
          : 'candidate';

      const result = normalizeAtmosphere(candidate, { snapshot, id });

      if (!result.ok) {
        const detail = result.errors.length
          ? result.errors.map((e) => `  - ${e}`).join('\n')
          : '  - (no specific issues collected)';
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text:
                `Atmosphere "${id}" failed Safety Merge.\n\n` +
                `Issues:\n${detail}\n\n` +
                `How to fix:\n` +
                `  1. Pass an object: { mode: "dark" | "light", physics: "glass" | "flat" | "retro", palette: { ... } }.\n` +
                `  2. Mode + physics must satisfy: glass requires dark; retro requires dark; flat works in both.\n` +
                `  3. Palette values must be non-empty CSS strings (hex, rgba, oklch, etc.). Missing keys are filled from the mode-matched base atmosphere.\n` +
                `  4. Read void://atmospheres/frost (dark base) or void://atmospheres/meridian (light base) for a complete reference palette.`,
            },
          ],
          structuredContent: {
            ok: false,
            errors: result.errors,
            normalized: null,
          },
        };
      }

      const normalizedJson = JSON.stringify(result.normalized, null, 2);
      const warningsText = result.errors.length
        ? `\nAuto-corrections applied:\n${result.errors.map((e) => `  - ${e}`).join('\n')}\n`
        : '';
      return {
        content: [
          {
            type: 'text',
            text:
              `Atmosphere "${id}" passed Safety Merge.${warningsText}\n` +
              `Normalized definition:\n${normalizedJson}`,
          },
        ],
        structuredContent: {
          ok: true,
          errors: result.errors,
          normalized: result.normalized,
        },
      };
    },
  );

  return server;
}

async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write('[void-energy-mcp] connected over stdio\n');
}

main().catch((err: unknown) => {
  process.stderr.write(`[void-energy-mcp] fatal: ${String(err)}\n`);
  process.exit(1);
});
