export const fontFamilies = {
  ui: ['Inter', 'Noto Sans JP', 'system-ui', 'sans-serif'].join(', '),
  mono: [
    'ui-monospace',
    'SFMono-Regular',
    'Menlo',
    'Monaco',
    'Consolas',
    'monospace',
  ].join(', '),
} as const;

export const typographyScale = {
  display: { fontSize: '2rem', lineHeight: 1.2, fontWeight: 700 },
  heading: { fontSize: '1.5rem', lineHeight: 1.3, fontWeight: 700 },
  sectionTitle: { fontSize: '1rem', lineHeight: 1.4, fontWeight: 700 },
  body: { fontSize: '0.875rem', lineHeight: 1.6, fontWeight: 400 },
  bodyCompact: { fontSize: '0.8125rem', lineHeight: 1.45, fontWeight: 400 },
  label: { fontSize: '0.75rem', lineHeight: 1.35, fontWeight: 700 },
  labelCompact: { fontSize: '0.6875rem', lineHeight: 1.25, fontWeight: 700 },
  caption: { fontSize: '0.75rem', lineHeight: 1.35, fontWeight: 400 },
  technical: {
    fontFamily: fontFamilies.mono,
    fontSize: '0.75rem',
    lineHeight: 1.45,
    fontWeight: 400,
  },
  numeric: {
    fontVariantNumeric: 'tabular-nums',
    fontFamily: fontFamilies.mono,
  },
} as const;

export type TypographyScale = typeof typographyScale;
