import type { ReactElement } from 'react';
import {
  Box,
  Button,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Search from '@mui/icons-material/Search';
import History from '@mui/icons-material/History';
import { RecentPackageCard } from '../RecentPackageCard';
import type { RecentPackage } from '../types';
export const RecentPackagesSection = ({
  packages,
  onOpen,
  onRemove,
  searchQuery = '',
  onSearchChange,
  disabled = false,
}: {
  packages: RecentPackage[];
  onOpen: (path: string) => void;
  onRemove: (path: string) => void;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  disabled?: boolean;
}): ReactElement => {
  const query = searchQuery.trim().toLocaleLowerCase();
  const filtered = packages.filter((pkg) =>
    [pkg.name, pkg.path, pkg.team1Name, pkg.team2Name].some((value) =>
      value.toLocaleLowerCase().includes(query),
    ),
  );
  return (
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography component="h2" variant="h6">
          最近開いたパッケージ
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {packages.length}件
        </Typography>
      </Stack>
      <TextField
        type="search"
        size="small"
        label="履歴を検索"
        placeholder="名前・チーム・保存場所"
        value={searchQuery}
        onChange={(event) => onSearchChange?.(event.target.value)}
        fullWidth
        disabled={!packages.length || disabled}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      {filtered.length ? (
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          <Box
            component="ul"
            aria-label="最近開いたパッケージ一覧"
            sx={{ p: 0, m: 0, listStyle: 'none' }}
          >
            {filtered.map((pkg) => (
              <RecentPackageCard
                key={pkg.path}
                package={pkg}
                onOpen={onOpen}
                onRemove={onRemove}
                disabled={disabled}
              />
            ))}
          </Box>
        </Paper>
      ) : (
        <Stack
          alignItems="center"
          spacing={1.5}
          sx={{
            py: 6,
            px: 2,
            textAlign: 'center',
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <History sx={{ fontSize: 36, color: 'text.secondary' }} />
          <Typography component="p" variant="subtitle2">
            {packages.length
              ? '一致するパッケージはありません'
              : '最近開いたパッケージはありません'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {packages.length
              ? '名前・チーム・保存場所を変えて検索してください。'
              : 'パッケージを開くと、次回からここで分析を再開できます。'}
          </Typography>
          {query && (
            <Button onClick={() => onSearchChange?.('')}>検索をクリア</Button>
          )}
        </Stack>
      )}
      <Typography variant="caption" color="text.secondary">
        クリックまたはEnterで開きます。履歴から除いても、元のファイルは残ります。
      </Typography>
    </Stack>
  );
};
