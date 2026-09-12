import type { CSSProperties } from 'react';
import type { SxProps, Theme as MuiTheme } from '@mui/material/styles';
import type { elevationTokens } from '../tokens/elevation';
import type { motionTokens } from '../tokens/motion';
import type { SemanticTokens } from '../tokens/semantic';
import type { typographyScale } from '../tokens/typography';
import type { zIndexTokens } from '../tokens/zIndex';

export interface DesignSystemCustomTokens {
  controllerButton: SxProps<MuiTheme>;
  controllerPresetButton: SxProps<MuiTheme>;
  tokens: SemanticTokens;
  density: typeof import('../tokens/density').densityTokens;
  motion: typeof motionTokens;
  elevation: typeof elevationTokens;
  zIndex: typeof zIndexTokens;
  typography: typeof typographyScale & {
    fontFamily: string;
    fontFamilyMono: string;
  };
  /** Legacy aliases retained for feature migration and existing consumers. */
  rails: {
    timelineBg: string;
    laneBg: string;
  };
  bars: {
    team1: string;
    team2: string;
    selectedBorder: string;
  };
  glass: {
    panel: string;
    hover: string;
    hoverStrong: string;
  };
  accents: {
    hoverPink: string;
  };
}

export interface DesignSystemCustomOptions {
  controllerButton?: SxProps<MuiTheme>;
  controllerPresetButton?: SxProps<MuiTheme>;
  tokens?: SemanticTokens;
  density?: typeof import('../tokens/density').densityTokens;
  motion?: typeof motionTokens;
  elevation?: typeof elevationTokens;
  zIndex?: typeof zIndexTokens;
  typography?: typeof typographyScale & {
    fontFamily?: string;
    fontFamilyMono?: string;
  };
  rails?: Partial<DesignSystemCustomTokens['rails']>;
  bars?: Partial<DesignSystemCustomTokens['bars']>;
  glass?: Partial<DesignSystemCustomTokens['glass']>;
  accents?: Partial<DesignSystemCustomTokens['accents']>;
}

declare module '@mui/material/styles' {
  interface Palette {
    team1: Palette['primary'];
    team2: Palette['primary'];
    momentum: {
      try: string;
      positive: string;
      negative: string;
      neutral: string;
    };
  }

  interface PaletteOptions {
    team1?: PaletteOptions['primary'];
    team2?: PaletteOptions['primary'];
    momentum?: {
      try?: string;
      positive?: string;
      negative?: string;
      neutral?: string;
    };
  }

  interface Theme {
    custom: DesignSystemCustomTokens;
  }

  interface ThemeOptions {
    custom?: DesignSystemCustomOptions;
  }

  interface TypographyVariants {
    display: CSSProperties;
    heading: CSSProperties;
    sectionTitle: CSSProperties;
    bodyCompact: CSSProperties;
    label: CSSProperties;
    labelCompact: CSSProperties;
    technical: CSSProperties;
    numeric: CSSProperties;
  }

  interface TypographyVariantsOptions {
    display?: CSSProperties;
    heading?: CSSProperties;
    sectionTitle?: CSSProperties;
    bodyCompact?: CSSProperties;
    label?: CSSProperties;
    labelCompact?: CSSProperties;
    technical?: CSSProperties;
    numeric?: CSSProperties;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    team1: true;
    team2: true;
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    team1: true;
    team2: true;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    display: true;
    heading: true;
    sectionTitle: true;
    bodyCompact: true;
    label: true;
    labelCompact: true;
    technical: true;
    numeric: true;
  }
}
