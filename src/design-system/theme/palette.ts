import type { PaletteOptions } from '@mui/material/styles';
import { primitiveColors } from '../tokens/primitive';
import {
  createSemanticTokens,
  type DesignSystemMode,
} from '../tokens/semantic';

export const buildPalette = (mode: DesignSystemMode): PaletteOptions => {
  const tokens = createSemanticTokens(mode);

  return {
    mode,
    background: {
      default: tokens.surface.canvas,
      paper: tokens.surface.work,
    },
    text: {
      primary: tokens.content.primary,
      secondary: tokens.content.secondary,
      disabled: tokens.content.disabled,
    },
    primary: {
      main: tokens.interactive.primary,
      contrastText: primitiveColors.white,
    },
    secondary: {
      main: primitiveColors.neonGreen,
      contrastText: primitiveColors.black,
    },
    divider: tokens.border.subtle,
    team1: {
      main: tokens.data.team1,
      light: tokens.data.team1,
      dark: tokens.data.team1,
      contrastText: primitiveColors.white,
    },
    team2: {
      main: tokens.data.team2,
      light: tokens.data.team2,
      dark: tokens.data.team2,
      contrastText: primitiveColors.white,
    },
    momentum: {
      try: primitiveColors.momentumTry,
      positive: primitiveColors.momentumPositive,
      negative: primitiveColors.momentumNegative,
      neutral: primitiveColors.momentumNeutral,
    },
    error: { main: tokens.status.error },
    warning: { main: tokens.status.warning },
    info: { main: tokens.status.info },
    success: { main: tokens.status.success },
  };
};
