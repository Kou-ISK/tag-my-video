import React from 'react';
import {
  Alert,
  Backdrop,
  Box,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import { SyncStatus } from './types';

interface AudioSyncBackdropProps {
  status: SyncStatus;
}

export const AudioSyncBackdrop: React.FC<AudioSyncBackdropProps> = ({ status }) => (
  <Backdrop
    open={status.isAnalyzing}
    sx={{
      zIndex: 1400,
      color: '#fff',
      backdropFilter: 'blur(4px)',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    }}
  >
    <Card sx={{ minWidth: 400, maxWidth: 500 }}>
      <CardContent>
        <Stack spacing={3} alignItems="center">
          <Box
            sx={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress size={80} thickness={4} sx={{ color: 'primary.main' }} />
            <Box
              sx={{
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GraphicEqIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
          </Box>

          <Typography variant="h6" fontWeight="medium">
            音声同期分析中
          </Typography>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            {status.syncStage || '音声データを解析しています...'}
          </Typography>

          <Box sx={{ width: '100%' }}>
            <LinearProgress
              variant="determinate"
              value={status.syncProgress}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: 'block', textAlign: 'center' }}
            >
              {Math.round(status.syncProgress)}%
            </Typography>
          </Box>

          <Alert severity="warning" sx={{ width: '100%' }}>
            <Typography variant="caption">
              音声同期の精度向上のため、処理には時間がかかる場合があります。この間、他の操作はできません。
            </Typography>
          </Alert>
        </Stack>
      </CardContent>
    </Card>
  </Backdrop>
);
