import {
  createTheme,
  type Theme,
  type ThemeOptions,
} from '@mui/material/styles';
import { buildComponents } from './components';
import { buildPalette } from './palette';
import '../theme/types';
import { densityTokens } from '../tokens/density';
import { elevationTokens } from '../tokens/elevation';
import { motionTokens } from '../tokens/motion';
import { primitiveShape, primitiveSpacing } from '../tokens/primitive';
import {
  createSemanticTokens,
  type DesignSystemMode,
} from '../tokens/semantic';
import { fontFamilies, typographyScale } from '../tokens/typography';
import { zIndexTokens } from '../tokens/zIndex';

export const buildThemeOptions = (mode: DesignSystemMode): ThemeOptions => {
  const tokens = createSemanticTokens(mode);

  return {
    palette: buildPalette(mode),
    shape: { borderRadius: primitiveShape.radiusLg },
    spacing: primitiveSpacing.unit,
    typography: {
      fontFamily: fontFamilies.ui,
      display: typographyScale.display,
      heading: typographyScale.heading,
      fontSize: 13,
      h4: { fontSize: '1.8rem', fontWeight: 750, letterSpacing: '-0.04em' },
      h5: { fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.025em' },
      h6: { fontSize: '1rem', fontWeight: 700 },
      body1: typographyScale.body,
      subtitle2: { fontSize: '0.8125rem', fontWeight: 650 },
      overline: {
        fontSize: '0.6875rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
      },
      sectionTitle: typographyScale.sectionTitle,
      body2: typographyScale.bodyCompact,
      bodyCompact: typographyScale.bodyCompact,
      label: typographyScale.label,
      labelCompact: typographyScale.labelCompact,
      caption: typographyScale.caption,
      technical: typographyScale.technical,
      numeric: typographyScale.numeric,
      button: { textTransform: 'none', fontWeight: 700 },
    },
    components: buildComponents(tokens),
    custom: {
      controllerButton: {
        color: tokens.content.primary,
        borderRadius: `${primitiveShape.radiusMd}px`,
      },
      controllerPresetButton: {
        color: tokens.content.primary,
        borderRadius: `${primitiveShape.radiusMd}px`,
        flexDirection: 'column',
      },
      tokens,
      density: densityTokens,
      motion: motionTokens,
      elevation: elevationTokens,
      zIndex: zIndexTokens,
      typography: {
        ...typographyScale,
        fontFamily: fontFamilies.ui,
        fontFamilyMono: fontFamilies.mono,
      },
      rails: {
        timelineBg: tokens.surface.canvas,
        laneBg: tokens.surface.raised,
      },
      bars: {
        team1: tokens.data.team1,
        team2: tokens.data.team2,
        selectedBorder: tokens.border.strong,
      },
      glass: {
        panel: tokens.surface.overlay,
        hover: tokens.surface.hover,
        hoverStrong: tokens.interactive.hover,
      },
      accents: {
        hoverPink: '#FF0099',
      },
    },
  };
};

export const getAppTheme = (mode: DesignSystemMode = 'dark'): Theme =>
  createTheme(buildThemeOptions(mode));

export { createSemanticTokens } from '../tokens/semantic';
export type { DesignSystemMode, SemanticTokens } from '../tokens/semantic';
