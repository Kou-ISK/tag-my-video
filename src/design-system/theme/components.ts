import type { ThemeOptions } from '@mui/material/styles';
import type { SemanticTokens } from '../tokens/semantic';
import { elevationTokens } from '../tokens/elevation';
import { motionTokens } from '../tokens/motion';
import { primitiveShape } from '../tokens/primitive';
import { zIndexTokens } from '../tokens/zIndex';

export const buildComponents = (
  tokens: SemanticTokens,
): ThemeOptions['components'] => ({
  MuiCssBaseline: {
    styleOverrides: {
      'code, kbd, pre': {
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      },
      '*:focus-visible': {
        outline: `2px solid ${tokens.border.focus}`,
        outlineOffset: '2px',
      },
      '@media (prefers-reduced-motion: reduce)': {
        '*': {
          animationDuration: '0.01ms !important',
          animationIterationCount: '1 !important',
          transitionDuration: '0.01ms !important',
          scrollBehavior: 'auto !important',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        boxShadow: elevationTokens.none,
      },
    },
  },
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: {
        borderRadius: primitiveShape.radiusLg,
        paddingInline: 16,
        paddingBlock: 10,
        transition: motionTokens.transitionInteractive,
      },
      containedPrimary: {
        boxShadow: elevationTokens.none,
        '&:hover': {
          boxShadow: elevationTokens.focus,
        },
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        minWidth: 32,
        minHeight: 32,
        borderRadius: primitiveShape.radiusLg,
        transition: motionTokens.transitionInteractive,
        '&:hover': { backgroundColor: tokens.surface.hover },
        '&.Mui-focusVisible': {
          outline: `2px solid ${tokens.border.focus}`,
          outlineOffset: '2px',
        },
      },
    },
  },
  MuiTooltip: {
    defaultProps: { arrow: true },
    styleOverrides: {
      tooltip: {
        borderRadius: primitiveShape.radiusMd,
        backgroundColor: tokens.surface.overlay,
        color: tokens.content.primary,
        border: `1px solid ${tokens.border.subtle}`,
      },
      arrow: { color: tokens.surface.overlay },
    },
  },
  MuiDivider: {
    styleOverrides: { root: { borderColor: tokens.border.subtle } },
  },
  MuiMenu: {
    styleOverrides: {
      paper: {
        backgroundColor: tokens.surface.overlay,
        border: `1px solid ${tokens.border.subtle}`,
        boxShadow: elevationTokens.overlay,
        zIndex: zIndexTokens.overlay,
      },
    },
  },
});
