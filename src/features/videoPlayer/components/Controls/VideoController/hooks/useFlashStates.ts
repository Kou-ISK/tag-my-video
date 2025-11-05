import { useCallback, useEffect, useRef, useState } from 'react';

type FlashStates = Record<string, boolean>;

export const useFlashStates = () => {
  const [flashStates, setFlashStates] = useState<FlashStates>({});
  const flashTimeoutsRef = useRef<Record<string, number>>({});

  const triggerFlash = useCallback((key: string) => {
    if (!key) return;

    setFlashStates((prev) => ({
      ...prev,
      [key]: true,
    }));

    const existingTimeout = flashTimeoutsRef.current[key];
    if (existingTimeout) {
      window.clearTimeout(existingTimeout);
    }

    flashTimeoutsRef.current[key] = window.setTimeout(() => {
      setFlashStates((prev) => ({
        ...prev,
        [key]: false,
      }));
      delete flashTimeoutsRef.current[key];
    }, 220);
  }, []);

  useEffect(() => {
    return () => {
      Object.values(flashTimeoutsRef.current).forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      flashTimeoutsRef.current = {};
    };
  }, []);

  return { flashStates, triggerFlash };
};
