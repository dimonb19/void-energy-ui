import type { APIRoute } from 'astro';
import { z } from 'zod';
import { buildSystemPrompt, buildUserMessage } from '@lib/atmosphere-generator';
import { sendMessageWithMeta } from '@service/ai';

const RESPONSE_HEADERS = {
  'content-type': 'application/json',
  'cache-control': 'no-store',
};

const GenerateAtmosphereRequestSchema = z
  .object({
    vibe: z.string().trim().min(1).max(200),
    physics: z.enum(['glass', 'flat', 'retro']).optional(),
    mode: z.enum(['dark', 'light']).optional(),
    retry: z.boolean().optional(),
  })
  .strict()
  .superRefine(({ physics, mode }, ctx) => {
    if ((physics === 'glass' || physics === 'retro') && mode === 'light') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['mode'],
        message: 'Selected physics requires dark mode.',
      });
    }
  });

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: RESPONSE_HEADERS,
  });
}

export const POST: APIRoute = async ({ request }) => {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body.' }, 400);
  }

  const parsed = GenerateAtmosphereRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return jsonResponse(
      {
        error: 'Invalid request body.',
        issues: parsed.error.flatten().fieldErrors,
      },
      400,
    );
  }

  const { vibe, physics, mode, retry = false } = parsed.data;

  let meta: {
    result: AIResult;
    provider: AIProviderName;
    model: string;
  };
  try {
    meta = await sendMessageWithMeta(
      {
        system: buildSystemPrompt(),
        userContent: buildUserMessage(vibe, physics, mode, retry),
      },
      'ATMOSPHERE',
    );
  } catch (e: unknown) {
    // Config errors (missing API key, invalid provider) throw synchronously
    const message = e instanceof Error ? e.message : 'AI configuration error.';
    return jsonResponse({ error: message }, 500);
  }

  const { result, provider, model } = meta;

  if (!result.ok) {
    return jsonResponse({ error: result.message }, result.status);
  }

  const response: AIPipelineResponse = {
    text: result.text,
    provider,
    model,
  };

  return jsonResponse(response, 200);
};
