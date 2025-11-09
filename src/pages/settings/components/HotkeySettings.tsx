import React, { useState, forwardRef, useImperativeHandle } from 'react';
import {
  Box,
  Button,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  TextField,
  Alert,
  Chip,
} from '@mui/material';
import type { AppSettings, HotkeyConfig } from '../../../types/Settings';
import type { SettingsTabHandle } from '../../SettingsPage';

interface HotkeySettingsProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => Promise<boolean>;
}

/**
 * デフォルトのホットキー定義
 */
const DEFAULT_HOTKEYS: HotkeyConfig[] = [
  { id: 'resync-audio', label: '音声同期を再実行', key: 'Command+Shift+S' },
  { id: 'reset-sync', label: '同期をリセット', key: 'Command+Shift+R' },
  { id: 'manual-sync', label: '今の位置で同期', key: 'Command+Shift+M' },
  { id: 'toggle-manual-mode', label: '手動モード切替', key: 'Command+Shift+T' },
  { id: 'analyze', label: '分析開始', key: 'Command+Shift+A' },
  {
    id: 'show-stats-possession',
    label: 'ポゼッション統計表示',
    key: 'Command+Option+1',
  },
  { id: 'show-stats-results', label: '結果統計表示', key: 'Command+Option+2' },
  { id: 'show-stats-types', label: 'タイプ統計表示', key: 'Command+Option+3' },
  {
    id: 'show-stats-momentum',
    label: 'モメンタム統計表示',
    key: 'Command+Option+4',
  },
  {
    id: 'show-stats-matrix',
    label: 'マトリクス統計表示',
    key: 'Command+Option+5',
  },
  { id: 'undo', label: '元に戻す', key: 'Command+Z' },
  { id: 'redo', label: 'やり直す', key: 'Command+Shift+Z' },
  { id: 'skip-forward-small', label: '0.5秒進む', key: 'Right' },
  { id: 'skip-forward-medium', label: '2秒進む', key: 'Shift+Right' },
  { id: 'skip-forward-large', label: '4秒進む', key: 'Command+Right' },
  { id: 'skip-forward-xlarge', label: '6秒進む', key: 'Option+Right' },
  { id: 'skip-backward-medium', label: '5秒戻る', key: 'Left' },
  { id: 'skip-backward-large', label: '10秒戻る', key: 'Shift+Left' },
  { id: 'play-pause', label: '再生/一時停止', key: 'Up' },
];

export const HotkeySettings = forwardRef<
  SettingsTabHandle,
  HotkeySettingsProps
>(({ settings, onSave }, ref) => {
  // 初期化: 既存設定がなければデフォルトを使用
  const initialHotkeys =
    settings.hotkeys.length > 0 ? settings.hotkeys : DEFAULT_HOTKEYS;
  const [hotkeys, setHotkeys] = useState<HotkeyConfig[]>(initialHotkeys);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useImperativeHandle(ref, () => ({
    hasUnsavedChanges: () =>
      JSON.stringify(hotkeys) !== JSON.stringify(initialHotkeys),
  }));

  const handleEditStart = (hotkey: HotkeyConfig) => {
    setEditingId(hotkey.id);
    setEditingKey(hotkey.key);
  };

  const handleEditSave = (id: string) => {
    setHotkeys(
      hotkeys.map((h) => (h.id === id ? { ...h, key: editingKey } : h)),
    );
    setEditingId(null);
    setEditingKey('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingKey('');
  };

  const handleResetToDefaults = () => {
    setHotkeys(DEFAULT_HOTKEYS);
  };

  const handleSave = async () => {
    const newSettings: AppSettings = {
      ...settings,
      hotkeys,
    };

    const success = await onSave(newSettings);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography variant="h6" gutterBottom>
        ホットキー設定
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        各機能に割り当てるキーボードショートカットを変更できます
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Button variant="outlined" onClick={handleResetToDefaults} sx={{ mb: 2 }}>
        デフォルトに戻す
      </Button>

      <List>
        {hotkeys.map((hotkey) => (
          <ListItem
            key={hotkey.id}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              mb: 1,
            }}
          >
            <ListItemText
              primary={hotkey.label}
              secondary={
                editingId === hotkey.id ? (
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <TextField
                      size="small"
                      value={editingKey}
                      onChange={(e) => setEditingKey(e.target.value)}
                      placeholder="例: Command+Shift+S"
                      sx={{ flexGrow: 1 }}
                    />
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleEditSave(hotkey.id)}
                    >
                      保存
                    </Button>
                    <Button size="small" onClick={handleEditCancel}>
                      キャンセル
                    </Button>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mt: 1,
                    }}
                  >
                    <Chip label={hotkey.key} size="small" />
                    <Button
                      size="small"
                      onClick={() => handleEditStart(hotkey)}
                    >
                      変更
                    </Button>
                  </Box>
                )
              }
            />
          </ListItem>
        ))}
      </List>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 2, mt: 3 }}>
          設定を保存しました
        </Alert>
      )}

      <Button variant="contained" onClick={handleSave} fullWidth sx={{ mt: 3 }}>
        保存
      </Button>
    </Box>
  );
});

HotkeySettings.displayName = 'HotkeySettings';
