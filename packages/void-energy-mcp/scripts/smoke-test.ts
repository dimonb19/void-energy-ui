/*
 * Stdio smoke test for @void-energy/mcp.
 *
 * Spawns dist/index.js as a child process, speaks JSON-RPC over stdio
 * exactly like an MCP client would, and exercises the 5 acceptance paths
 * from M7:
 *   1. resources/list  → all 3 resource templates visible
 *   2. resources/read void://atmospheres        → JSON list
 *   3. resources/read void://atmospheres/frost  → token JSON
 *   4. resources/read void://atmospheres/nonexistent-id → resource-not-found
 *   5. tools/call void_validate_atmosphere      → valid + invalid candidates
 *
 * Asserts the spec-shape of each response. Exits 0 on success, non-zero on
 * the first failure with a stderr diagnostic.
 */

import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PKG_ROOT = path.resolve(__dirname, '..');
const SERVER_PATH = path.join(PKG_ROOT, 'dist', 'index.js');

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

class StdioClient {
  private proc: ChildProcessWithoutNullStreams;
  private buffer = '';
  private nextId = 1;
  private pending = new Map<
    number,
    { resolve: (r: JsonRpcResponse) => void; reject: (e: Error) => void }
  >();
  stderr = '';
  stdoutNonJson = '';

  constructor(serverPath: string) {
    this.proc = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    this.proc.stdout.setEncoding('utf8');
    this.proc.stderr.setEncoding('utf8');
    this.proc.stdout.on('data', (chunk: string) => this.onStdout(chunk));
    this.proc.stderr.on('data', (chunk: string) => {
      this.stderr += chunk;
    });
    this.proc.on('error', (e) => {
      for (const { reject } of this.pending.values()) reject(e);
    });
  }

  private onStdout(chunk: string) {
    this.buffer += chunk;
    let idx;
    while ((idx = this.buffer.indexOf('\n')) >= 0) {
      const line = this.buffer.slice(0, idx).trim();
      this.buffer = this.buffer.slice(idx + 1);
      if (!line) continue;
      let parsed: JsonRpcResponse;
      try {
        parsed = JSON.parse(line);
      } catch {
        this.stdoutNonJson += line + '\n';
        continue;
      }
      if (typeof parsed.id === 'number' && this.pending.has(parsed.id)) {
        const handler = this.pending.get(parsed.id)!;
        this.pending.delete(parsed.id);
        handler.resolve(parsed);
      }
    }
  }

  request(method: string, params?: Record<string, unknown>): Promise<JsonRpcResponse> {
    const id = this.nextId++;
    const msg = JSON.stringify({ jsonrpc: '2.0', id, method, params });
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.proc.stdin.write(msg + '\n');
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`request "${method}" timed out`));
        }
      }, 5000);
    });
  }

  async close() {
    this.proc.stdin.end();
    await new Promise<void>((res) => {
      this.proc.on('exit', () => res());
      setTimeout(() => res(), 1000);
    });
  }
}

function fail(label: string, detail: unknown): never {
  process.stderr.write(`\n[smoke] FAIL ${label}\n${JSON.stringify(detail, null, 2)}\n`);
  process.exit(1);
}

function ok(label: string) {
  process.stdout.write(`[smoke] OK   ${label}\n`);
}

async function main() {
  const client = new StdioClient(SERVER_PATH);

  // MCP handshake.
  const init = await client.request('initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'void-energy-mcp-smoke', version: '0.0.0' },
  });
  if (init.error) fail('initialize', init);
  ok('initialize');

  // Required: notifications/initialized (one-way, no id).
  (client as unknown as { proc: { stdin: NodeJS.WritableStream } }).proc.stdin.write(
    JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n',
  );

  // 1. resources/list
  const list = await client.request('resources/list');
  if (list.error) fail('resources/list', list);
  const resources = (list.result as { resources?: unknown[] }).resources ?? [];
  if (!Array.isArray(resources) || resources.length === 0) {
    fail('resources/list returned empty resources array', list.result);
  }
  const uris = (resources as Array<{ uri: string }>).map((r) => r.uri);
  if (!uris.includes('void://atmospheres')) {
    fail('resources/list missing void://atmospheres', uris);
  }
  if (!uris.some((u) => u === 'void://atmospheres/frost')) {
    fail('resources/list missing void://atmospheres/frost', uris);
  }
  if (!uris.some((u) => u === 'void://atmospheres/frost/design.md')) {
    fail('resources/list missing void://atmospheres/frost/design.md', uris);
  }
  ok(`resources/list (${uris.length} resources)`);

  // 2. resources/read void://atmospheres
  const listRead = await client.request('resources/read', {
    uri: 'void://atmospheres',
  });
  if (listRead.error) fail('resources/read void://atmospheres', listRead);
  const lc = (listRead.result as { contents?: Array<{ text?: string; mimeType?: string }> })
    .contents;
  if (!lc || lc.length === 0 || !lc[0].text || lc[0].mimeType !== 'application/json') {
    fail('resources/read shape mismatch (atmospheres list)', listRead.result);
  }
  const parsedList = JSON.parse(lc[0].text!) as Array<{ id: string }>;
  if (!parsedList.some((a) => a.id === 'frost')) {
    fail('atmospheres list missing frost', parsedList);
  }
  ok(`resources/read void://atmospheres (${parsedList.length} atmospheres)`);

  // 3. resources/read void://atmospheres/frost
  const frostRead = await client.request('resources/read', {
    uri: 'void://atmospheres/frost',
  });
  if (frostRead.error) fail('resources/read void://atmospheres/frost', frostRead);
  const fc = (frostRead.result as { contents?: Array<{ text?: string; mimeType?: string }> })
    .contents;
  if (!fc || !fc[0].text || fc[0].mimeType !== 'application/json') {
    fail('resources/read shape mismatch (frost)', frostRead.result);
  }
  const parsedFrost = JSON.parse(fc[0].text!);
  if (parsedFrost.id !== 'frost' || !parsedFrost.palette) {
    fail('frost token JSON missing fields', parsedFrost);
  }
  ok('resources/read void://atmospheres/frost');

  // 3b. resources/read void://atmospheres/frost/design.md
  const designRead = await client.request('resources/read', {
    uri: 'void://atmospheres/frost/design.md',
  });
  if (designRead.error) fail('resources/read frost/design.md', designRead);
  const dc = (designRead.result as { contents?: Array<{ text?: string; mimeType?: string }> })
    .contents;
  if (!dc || !dc[0].text || dc[0].mimeType !== 'text/markdown') {
    fail('design.md shape mismatch', designRead.result);
  }
  if (!dc[0].text!.startsWith('---')) {
    fail('design.md does not start with frontmatter', dc[0].text!.slice(0, 80));
  }
  ok('resources/read void://atmospheres/frost/design.md');

  // 4. resources/read unknown id → error
  const missing = await client.request('resources/read', {
    uri: 'void://atmospheres/nonexistent-id',
  });
  if (!missing.error) {
    fail('expected resource-not-found for nonexistent-id', missing);
  }
  if (missing.error.code !== -32002) {
    fail('expected error code -32002, got', missing.error);
  }
  ok(`resources/read nonexistent-id → error ${missing.error.code}`);

  // 4b. design.md for non-frost id → error
  const nonFrostDesign = await client.request('resources/read', {
    uri: 'void://atmospheres/graphite/design.md',
  });
  if (!nonFrostDesign.error) {
    fail('expected resource-not-found for graphite/design.md', nonFrostDesign);
  }
  if (nonFrostDesign.error.code !== -32002) {
    fail('expected -32002 for non-frost design.md', nonFrostDesign.error);
  }
  ok(`resources/read graphite/design.md → error ${nonFrostDesign.error.code}`);

  // 5a. tools/call valid candidate
  const validCall = await client.request('tools/call', {
    name: 'void_validate_atmosphere',
    arguments: {
      json: {
        id: 'smoke-test-dark',
        mode: 'dark',
        physics: 'glass',
        palette: { 'energy-primary': '#7ec8e3' },
      },
    },
  });
  if (validCall.error) fail('tools/call valid', validCall);
  const validResult = validCall.result as {
    isError?: boolean;
    structuredContent?: { ok?: boolean; normalized?: unknown };
  };
  if (validResult.isError) fail('valid candidate marked isError', validCall.result);
  if (!validResult.structuredContent?.ok) {
    fail('valid candidate ok=false', validCall.result);
  }
  if (!validResult.structuredContent.normalized) {
    fail('valid candidate missing normalized', validCall.result);
  }
  ok('tools/call void_validate_atmosphere (valid)');

  // 5b. tools/call invalid candidate (bad physics)
  const invalidCall = await client.request('tools/call', {
    name: 'void_validate_atmosphere',
    arguments: {
      json: { mode: 'dark', physics: 'plasma', palette: {} },
    },
  });
  if (invalidCall.error) fail('tools/call invalid', invalidCall);
  const invalidResult = invalidCall.result as {
    isError?: boolean;
    content?: Array<{ text?: string }>;
  };
  if (!invalidResult.isError) {
    fail('invalid candidate not marked isError', invalidCall.result);
  }
  const text = invalidResult.content?.[0]?.text ?? '';
  if (!text.includes('How to fix')) {
    fail('invalid candidate missing didactic text', text);
  }
  ok('tools/call void_validate_atmosphere (invalid → didactic isError)');

  // Stdio hygiene: nothing on stdout other than valid JSON-RPC.
  if (client.stdoutNonJson.length > 0) {
    fail('stdout leaked non-JSON-RPC bytes', client.stdoutNonJson);
  }
  ok('stdio hygiene: stdout was JSON-RPC only');

  await client.close();
  process.stdout.write(`\n[smoke] PASS — all 5+ acceptance paths green\n`);
  process.exit(0);
}

main().catch((e: unknown) => {
  process.stderr.write(`[smoke] crashed: ${String(e)}\n`);
  process.exit(2);
});
