import { useEffect, useLayoutEffect, useRef } from 'react';
import type { ChangeEventHandler, RefObject } from 'react';

/** 入力は即座に追従し、映像デコーダーへのseekは描画フレームごとにまとめる。 */
export const useStudioRulerInput = (
  time: number,
  onSeek: (time: number) => void,
): {
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: ChangeEventHandler<HTMLInputElement>;
} => {
  const inputRef = useRef<HTMLInputElement>(null);
  const frame = useRef<number | null>(null);
  const requested = useRef(time);
  const callback = useRef(onSeek);
  useLayoutEffect(() => {
    callback.current = onSeek;
  }, [onSeek]);
  useLayoutEffect(() => {
    if (frame.current === null && inputRef.current)
      inputRef.current.value = String(time);
  }, [time]);
  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );
  return {
    inputRef,
    onChange: (event) => {
      requested.current = Number(event.currentTarget.value);
      if (frame.current !== null) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        callback.current(requested.current);
      });
    },
  };
};
