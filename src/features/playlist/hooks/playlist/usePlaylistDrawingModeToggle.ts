import { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
interface Params {
  isDrawingMode: boolean;
  setIsDrawingMode: Dispatch<SetStateAction<boolean>>;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
}
// Completed gestures already commit through onObjectsChange. Re-reading hidden
// canvases here could overwrite the other angle or rebase embedded times twice.
export const usePlaylistDrawingModeToggle = ({
  isDrawingMode,
  setIsDrawingMode,
  setIsPlaying,
}: Params): (() => void) =>
  useCallback(() => {
    setIsDrawingMode(!isDrawingMode);
    if (!isDrawingMode) setIsPlaying(false);
  }, [isDrawingMode, setIsDrawingMode, setIsPlaying]);
