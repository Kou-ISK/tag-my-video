import React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { RecentPackageCard } from '../RecentPackageCard';
import type { RecentPackage } from '../hooks/useRecentPackages';

interface RecentPackagesSectionProps {
  packages: RecentPackage[];
  onOpen: (path: string) => void;
  onRemove: (path: string) => void;
}

export const RecentPackagesSection: React.FC<RecentPackagesSectionProps> = ({
  packages,
  onOpen,
  onRemove,
}) => {
  return (
    <Stack spacing={1.5}>
      <Typography variant="overline" color="text.secondary">
        最近開いたパッケージ
      </Typography>

      {packages.length === 0 && (
        <Paper variant="outlined" sx={{ p: 3, bgcolor: 'background.paper' }}>
          <Typography variant="subtitle2">
            最近開いたパッケージはありません
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            パッケージを開くと、ここから分析を再開できます。
          </Typography>
        </Paper>
      )}
      <Box sx={{ display: 'grid', gap: 1 }}>
        {packages.map((pkg) => (
          <Box key={pkg.path}>
            <RecentPackageCard
              package={pkg}
              onOpen={onOpen}
              onRemove={onRemove}
            />
          </Box>
        ))}
      </Box>
    </Stack>
  );
};
