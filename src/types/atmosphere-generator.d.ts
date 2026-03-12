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

interface GenerateOptions {
  apiKey: string;
  vibe: string;
  physics?: PhysicsPreference;
  mode?: ModePreference;
  signal?: AbortSignal;
  existingIds?: ReadonlySet<string>;
}
