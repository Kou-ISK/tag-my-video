import type { ReactElement } from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface ActionButtonsRowProps {
  onOpenPackage: () => void;
  onOpenWizard: () => void;
}

export const ActionButtonsRow = ({
  onOpenPackage,
  onOpenWizard,
}: ActionButtonsRowProps): ReactElement => (
  <Paper
    variant="outlined"
    sx={{ p: 2.5, borderTop: 2, borderTopColor: 'primary.main' }}
  >
    <Stack spacing={2}>
      <Box sx={{ color: 'primary.main' }}>
        <FolderOpenIcon fontSize="large" />
      </Box>
      <Box>
        <Typography variant="h6">分析を開始</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          試合映像・タグ・分析を、ひとつのパッケージで管理します。
        </Typography>
      </Box>
      <Button
        variant="contained"
        endIcon={<ArrowForwardIcon />}
        onClick={onOpenPackage}
        fullWidth
      >
        パッケージを開く
      </Button>
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={onOpenWizard}
        fullWidth
      >
        新しいパッケージを作成
      </Button>
    </Stack>
  </Paper>
);
