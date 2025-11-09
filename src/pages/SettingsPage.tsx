import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSettings } from '../hooks/useSettings';
import { GeneralSettings } from './settings/components/GeneralSettings';
import { ActionPresetSettings } from './settings/components/ActionPresetSettings';
import { HotkeySettings } from './settings/components/HotkeySettings';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export interface SettingsTabHandle {
  hasUnsavedChanges: () => boolean;
}

export const SettingsPage: React.FC = () => {
  const { settings, isLoading, error, saveSettings } = useSettings();
  const [currentTab, setCurrentTab] = useState(0);
  const [nextTab, setNextTab] = useState<number | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // 各タブのRefを保持
  const generalRef = useRef<SettingsTabHandle>(null);
  const presetRef = useRef<SettingsTabHandle>(null);
  const hotkeyRef = useRef<SettingsTabHandle>(null);

  const checkUnsavedChanges = (tabIndex: number): boolean => {
    switch (tabIndex) {
      case 0:
        return generalRef.current?.hasUnsavedChanges() || false;
      case 1:
        return presetRef.current?.hasUnsavedChanges() || false;
      case 2:
        return hotkeyRef.current?.hasUnsavedChanges() || false;
      default:
        return false;
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    if (checkUnsavedChanges(currentTab)) {
      setNextTab(newValue);
      setConfirmDialogOpen(true);
    } else {
      setCurrentTab(newValue);
    }
  };

  const handleConfirmSwitch = () => {
    if (nextTab !== null) {
      setCurrentTab(nextTab);
      setNextTab(null);
    }
    setConfirmDialogOpen(false);
  };

  const handleCancelSwitch = () => {
    setNextTab(null);
    setConfirmDialogOpen(false);
  };

  const handleClose = () => {
    // 設定画面を閉じて VideoPlayerApp に戻る
    const event = new CustomEvent('back-to-main');
    globalThis.dispatchEvent(event);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>設定を読み込み中...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            設定
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="閉じる"
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ flexGrow: 1, py: 3 }}>
        <Paper elevation={2}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="設定タブ"
            variant="fullWidth"
          >
            <Tab label="一般" id="settings-tab-0" />
            <Tab label="アクションプリセット" id="settings-tab-1" />
            <Tab label="ホットキー" id="settings-tab-2" />
          </Tabs>

          <TabPanel value={currentTab} index={0}>
            <GeneralSettings
              ref={generalRef}
              settings={settings}
              onSave={saveSettings}
            />
          </TabPanel>
          <TabPanel value={currentTab} index={1}>
            <ActionPresetSettings
              ref={presetRef}
              settings={settings}
              onSave={saveSettings}
            />
          </TabPanel>
          <TabPanel value={currentTab} index={2}>
            <HotkeySettings
              ref={hotkeyRef}
              settings={settings}
              onSave={saveSettings}
            />
          </TabPanel>
        </Paper>
      </Container>

      {/* 未保存の変更警告ダイアログ */}
      <Dialog open={confirmDialogOpen} onClose={handleCancelSwitch}>
        <DialogTitle>保存されていません</DialogTitle>
        <DialogContent>
          <DialogContentText>
            保存されていない変更があります。タブを切り替えると変更が破棄されますが、よろしいですか?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelSwitch}>キャンセル</Button>
          <Button onClick={handleConfirmSwitch} color="error" autoFocus>
            破棄して移動
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
