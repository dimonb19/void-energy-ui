import { describe, expect, it } from 'vitest';
import {
  buildSystemPrompt,
  buildUserPrompt,
} from '../src/service/beat-prompts';

describe('buildSystemPrompt', () => {
  it('derives enum lists from the shared literal tuples', () => {
    const prompt = buildSystemPrompt();
    // A spot-check of values from each derived union — if the tuples drift, so does the prompt.
    expect(prompt).toContain('"rain"');
    expect(prompt).toContain('"fog"');
    expect(prompt).toContain('"danger"');
    expect(prompt).toContain('"filmGrain"');
    expect(prompt).toContain('"scramble"');
    expect(prompt).toContain('"breathe"');
    expect(prompt).toContain('"slow"');
  });

  it('documents the tool contract by name', () => {
    expect(buildSystemPrompt()).toContain('emit_story_beat');
  });

  it('does not mention choices — the contract dropped them', () => {
    expect(buildSystemPrompt()).not.toMatch(/choices/i);
  });

  it('does not mention theme, palette, or physics — theme application was dropped', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).not.toMatch(/\bpalette\b/i);
    expect(prompt).not.toMatch(/physics/i);
    expect(prompt).not.toMatch(/`theme`/i);
  });

  it('caps oneShots and actions at 3, not 4 — dense moments dilute the sync', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('2–3 entries');
    expect(prompt).toContain('NEVER more than 3');
    expect(prompt).not.toMatch(/2[–-]4 entries/);
  });

  it('documents the anchoring contract with hard filter + bad/good examples', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toMatch(/Anchoring contract/);
    expect(prompt).toMatch(/concrete sensory noun\/verb\/adjective/);
    // Explicit examples of disallowed parts of speech.
    expect(prompt).toMatch(/articles/i);
    expect(prompt).toMatch(/prepositions/i);
    expect(prompt).toMatch(/pronouns/i);
    // Inline ❌/✅ examples anchor the rule.
    expect(prompt).toContain('❌');
    expect(prompt).toContain('✅');
  });

  it('documents the climax rule — overlapping oneShot + action in the final sentence', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toMatch(/climax/i);
    expect(prompt).toMatch(/SAME `atWord`/);
    expect(prompt).toMatch(/final sentence/);
  });
});

describe('buildUserPrompt', () => {
  it('returns the fresh-vibe instruction when no recent titles are given', () => {
    const out = buildUserPrompt([]);
    expect(out).toMatch(/fresh vibe/i);
  });

  it('lists recent titles and asks for a different vibe', () => {
    const out = buildUserPrompt(['Static Garden', 'Kitchen at Dawn']);
    expect(out).toContain('Static Garden');
    expect(out).toContain('Kitchen at Dawn');
    expect(out).toMatch(/different/i);
  });

  it('collapses earlier titles beyond the cap', () => {
    const many = Array.from({ length: 15 }, (_, i) => `Vibe ${i}`);
    const out = buildUserPrompt(many);
    expect(out).toMatch(/earlier titles omitted/i);
    // Last 10 kept verbatim, first 5 collapsed.
    expect(out).toContain('Vibe 5');
    expect(out).toContain('Vibe 14');
    expect(out).not.toContain('Vibe 0');
    expect(out).not.toContain('Vibe 4');
  });
});
