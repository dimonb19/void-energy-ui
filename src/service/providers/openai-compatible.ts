// ── OpenAI-Compatible Provider ────────────────────────────────────────────────
// Covers OpenAI, Groq, Together, OpenRouter, Mistral, and any API that
// implements the /v1/chat/completions shape.
// Extracts text from choices[].message.content and returns a normalized AIResult.

const DEFAULT_MAX_TOKENS = 2048;

export const openaiCompatibleProvider: AIProvider = async (config, request) => {
  const baseUrl = config.baseUrl ?? 'https://api.openai.com/v1';
  const url = `${baseUrl}/chat/completions`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model ?? config.model,
        max_tokens: request.maxTokens ?? DEFAULT_MAX_TOKENS,
        messages: [
          { role: 'system', content: request.system },
          { role: 'user', content: request.userContent },
        ],
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

  let body: {
    choices?: Array<{ message?: { content?: string } }>;
  };
  try {
    body = await response.json();
  } catch {
    return {
      ok: false,
      status: 502,
      message: 'Failed to parse provider response.',
    };
  }

  const text = body.choices?.[0]?.message?.content;
  if (!text) {
    return {
      ok: false,
      status: 502,
      message: 'Provider response contained no text.',
    };
  }

  return { ok: true, text };
};
