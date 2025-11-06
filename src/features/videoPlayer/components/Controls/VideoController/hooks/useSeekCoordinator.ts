import { useEffect, useRef } from 'react';

export const useSeekCoordinator = () => {
  const isSeekingRef = useRef(false);

  useEffect(() => {
    const handleSeekStart = () => {
      isSeekingRef.current = true;
    };
    const handleSeekEnd = () => {
      isSeekingRef.current = false;
    };

    window.addEventListener('video-seek-start', handleSeekStart);
    window.addEventListener('video-seek-end', handleSeekEnd);

    return () => {
      window.removeEventListener('video-seek-start', handleSeekStart);
      window.removeEventListener('video-seek-end', handleSeekEnd);
    };
  }, []);

  return isSeekingRef;
};
