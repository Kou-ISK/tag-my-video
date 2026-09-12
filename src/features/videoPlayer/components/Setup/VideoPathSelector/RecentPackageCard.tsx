import type { ReactElement } from 'react';
import {
  Box,
  ButtonBase,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import FolderOutlined from '@mui/icons-material/FolderOutlined';
import Close from '@mui/icons-material/Close';
import ChevronRight from '@mui/icons-material/ChevronRight';
import type { RecentPackage } from './types';
export const RecentPackageCard = ({
  package: pkg,
  onOpen,
  onRemove,
  disabled = false,
}: {
  package: RecentPackage;
  onOpen: (path: string) => void;
  onRemove: (path: string) => void;
  disabled?: boolean;
}): ReactElement => (
  <Box
    component="li"
    sx={{
      display: 'flex',
      alignItems: 'center',
      borderBottom: 1,
      borderColor: 'divider',
      minWidth: 0,
      '&:last-child': { borderBottom: 0 },
      '&:hover': { bgcolor: 'action.hover' },
      '&:focus-within': { bgcolor: 'action.selected' },
    }}
  >
    <ButtonBase
      disabled={disabled}
      onClick={() => onOpen(pkg.path)}
      aria-label={`${pkg.name}を開く`}
      sx={{
        p: 1.5,
        gap: 1.5,
        flex: 1,
        minWidth: 0,
        justifyContent: 'flex-start',
        textAlign: 'left',
        '&.Mui-focusVisible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: -2,
        },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 44,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'action.selected',
          borderRadius: 1,
          color: 'primary.main',
        }}
      >
        <FolderOutlined />
      </Box>
      <Stack spacing={0.4} sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          component="span"
          variant="subtitle2"
          noWrap
          title={pkg.name}
        >
          {pkg.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          noWrap
          title={`${pkg.team1Name} / ${pkg.team2Name}`}
        >
          {pkg.team1Name} / {pkg.team2Name}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          noWrap
          title={pkg.path}
        >
          {pkg.path}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {pkg.videoCount}映像 · 最終利用{' '}
          {new Date(pkg.lastOpened).toLocaleDateString('ja-JP')}
        </Typography>
      </Stack>
      <ChevronRight
        sx={{ fontSize: 18, color: 'text.secondary', flexShrink: 0 }}
      />
    </ButtonBase>
    <Tooltip title="履歴から除く（ファイルは削除しません）">
      <span>
        <IconButton
          disabled={disabled}
          aria-label={`${pkg.name}を最近開いたパッケージから削除`}
          onClick={() => onRemove(pkg.path)}
          size="small"
          sx={{ mr: 1 }}
        >
          <Close fontSize="small" />
        </IconButton>
      </span>
    </Tooltip>
  </Box>
);
