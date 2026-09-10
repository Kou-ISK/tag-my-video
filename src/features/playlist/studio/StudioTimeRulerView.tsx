import { useStudioRulerInput } from './useStudioRulerInput';
import type { ReactElement } from 'react';
import { Box } from '@mui/material';

/** 時間目盛りと同じ座標原点を使う、状態を持たないネイティブシーク入力。 */
export const StudioTimeRulerView = ({
  min,
  max,
  time,
  onSeek,
}: {
  min: number;
  max: number;
  time: number;
  onSeek: (time: number) => void;
}): ReactElement => {
  const input = useStudioRulerInput(time, onSeek);
  return (
    <Box sx={{ position: 'relative', height: 42, minWidth: 0 }}>
      {Array.from({ length: 5 }, (_, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            top: 8,
            left: `${index * 25}%`,
            height: 6,
            borderLeft: 1,
            borderColor: 'divider',
          }}
        >
          <Box
            component="span"
            sx={{
              position: 'absolute',
              top: 12,
              whiteSpace: 'nowrap',
              fontSize: 10,
              color: 'text.secondary',
              fontVariantNumeric: 'tabular-nums',
              transform:
                index === 0
                  ? 'none'
                  : index === 4
                    ? 'translateX(-100%)'
                    : 'translateX(-50%)',
            }}
          >
            {(min + ((max - min) * index) / 4).toFixed(1)}s
          </Box>
        </Box>
      ))}
      <Box
        sx={{
          position: 'absolute',
          left: -4,
          top: 0,
          width: 'calc(100% + 8px)',
          '& input': {
            appearance: 'none',
            display: 'block',
            width: '100%',
            height: 24,
            m: 0,
            p: 0,
            bgcolor: 'transparent',
            cursor: 'ew-resize',
            '&::-webkit-slider-thumb': {
              appearance: 'none',
              width: 8,
              height: 12,
              borderRadius: '1px',
              bgcolor: 'primary.main',
            },
            '&::-moz-range-thumb': {
              width: 8,
              height: 12,
              border: 0,
              borderRadius: '1px',
              bgcolor: 'primary.main',
            },
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.main',
              outlineOffset: 1,
            },
          },
        }}
      >
        <input
          type="range"
          aria-label="描画タイムラインの再生位置"
          min={min}
          max={Math.max(min + 0.001, max)}
          step={0.01}
          ref={input.inputRef}
          defaultValue={Math.max(min, Math.min(max, time))}
          onChange={input.onChange}
        />
      </Box>
    </Box>
  );
};
