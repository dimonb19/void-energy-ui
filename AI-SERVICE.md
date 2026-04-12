# AI Pipelines

Server-side AI integration for Void Energy UI. Provider-agnostic — swap between Anthropic, OpenAI, Groq, Together, OpenRouter, or any OpenAI-compatible API by changing environment variables.

---

## Quick Start

1. Copy `.env.example` to `.env`
2. Set your API key:

```env
# For Anthropic (default)
ANTHROPIC_API_KEY=sk-ant-...

# — OR — for OpenAI / compatible providers
AI_PROVIDER=openai-compatible
AI_API_KEY=sk-...
# AI_BASE_URL=https://api.groq.com/openai/v1   # optional, defaults to OpenAI
```

3. Run `npm run dev` — the `/api/generate-atmosphere` endpoint is ready.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT (browser)                                           │
│                                                             │
│  src/lib/atmosphere-generator.ts                            │
│    ├── buildSystemPrompt()     prompt engineering            │
│    ├── buildUserMessage()      user message construction     │
│    ├── generateAtmosphere()    calls /api route, parses text │
│    └── parseResponse()         validates domain output       │
│                                                             │
│  fetch('/api/generate-atmosphere', { vibe, physics, mode }) │
└─────────────────────┬───────────────────────────────────────┘
                      │  POST JSON
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  API ROUTE (server)                                         │
│                                                             │
│  src/pages/api/generate-atmosphere.ts                       │
│    ├── Zod validation (request body)                        │
│    ├── Prompt assembly (system + user message)              │
│    └── Calls sendMessageWithMeta() from AI facade           │
│                                                             │
│  Returns: { text, provider, model }                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  AI FACADE (server)                                         │
│                                                             │
│  src/service/ai.ts                                          │
│    ├── sendMessage(request, pipeline?)     → AIResult       │
│    └── sendMessageWithMeta(request, pipe?) → AIResult+meta  │
│                                                             │
│  src/service/ai-config.ts                                   │
│    └── resolveAIConfig(pipeline?)  → AIConfig               │
│        Env precedence: PIPELINE_AI_* → AI_* → defaults      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  PROVIDERS (server)                                         │
│                                                             │
│  src/service/providers/anthropic.ts                          │
│    └── Anthropic Messages API → extracts content[].text      │
│                                                             │
│  src/service/providers/openai-compatible.ts                   │
│    └── /v1/chat/completions → extracts choices[].message      │
│        Works with: OpenAI, Groq, Together, OpenRouter, etc.  │
└─────────────────────────────────────────────────────────────┘
```

**Key principle:** The API route returns `{ text, provider, model }` — a stable contract. The client never sees provider-specific JSON. Domain parsing (theme validation, palette construction) happens client-side.

---

## Environment Variables

### Global Defaults

| Variable | Default | Description |
|---|---|---|
| `AI_PROVIDER` | `anthropic` | `anthropic` or `openai-compatible` |
| `AI_MODEL` | `claude-sonnet-4-6` (Anthropic) / `gpt-4o` (OpenAI) | Model ID for the selected provider |
| `ANTHROPIC_API_KEY` | — | Required when provider is `anthropic` |
| `AI_API_KEY` | — | Required when provider is `openai-compatible` (covers OpenAI, Groq, Together, OpenRouter, Mistral, etc.) |
| `AI_BASE_URL` | `https://api.openai.com/v1` | Base URL for OpenAI-compatible providers |

### Per-Pipeline Overrides

Any pipeline can override global defaults by prefixing with the pipeline name:

| Variable | Overrides |
|---|---|
| `ATMOSPHERE_AI_PROVIDER` | `AI_PROVIDER` for atmosphere generation |
| `ATMOSPHERE_AI_MODEL` | `AI_MODEL` for atmosphere generation |

Precedence: `{PIPELINE}_AI_*` → `AI_*` → built-in defaults.

### Common Provider Configurations

```env
# Anthropic (default)
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI
AI_PROVIDER=openai-compatible
AI_API_KEY=sk-...
AI_MODEL=gpt-4o

# Groq (fast inference)
AI_PROVIDER=openai-compatible
AI_API_KEY=gsk_...
AI_BASE_URL=https://api.groq.com/openai/v1
AI_MODEL=llama-3.1-70b-versatile

# Together AI
AI_PROVIDER=openai-compatible
AI_API_KEY=...
AI_BASE_URL=https://api.together.xyz/v1
AI_MODEL=meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo

# OpenRouter (access multiple providers)
AI_PROVIDER=openai-compatible
AI_API_KEY=sk-or-...
AI_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL=anthropic/claude-sonnet-4-6
```

---

## Adding a New Pipeline

Each AI feature gets its own API route. The route owns input validation and prompt assembly; the shared facade handles provider selection.

### Step-by-step

**1. Define the route** in `src/pages/api/your-pipeline.ts`:

```typescript
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { sendMessageWithMeta } from '@service/ai';

const RequestSchema = z.object({
  prompt: z.string().trim().min(1).max(500),
});

export const POST: APIRoute = async ({ request }) => {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body.' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const parsed = RequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        error: 'Invalid request body.',
        issues: parsed.error.flatten().fieldErrors,
      }),
      { status: 400, headers: { 'content-type': 'application/json' } },
    );
  }

  let meta;
  try {
    meta = await sendMessageWithMeta(
      {
        system: 'You are a helpful assistant for...',
        userContent: parsed.data.prompt,
      },
      'YOUR_PIPELINE', // enables YOUR_PIPELINE_AI_PROVIDER / YOUR_PIPELINE_AI_MODEL overrides
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'AI configuration error.';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  const { result, provider, model } = meta;

  if (!result.ok) {
    return new Response(JSON.stringify({ error: result.message }), {
      status: result.status,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({ text: result.text, provider, model }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );
};
```

**2. Call it from the client:**

```typescript
const response = await fetch('/api/your-pipeline', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ prompt: 'user input here' }),
});

const { text, error } = await response.json();
if (error) {
  // handle error
}
// parse and use `text`
```

**3. Optionally override the provider** for this pipeline:

```env
YOUR_PIPELINE_AI_PROVIDER=openai-compatible
YOUR_PIPELINE_AI_MODEL=gpt-4o-mini
```

---

## Adding a New Provider

If you need a provider that doesn't follow the Anthropic or OpenAI-compatible wire format:

**1. Create the provider** in `src/service/providers/your-provider.ts`:

```typescript
export const yourProvider: AIProvider = async (config, request) => {
  // 1. Build the request for your provider's API
  // 2. Send it via fetch
  // 3. Extract the text from the response
  // 4. Return { ok: true, text } or { ok: false, status, message }
};
```

The `AIProvider` type signature: `(config: AIConfig, request: AIRequest) => Promise<AIResult>`

**2. Register it** in `src/service/ai.ts`:

```typescript
import { yourProvider } from './providers/your-provider';

const PROVIDERS: Record<AIProviderName, AIProvider> = {
  anthropic: anthropicProvider,
  'openai-compatible': openaiCompatibleProvider,
  'your-provider': yourProvider,  // add here
};
```

**3. Add the provider name** to the `AIProviderName` type in `src/types/ai.d.ts`:

```typescript
type AIProviderName = 'anthropic' | 'openai-compatible' | 'your-provider';
```

**4. Add default model** in `src/service/ai-config.ts`:

```typescript
const DEFAULT_MODELS: Record<AIProviderName, string> = {
  anthropic: 'claude-sonnet-4-6',
  'openai-compatible': 'gpt-4o',
  'your-provider': 'default-model-id',
};
```

---

## File Map

```
src/
  service/
    ai.ts                          Unified facade (sendMessage, sendMessageWithMeta)
    ai-config.ts                   Config resolver (env vars, precedence, validation)
    providers/
      anthropic.ts                 Anthropic Messages API provider
      openai-compatible.ts         OpenAI-compatible provider (GPT, Groq, Together, etc.)
  pages/api/
    generate-atmosphere.ts         Atmosphere generation endpoint
  lib/
    atmosphere-generator.ts        Client-side prompt engineering + response parsing
  types/
    ai.d.ts                        Ambient type declarations (AIConfig, AIResult, etc.)
```

```
tests/
  ai-config.test.ts                Config resolver tests (precedence, missing keys, fallbacks)
  ai-providers.test.ts             Provider tests (Anthropic + OpenAI wire format)
  generate-atmosphere-api.test.ts  Route tests (normalized contract, validation)
  atmosphere-generator.test.ts     Domain tests (prompt construction, response parsing)
```

---

## Design Decisions

**Why raw `fetch` instead of SDKs?** Zero dependencies, full control, trivial to understand. The Anthropic and OpenAI SDKs add bundle weight and abstractions we don't need for single-turn messages.

**Why domain-specific routes instead of a generic `/api/ai`?** Each pipeline has unique validation, prompt engineering, and error handling. A generic proxy would push all that complexity to the client.

**Why text extraction on the server?** The route returns `{ text }`, not provider-specific JSON. This means the client never needs to know which provider is active — swap from Claude to GPT by changing one env var.

**Why `openai-compatible` instead of separate `openai`, `groq`, `together` providers?** They all implement the same `/v1/chat/completions` wire format. One adapter with a configurable `baseUrl` covers them all.
