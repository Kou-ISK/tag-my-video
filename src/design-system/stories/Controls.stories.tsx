import { useState } from 'react';
import type { ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import PlayArrow from '@mui/icons-material/PlayArrow';
import Save from '@mui/icons-material/Save';

const ControlsView = (): ReactElement => {
  const [mode, setMode] = useState('code');
  const [tab, setTab] = useState(0);
  return (
    <Stack spacing={3} sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: 'auto' }}>
      <Box>
        <Typography variant="overline" color="primary.main">
          SporTagLytics / Design System
        </Typography>
        <Typography variant="h4" component="h1">
          映像に集中する、分析ワークスペース
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          境界・密度・数値の可読性で、長時間の分析を支える。
        </Typography>
      </Box>
      <Paper variant="outlined">
        <Tabs
          value={tab}
          onChange={(_, value: number) => setTab(value)}
          aria-label="表示サンプル"
        >
          <Tab label="コントロール" />
          <Tab label="表示状態" />
        </Tabs>
        <Divider />
        <Stack spacing={2.5} sx={{ p: 2.5 }}>
          {tab === 0 ? (
            <>
              <Stack direction="row" gap={1} flexWrap="wrap">
                <Button variant="contained" startIcon={<PlayArrow />}>
                  分析を開始
                </Button>
                <Button variant="outlined" startIcon={<Save />}>
                  パッケージを保存
                </Button>
                <Button>キャンセル</Button>
                <Button disabled variant="contained">
                  エクスポート
                </Button>
              </Stack>
              <ToggleButtonGroup
                exclusive
                value={mode}
                onChange={(_, value: string | null) => {
                  if (value) setMode(value);
                }}
                aria-label="作業モード"
              >
                <ToggleButton value="code">コード</ToggleButton>
                <ToggleButton value="label">ラベル</ToggleButton>
                <ToggleButton value="edit">編集</ToggleButton>
              </ToggleButtonGroup>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="パッケージ名"
                  defaultValue="決勝戦・前半レビュー"
                  fullWidth
                />
                <TextField
                  label="開始時刻"
                  defaultValue="24:18.000"
                  slotProps={{
                    input: {
                      sx: {
                        fontFamily: (theme) =>
                          theme.custom.typography.fontFamilyMono,
                      },
                    },
                  }}
                />
              </Stack>
              <Stack direction="row" spacing={1}>
                <Chip label="選択中" variant="outlined" color="primary" />
                <Chip label="未保存" variant="outlined" color="warning" />
                <Chip label="映像 2" variant="outlined" />
              </Stack>
            </>
          ) : (
            <>
              <TextField
                error
                label="パッケージ名"
                helperText="名前を入力してください。"
              />
              <Alert severity="error">
                パッケージを開けませんでした。保存先を確認して、もう一度開いてください。
              </Alert>
              <Alert severity="info">
                クリップを選択すると詳細を表示します。
              </Alert>
              <Button disabled variant="outlined">
                映像の読み込み中
              </Button>
            </>
          )}
        </Stack>
      </Paper>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 1,
        }}
      >
        {(['canvas', 'work', 'raised'] as const).map((surface) => (
          <Box
            key={surface}
            sx={{
              p: 2,
              bgcolor: (theme) => theme.custom.tokens.surface[surface],
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            <Typography variant="overline" color="text.secondary">
              {surface}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontFamily: (theme) => theme.custom.typography.fontFamilyMono,
              }}
            >
              24:18.000
            </Typography>
            <Typography variant="caption" color="text.secondary">
              時刻・数値は等幅で比較
            </Typography>
          </Box>
        ))}
      </Box>
    </Stack>
  );
};
const meta = {
  title: 'Design System/Foundation/Controls',
  component: ControlsView,
} satisfies Meta<typeof ControlsView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Dark: Story = {};
export const Light: Story = { globals: { themeMode: 'light' } };
