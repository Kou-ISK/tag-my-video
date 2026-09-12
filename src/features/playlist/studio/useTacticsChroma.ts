import { useState } from 'react';
import { readVideoGrassKey } from './readVideoGrassKey';
import type { ChromaKey } from '../../../shared/tactics/chromaKey';
export interface TacticsChromaProps {
  value?: ChromaKey;
  error: string;
  disabled: boolean;
  onExtract: () => void;
  onChange: (value: ChromaKey | undefined) => void;
}
export const useTacticsChroma = (
  value: ChromaKey | undefined,
  disabled: boolean,
  video: () => HTMLVideoElement | null,
  onChange: (value: ChromaKey | undefined) => void,
): TacticsChromaProps => {
  const [error, setError] = useState('');
  return {
    value,
    error,
    disabled,
    onChange,
    onExtract: () => {
      if (disabled) return;
      try {
        onChange(readVideoGrassKey(video()));
        setError('');
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : '芝色を取得できませんでした。',
        );
      }
    },
  };
};
