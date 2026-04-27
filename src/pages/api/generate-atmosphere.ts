import type { APIRoute } from 'astro';
import { z } from 'zod';
import {
  buildSystemPrompt,
  buildUserMessage,
  buildUrlUserMessage,
} from '@lib/atmosphere-generator';
import { sendMessageWithMeta } from '@service/ai';

const RESPONSE_HEADERS = {
  'content-type': 'application/json',
  'cache-control': 'no-store',
};

const VIBE_MAX = 200;
const URL_MAX = 2048;

const GenerateAtmosphereRequestSchema = z
  .object({
    source: z.enum(['vibe', 'url']).default('vibe'),
    vibe: z.string().trim().min(1).max(URL_MAX),
    physics: z.enum(['glass', 'flat', 'retro']).optional(),
    mode: z.enum(['dark', 'light']).optional(),
    retry: z.boolean().optional(),
  })
  .strict()
  .superRefine(({ source, vibe, physics, mode }, ctx) => {
    if ((physics === 'glass' || physics === 'retro') && mode === 'light') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['mode'],
        message: 'Selected physics requires dark mode.',
      });
    }
    if (source === 'vibe' && vibe.length > VIBE_MAX) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['vibe'],
        message: `Vibe text exceeds ${VIBE_MAX} characters.`,
      });
    }
  });

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: RESPONSE_HEADERS,
  });
}

function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const candidate = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  if (!URL.canParse(candidate)) return null;
  const u = new URL(candidate);
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
  if (!u.hostname.includes('.')) return null;
  return u.href;
}

function isPrivateAddress(urlString: string): boolean {
  const u = new URL(urlString);
  const host = u.hostname.toLowerCase();
  if (
    host === 'localhost' ||
    host.endsWith('.local') ||
    host.endsWith('.internal')
  ) {
    return true;
  }
  if (/^127\./.test(host)) return true;
  if (/^10\./.test(host)) return true;
  if (/^192\.168\./.test(host)) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)) return true;
  if (/^169\.254\./.test(host)) return true;
  if (host === '::1' || host === '[::1]') return true;
  if (host.startsWith('fe80:') || host.startsWith('[fe80:')) return true;
  return false;
}

async function fetchBrandHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'user-agent': 'VoidEnergyBot/1.0 (+brand-extraction)',
      accept: 'text/html,application/xhtml+xml',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`site returned ${res.status}`);
  const ct = res.headers.get('content-type') ?? '';
  if (!ct.toLowerCase().includes('html')) throw new Error('not an HTML page');
  const html = await res.text();
  return html.slice(0, 200_000);
}

function extractBrandContext(html: string): string {
  const lines: string[] = [];

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) lines.push(`Title: ${titleMatch[1].trim()}`);

  const desiredMetas = new Set([
    'description',
    'og:title',
    'og:description',
    'og:site_name',
    'twitter:title',
    'twitter:description',
    'theme-color',
    'application-name',
  ]);
  const metaPattern =
    /<meta[^>]+(?:name|property)=["']([^"']+)["'][^>]*content=["']([^"']+)["']/gi;
  for (const m of html.matchAll(metaPattern)) {
    const name = m[1].toLowerCase();
    if (desiredMetas.has(name)) {
      lines.push(`Meta ${name}: ${m[2].trim().slice(0, 300)}`);
    }
  }

  const headingPattern = /<(h1|h2)[^>]*>([\s\S]*?)<\/\1>/gi;
  const headings = [...html.matchAll(headingPattern)]
    .slice(0, 6)
    .map((m) =>
      m[2]
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter((s) => s.length > 0 && s.length < 200);
  if (headings.length) lines.push(`Headings: ${headings.join(' | ')}`);

  const styleBlocks = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((m) => m[1])
    .join('\n');

  const colorPattern =
    /(#[0-9a-f]{3,8}\b|rgba?\([^)]+\)|hsla?\([^)]+\)|oklch\([^)]+\))/gi;
  const colors = [
    ...new Set(
      [...styleBlocks.matchAll(colorPattern)].map((m) => m[0].toLowerCase()),
    ),
  ].slice(0, 30);
  if (colors.length) {
    lines.push(`Colors found in inline CSS: ${colors.join(', ')}`);
  }

  const fontPattern = /font-family\s*:\s*([^;}\n]+)/gi;
  const fonts = [
    ...new Set(
      [...styleBlocks.matchAll(fontPattern)].map((m) =>
        m[1].trim().slice(0, 80),
      ),
    ),
  ].slice(0, 10);
  if (fonts.length) {
    lines.push(`Font families in inline CSS: ${fonts.join(' | ')}`);
  }

  return lines.join('\n').slice(0, 6000);
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

  const { source, vibe, physics, mode, retry = false } = parsed.data;

  let userContent: string;
  if (source === 'url') {
    const normalized = normalizeUrl(vibe);
    if (!normalized) {
      return jsonResponse({ error: 'Invalid URL.' }, 400);
    }
    if (isPrivateAddress(normalized)) {
      return jsonResponse(
        { error: 'Private and loopback addresses are not allowed.' },
        400,
      );
    }

    let html: string;
    try {
      html = await fetchBrandHtml(normalized);
    } catch (e: unknown) {
      const detail = e instanceof Error ? e.message : 'unknown error';
      return jsonResponse(
        { error: `Could not load that URL (${detail}).` },
        502,
      );
    }

    const brandContext = extractBrandContext(html);
    if (!brandContext) {
      return jsonResponse(
        { error: 'No usable brand signal in that page.' },
        422,
      );
    }

    userContent = buildUrlUserMessage(
      normalized,
      brandContext,
      physics,
      mode,
      retry,
    );
  } else {
    userContent = buildUserMessage(vibe, physics, mode, retry);
  }

  let meta: {
    result: AIResult;
    provider: AIProviderName;
    model: string;
  };
  try {
    meta = await sendMessageWithMeta(
      {
        system: buildSystemPrompt(),
        userContent,
      },
      'ATMOSPHERE',
    );
  } catch (e: unknown) {
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
