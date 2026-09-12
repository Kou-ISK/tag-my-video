import { primitiveColors } from './primitive';

export const elevationTokens = {
  none: 'none',
  subtle: `0 1px 2px ${primitiveColors.black}33`,
  overlay: `0 8px 24px ${primitiveColors.black}52`,
  focus: `0 0 0 3px ${primitiveColors.neonBlue}66`,
} as const;
