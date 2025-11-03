import { createTheme } from '@mui/material/styles';

// カラーパレットの型拡張
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
}

// Buttonコンポーネントのcolor propsに追加
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

export const appTheme = createTheme({
  palette: {
    // チーム1: 赤系統
    team1: {
      main: '#d32f2f',
      light: '#ff6659',
      dark: '#9a0007',
      contrastText: '#ffffff',
    },
    // チーム2: 青系統
    team2: {
      main: '#1976d2',
      light: '#63a4ff',
      dark: '#004ba0',
      contrastText: '#ffffff',
    },
    // モメンタムチャート専用色
    momentum: {
      try: '#ff5722', // Try - オレンジレッド
      positive: '#4caf50', // ポジティブ - グリーン
      negative: '#9c27b0', // ネガティブ - パープル
      neutral: '#757575', // デフォルト - グレー
    },
    // MUIデフォルトカラーの調整
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#ed6c02',
    },
    info: {
      main: '#0288d1',
    },
    success: {
      main: '#2e7d32',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Hiragino Kaku Gothic ProN"',
      '"Hiragino Sans"',
      '"Yu Gothic"',
      'Meiryo',
      'sans-serif',
    ].join(','),
    h5: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none', // ボタンテキストの大文字化を無効
      fontWeight: 500,
    },
  },
  spacing: 8, // 8px基準
  shape: {
    borderRadius: 8, // デフォルトの角丸
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
        sizeLarge: {
          padding: '12px 24px',
          fontSize: '1rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
        },
      },
    },
  },
});
