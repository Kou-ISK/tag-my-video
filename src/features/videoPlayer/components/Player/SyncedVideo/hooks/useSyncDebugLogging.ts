import { useEffect, useRef } from 'react';

interface SyncDebugLoggingParams {
  enabled: boolean;
  primaryClock: number;
  offset: number;
  analyzed: boolean;
  activePlayers: number;
}

export const useSyncDebugLogging = ({
  enabled,
  primaryClock,
  offset,
  analyzed,
  activePlayers,
}: SyncDebugLoggingParams) => {
  const lastLoggedAtRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const now = Date.now();
    if (now - lastLoggedAtRef.current < 1000) {
      return;
    }

    lastLoggedAtRef.current = now;
    console.debug(
      `[useSyncPlayback] clock=${primaryClock.toFixed(
        3,
      )} offset=${offset.toFixed(3)} analyzed=${analyzed} players=${activePlayers}`,
    );
  }, [enabled, primaryClock, offset, analyzed, activePlayers]);
};
