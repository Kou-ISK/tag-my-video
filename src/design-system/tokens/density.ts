import { primitiveSizes, primitiveSpacing } from './primitive';

export const densityTokens = {
  compact: {
    iconSize: primitiveSizes.iconMd,
    controlHeight: primitiveSizes.controlCompact,
    interactiveTarget: primitiveSizes.interactiveMin,
    gap: primitiveSpacing.xs,
    padding: primitiveSpacing.xs,
  },
  standard: {
    iconSize: primitiveSizes.iconMd,
    controlHeight: primitiveSizes.controlStandard,
    interactiveTarget: primitiveSizes.interactiveComfortable,
    gap: primitiveSpacing.sm,
    padding: primitiveSpacing.sm,
  },
} as const;

export type Density = keyof typeof densityTokens;
