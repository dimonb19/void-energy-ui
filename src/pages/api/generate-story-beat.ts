import type { APIRoute } from 'astro';
import { z } from 'zod';
import { resolveAIConfig } from '@service/ai-config';
import { buildSystemPrompt, buildUserPrompt } from '@service/beat-prompts';
import { STORY_BEAT_TOOL_INPUT_SCHEMA } from '@service/beat-tool-schema';
import { parseStoryBeat } from '@lib/story-beat-schema';
import type { StoryBeat } from '@lib/story-beat-types';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const TOOL_NAME = 'emit_story_beat';
const MAX_TOKENS = 1536;

const RESPONSE_HEADERS = {
  'content-type': 'application/json',
  'cache-control': 'no-store',
};

const GenerateBeatRequestSchema = z
  .object({
    recentTitles: z.array(z.string().min(1).max(64)).max(32).optional(),
  })
  .strict();

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: RESPONSE_HEADERS,
  });
}

interface AnthropicToolUseBlock {
  type: 'tool_use';
  name: string;
  input: unknown;
}
interface AnthropicResponseBody {
  content?: Array<{ type: string } & Partial<AnthropicToolUseBlock>>;
}

async function callAnthropic(options: {
  apiKey: string;
  model: string;
  system: string;
  userContent: string;
}): Promise<
  | { ok: true; beat: StoryBeat }
  | { ok: false; status: number; message: string; issues?: string[] }
> {
  const { apiKey, model, system, userContent } = options;

  let response: Response;
  try {
    response = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model,
        max_tokens: MAX_TOKENS,
        system,
        tools: [
          {
            name: TOOL_NAME,
            description:
              'Emit a fresh vibe — text, full palette theme, ambient layers, kinetic treatment.',
            input_schema: STORY_BEAT_TOOL_INPUT_SCHEMA,
          },
        ],
        tool_choice: { type: 'tool', name: TOOL_NAME },
        messages: [{ role: 'user', content: userContent }],
      }),
    });
  } catch {
    return { ok: false, status: 502, message: 'Upstream AI request failed.' };
  }

  if (!response.ok) {
    let message: string;
    try {
      const body = await response.json();
      message = body?.error?.message ?? `Provider error (${response.status}).`;
    } catch {
      message = `Provider error (${response.status}).`;
    }
    return { ok: false, status: response.status, message };
  }

  let body: AnthropicResponseBody;
  try {
    body = (await response.json()) as AnthropicResponseBody;
  } catch {
    return {
      ok: false,
      status: 502,
      message: 'Failed to parse provider response.',
    };
  }

  const toolBlock = body.content?.find(
    (b): b is AnthropicToolUseBlock =>
      b.type === 'tool_use' && b.name === TOOL_NAME,
  );
  if (!toolBlock) {
    return {
      ok: false,
      status: 502,
      message: 'Provider did not call the emit_story_beat tool.',
    };
  }

  const parsed = parseStoryBeat(toolBlock.input, 'generate-story-beat');
  if (!parsed.ok) {
    return {
      ok: false,
      status: 502,
      message: parsed.error.message,
      issues: parsed.error.issues,
    };
  }

  return { ok: true, beat: parsed.data };
}

/**
 * POST /api/generate-story-beat
 *
 * Body: { recentTitles?: string[] }
 * Returns: { beat: StoryBeat } on success, { error, issues? } on failure.
 *
 * Calls Anthropic with tool-use (guaranteed JSON), Zod-validates the emitted
 * object, and retries once if the first response fails validation. All
 * provider errors are normalized into a `{ error, status }` body so the
 * browser client can surface them uniformly via toast.
 */
export const POST: APIRoute = async ({ request }) => {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body.' }, 400);
  }

  const parsedRequest = GenerateBeatRequestSchema.safeParse(rawBody);
  if (!parsedRequest.success) {
    return jsonResponse(
      {
        error: 'Invalid request body.',
        issues: parsedRequest.error.flatten().fieldErrors,
      },
      400,
    );
  }

  let config: ReturnType<typeof resolveAIConfig>;
  try {
    config = resolveAIConfig('BEAT');
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'AI configuration error.';
    return jsonResponse({ error: message }, 500);
  }

  if (config.provider !== 'anthropic') {
    return jsonResponse(
      {
        error:
          'Story beat generation requires the Anthropic provider (tool-use JSON mode).',
      },
      500,
    );
  }

  const { recentTitles = [] } = parsedRequest.data;
  const system = buildSystemPrompt();
  const userContent = buildUserPrompt(recentTitles);

  // One retry on validation failure — the LLM occasionally emits an
  // out-of-range intensity or an incomplete palette; re-rolling almost
  // always fixes it.
  let attempt = await callAnthropic({
    apiKey: config.apiKey,
    model: config.model,
    system,
    userContent,
  });

  if (!attempt.ok && attempt.status === 502 && attempt.issues) {
    attempt = await callAnthropic({
      apiKey: config.apiKey,
      model: config.model,
      system,
      userContent,
    });
  }

  if (!attempt.ok) {
    return jsonResponse(
      { error: attempt.message, issues: attempt.issues },
      attempt.status,
    );
  }

  return jsonResponse({ beat: attempt.beat }, 200);
};
