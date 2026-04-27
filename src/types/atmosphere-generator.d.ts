interface GeneratedAtmosphere {
  id: string;
  label: string;
  tagline: string;
  definition: {
    mode: 'dark' | 'light';
    physics: 'glass' | 'flat' | 'retro';
    label: string;
    tagline: string;
    palette: Record<string, string>;
  };
}

type PhysicsPreference = 'glass' | 'flat' | 'retro';
type ModePreference = 'dark' | 'light';
type GenerateSource = 'vibe' | 'url';

interface GenerateOptions {
  /** Discriminator for input interpretation. Defaults to 'vibe' on the server. */
  source?: GenerateSource;
  /** Vibe description (when source='vibe') or URL string (when source='url'). */
  vibe: string;
  physics?: PhysicsPreference;
  mode?: ModePreference;
  /** When true, randomizes physics/mode/tone for maximum variety (used by "Try Another"). */
  retry?: boolean;
  signal?: AbortSignal;
  existingIds?: ReadonlySet<string>;
}
