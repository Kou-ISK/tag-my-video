import { alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import type { SystemStyleObject } from '@mui/system';
/** 映像操作面はアプリの明暗テーマにかかわらず、映像に接する黒地を使用する。 */
export const mediaChromeSx = (theme: Theme): SystemStyleObject<Theme> => ({
  bgcolor: alpha(theme.custom.tokens.media.surface, 0.82),
  backdropFilter: 'blur(16px)',
  borderRadius: 2,
  color: theme.custom.tokens.media.foreground,
  '& .MuiButton-root, & .MuiToggleButtonGroup-root, & .MuiIconButton-root, & .MuiTypography-root, & .MuiInputBase-root, & .MuiInputLabel-root, & .MuiSelect-icon, & .MuiInputAdornment-root, & .MuiToggleButton-root':
    { color: theme.custom.tokens.media.foreground },
  '& .MuiIconButton-root:hover, & .MuiToggleButton-root:hover': {
    bgcolor: theme.custom.tokens.media.hover,
  },
  '& .MuiIconButton-root[aria-pressed="true"]': {
    color: theme.custom.tokens.media.accent,
  },
  '& .MuiToggleButton-root.Mui-selected': {
    color: theme.custom.tokens.media.foreground,
    bgcolor: theme.custom.tokens.media.hover,
  },
  '& .MuiSlider-root': { color: theme.custom.tokens.media.accent },
  '& .Mui-disabled': { color: theme.custom.tokens.media.disabled },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.custom.tokens.media.disabled,
  },
});
