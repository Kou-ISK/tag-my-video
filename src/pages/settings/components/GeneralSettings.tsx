import React, { useState, forwardRef, useImperativeHandle } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Typography,
  Divider,
  Alert,
} from '@mui/material';
import type { AppSettings, ThemeMode } from '../../../types/Settings';
import { useThemeMode } from '../../../contexts/ThemeModeContext';
import type { SettingsTabHandle } from '../../SettingsPage';

interface GeneralSettingsProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => Promise<boolean>;
}

export const GeneralSettings = forwardRef<
  SettingsTabHandle,
  GeneralSettingsProps
>(({ settings, onSave }, ref) => {
  const { setThemeMode: setContextThemeMode } = useThemeMode();
  const [themeMode, setThemeMode] = useState<ThemeMode>(settings.themeMode);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useImperativeHandle(ref, () => ({
    hasUnsavedChanges: () => themeMode !== settings.themeMode,
  }));

  const handleSave = async () => {
    const newSettings: AppSettings = {
      ...settings,
      themeMode,
    };

    const success = await onSave(newSettings);
    if (success) {
      // Context にも反映してリアルタイムで切り替わる
      setContextThemeMode(themeMode);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Typography variant="h6" gutterBottom>
        一般設定
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {/* テーマモード */}
      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel component="legend">テーマモード</FormLabel>
        <RadioGroup
          value={themeMode}
          onChange={(e) => setThemeMode(e.target.value as ThemeMode)}
        >
          <FormControlLabel
            value="light"
            control={<Radio />}
            label="ライトモード"
          />
          <FormControlLabel
            value="dark"
            control={<Radio />}
            label="ダークモード"
          />
          <FormControlLabel
            value="system"
            control={<Radio />}
            label="システム設定に従う"
          />
        </RadioGroup>
      </FormControl>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          設定を保存しました
        </Alert>
      )}

      <Button variant="contained" onClick={handleSave} fullWidth>
        保存
      </Button>
    </Box>
  );
});

GeneralSettings.displayName = 'GeneralSettings';
