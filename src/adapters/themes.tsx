import { useEffect, useState } from 'react';
import { VoidEngine } from './void-engine';

// Create a singleton instance outside the hook to share state across components
// This ensures that if Component A changes the theme, Component B updates too.
const voidEngine = new VoidEngine();

/**
 * React Hook for Void Energy UI
 * Usage:
 * const { atmosphere, setAtmosphere, config } = useVoidTheme();
 */
export function useVoidTheme() {
  const [atmosphere, setAtmosState] = useState<string>(voidEngine.atmosphere);

  useEffect(() => {
    // Subscribe to the engine.
    // The engine's subscribe method returns a cleanup function automatically.
    const unsubscribe = voidEngine.subscribe((newAtmos) => {
      setAtmosState(newAtmos);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const setAtmosphere = (name: string) => {
    voidEngine.setAtmosphere(name);
  };

  return {
    atmosphere,
    setAtmosphere,
    // Helper to get physics/mode without importing the engine manually
    config: voidEngine.getConfig(atmosphere),
  };
}

// --- EXAMPLE USAGE COMPONENT ---
/*
export const ThemeSwitcher = () => {
  const { atmosphere, setAtmosphere, config } = useVoidTheme();

  return (
    <div className="card-glass pad-md">
      <h3>Current: {atmosphere}</h3>
      <p className="text-dim">
        Physics: {config.physics} | Mode: {config.mode}
      </p>
      
      <div className="flex-row gap-sm">
        <button onClick={() => setAtmosphere('void')}>Void</button>
        <button onClick={() => setAtmosphere('paper')}>Paper</button>
        <button onClick={() => setAtmosphere('terminal')}>Terminal</button>
      </div>
    </div>
  );
};
*/
