const OFFSET_EPSILON = 0.05;

const clampToZero = (value: number) => (value < 0 ? 0 : value);

export const isNegativeOffset = (offset: number) => offset < -OFFSET_EPSILON;

export const isPositiveOffset = (offset: number) => offset > OFFSET_EPSILON;

export const calculateAdjustedCurrentTimes = (
  videoList: string[],
  primaryClock: number,
  offset: number,
): number[] => {
  return videoList.map((_, index) => {
    if (index === 0) {
      return clampToZero(primaryClock);
    }
    const shifted = primaryClock - offset;
    return clampToZero(shifted);
  });
};

const shouldBlockPrimaryForNegativeOffset = (
  primaryClock: number,
  offset: number,
) => primaryClock < Math.abs(offset) - OFFSET_EPSILON;

const shouldBlockSecondaryForPositiveOffset = (
  primaryClock: number,
  offset: number,
) => primaryClock < offset - OFFSET_EPSILON;

interface BlockStateParams {
  videoList: string[];
  analyzed: boolean;
  offset: number;
  primaryClock: number;
}

export const calculateBlockStates = ({
  videoList,
  analyzed,
  offset,
  primaryClock,
}: BlockStateParams): boolean[] => {
  if (!analyzed) {
    return videoList.map(() => false);
  }

  if (isNegativeOffset(offset)) {
    return videoList.map((_, index) => {
      if (index === 0) {
        return shouldBlockPrimaryForNegativeOffset(primaryClock, offset);
      }
      return false;
    });
  }

  if (isPositiveOffset(offset)) {
    return videoList.map((_, index) => {
      if (index === 0) {
        return false;
      }
      return shouldBlockSecondaryForPositiveOffset(primaryClock, offset);
    });
  }

  return videoList.map(() => false);
};

export const SYNC_EPSILON = OFFSET_EPSILON;
