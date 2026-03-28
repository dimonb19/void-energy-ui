// ── Anthropic Provider ────────────────────────────────────────────────────────
// Sends single-turn messages via the Anthropic Messages API.
// Extracts text from the content[] envelope and returns a normalized AIResult.

const API_URL = 'https://api.anthropic.com/v1/messages';
const API_VERSION = '2023-06-01';
const DEFAULT_MAX_TOKENS = 2048;

export const anthropicProvider: AIProvider = async (config, request) => {
  let response: Response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': API_VERSION,
      },
      body: JSON.stringify({
        model: request.model ?? config.model,
        max_tokens: request.maxTokens ?? DEFAULT_MAX_TOKENS,
        system: request.system,
        messages: [{ role: 'user', content: request.userContent }],
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

  let body: { content?: Array<{ type: string; text?: string }> };
  try {
    body = await response.json();
  } catch {
    return {
      ok: false,
      status: 502,
      message: 'Failed to parse provider response.',
    };
  }

  const textBlock = body.content?.find((b) => b.type === 'text');
  if (!textBlock?.text) {
    return {
      ok: false,
      status: 502,
      message: 'Provider response contained no text.',
    };
  }

  return { ok: true, text: textBlock.text };
};
