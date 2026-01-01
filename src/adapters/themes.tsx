/*
 * ROLE: React adapter hook for the Triad Engine.
 * RESPONSIBILITY: Exposes atmosphere state and setters backed by the shared VoidEngine so React trees honor Triad attributes without duplicating logic.
 */

import { useEffect, useState } from 'react';
import { VoidEngine } from './void-engine'; // Adjust path if needed

// Singleton engine keeps Physics/Mode attributes consistent across React trees.
// We use the same global instance window.Void if it exists.
const voidEngine =
  typeof window !== 'undefined' && window.Void ? window.Void : new VoidEngine();

/**
 * React hook exposing atmosphere controls, user preferences, and derived config.
 */
export function useVoidTheme() {
  // We use a single state object to reduce re-renders and keep data consistent.
  const [voidState, setVoidState] = useState({
    atmosphere: voidEngine.atmosphere,
    userConfig: voidEngine.userConfig,
  });

  useEffect(() => {
    // Subscribe to Triad changes.
    // The engine now passes itself (the instance) to the callback.
    const unsubscribe = voidEngine.subscribe((engine: any) => {
      setVoidState({
        atmosphere: engine.atmosphere,
        // Spread the config to ensure React detects the object reference change
        userConfig: { ...engine.userConfig },
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Actions
  const setAtmosphere = (name: string) => {
    voidEngine.setAtmosphere(name);
  };

  const setFonts = (heading: string | null, body: string | null) => {
    voidEngine.setPreferences({ fontHeading: heading, fontBody: body });
  };

  const setScale = (scale: number) => {
    voidEngine.setPreferences({ scale });
  };

  return {
    // Reactive State
    atmosphere: voidState.atmosphere,
    userConfig: voidState.userConfig,

    // Derived Config (Physics/Mode) based on current atmosphere
    // This is synchronous and doesn't need its own state
    themeConfig: voidEngine.getConfig(voidState.atmosphere),

    // Actions
    setAtmosphere,
    setFonts,
    setScale,

    // Raw Engine Access (for advanced usage)
    raw: voidEngine,
  };
}

// Updated Reference Component
/*
export const ThemeSwitcher = () => {
  const { 
    atmosphere, 
    userConfig, 
    themeConfig, 
    setAtmosphere, 
    setScale 
  } = useVoidTheme();

  return (
    <div className="surface-glass pad-md flex-col gap-md">
      <div>
        <h3>Current: {atmosphere}</h3>
        <p className="text-dim">
          Physics: {themeConfig.physics} | Mode: {themeConfig.mode}
        </p>
        <p className="text-small">Scale: {Math.round(userConfig.scale * 100)}%</p>
      </div>
      
      <div className="flex-row gap-sm">
        <button onClick={() => setAtmosphere('void')}>Void</button>
        <button onClick={() => setAtmosphere('paper')}>Paper</button>
      </div>

      <div className="flex-row gap-sm">
        <button onClick={() => setScale(1.0)}>Standard</button>
        <button onClick={() => setScale(1.15)}>Large</button>
      </div>
    </div>
  );
};
*/
