interface FontDefinition {
  family: string;
  files: Record<number, string>;
  /** Override DEFAULT_PRELOAD_WEIGHTS if this font needs different preload behavior */
  preloadWeights?: number[];
}
