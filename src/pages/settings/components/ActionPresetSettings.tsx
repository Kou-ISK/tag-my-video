import React, { useState, forwardRef, useImperativeHandle } from 'react';
import {
  Box,
  Button,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import type {
  AppSettings,
  ActionPreset,
  ActionDefinition,
} from '../../../types/Settings';
import { useActionPreset } from '../../../contexts/ActionPresetContext';
import type { SettingsTabHandle } from '../../SettingsPage';

interface ActionPresetSettingsProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => Promise<boolean>;
}

export const ActionPresetSettings = forwardRef<
  SettingsTabHandle,
  ActionPresetSettingsProps
>(({ settings, onSave }, ref) => {
  const {
    availablePresets,
    setActivePresetId: setContextActivePresetId,
    reloadPresets,
  } = useActionPreset();
  const [activeId, setActiveId] = useState<string>(
    settings.activePresetId || 'default',
  );
  const [presets, setPresets] = useState<ActionPreset[]>(
    settings.actionPresets,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<ActionPreset | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // フォーム用の一時状態（プリセット全体）
  const [formName, setFormName] = useState('');
  const [formActions, setFormActions] = useState<ActionDefinition[]>([]);

  // アクション編集用ダイアログ
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [editingActionIndex, setEditingActionIndex] = useState<number | null>(
    null,
  );
  const [actionFormName, setActionFormName] = useState('');
  const [actionFormResults, setActionFormResults] = useState('');
  const [actionFormTypes, setActionFormTypes] = useState('');

  // 未保存の変更を検出
  useImperativeHandle(ref, () => ({
    hasUnsavedChanges: () => {
      const hasPresetsChanged =
        JSON.stringify(presets) !== JSON.stringify(settings.actionPresets);
      const hasActiveIdChanged = activeId !== settings.activePresetId;
      return hasPresetsChanged || hasActiveIdChanged;
    },
  }));

  const handleOpenDialog = (preset?: ActionPreset) => {
    if (preset) {
      setEditingPreset(preset);
      setFormName(preset.name);
      setFormActions([...preset.actions]);
    } else {
      setEditingPreset(null);
      setFormName('');
      setFormActions([]);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPreset(null);
  };

  const handleOpenActionDialog = (index?: number) => {
    if (index !== undefined && formActions[index]) {
      setEditingActionIndex(index);
      const act = formActions[index];
      setActionFormName(act.action);
      setActionFormResults(act.results.join(', '));
      setActionFormTypes(act.types.join(', '));
    } else {
      setEditingActionIndex(null);
      setActionFormName('');
      setActionFormResults('');
      setActionFormTypes('');
    }
    setActionDialogOpen(true);
  };

  const handleCloseActionDialog = () => {
    setActionDialogOpen(false);
    setEditingActionIndex(null);
  };

  const handleSaveAction = () => {
    const newAction: ActionDefinition = {
      action: actionFormName,
      results: actionFormResults
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      types: actionFormTypes
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    if (editingActionIndex === null) {
      setFormActions([...formActions, newAction]);
    } else {
      const updated = [...formActions];
      updated[editingActionIndex] = newAction;
      setFormActions(updated);
    }

    handleCloseActionDialog();
  };

  const handleDeleteAction = (index: number) => {
    setFormActions(formActions.filter((_, i) => i !== index));
  };

  const handleSavePreset = () => {
    const newPreset: ActionPreset = {
      id: editingPreset?.id || `preset_${Date.now()}`,
      name: formName,
      actions: formActions,
      order: editingPreset?.order || presets.length,
    };

    let updatedPresets: ActionPreset[];
    if (editingPreset) {
      updatedPresets = presets.map((p) =>
        p.id === editingPreset.id ? newPreset : p,
      );
    } else {
      updatedPresets = [...presets, newPreset];
    }

    setPresets(updatedPresets);
    handleCloseDialog();
  };

  const handleDeletePreset = (id: string) => {
    setPresets(presets.filter((p) => p.id !== id));
  };

  const handleSave = async () => {
    const newSettings: AppSettings = {
      ...settings,
      activePresetId: activeId,
      actionPresets: presets,
    };

    const success = await onSave(newSettings);
    if (success) {
      // Context にも反映
      setContextActivePresetId(activeId);
      await reloadPresets();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Typography variant="h6" gutterBottom>
        アクションプリセット
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        アクションパネルに表示するプリセットを選択できます
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {/* アクティブなプリセットを選択 */}
      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel component="legend">使用するプリセット</FormLabel>
        <RadioGroup
          value={activeId}
          onChange={(e) => setActiveId(e.target.value)}
        >
          {availablePresets.map((preset) => (
            <FormControlLabel
              key={preset.id}
              value={preset.id}
              control={<Radio />}
              label={`${preset.name} (${preset.actions.length}件のアクション)`}
            />
          ))}
        </RadioGroup>
      </FormControl>

      <Divider sx={{ mb: 3 }} />

      <Typography variant="subtitle1" gutterBottom>
        カスタムプリセット管理
      </Typography>

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => handleOpenDialog()}
        sx={{ mb: 2 }}
      >
        プリセットを追加
      </Button>

      <List>
        {presets.map((preset) => (
          <ListItem
            key={preset.id}
            secondaryAction={
              <Box>
                <IconButton
                  edge="end"
                  aria-label="編集"
                  onClick={() => handleOpenDialog(preset)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="削除"
                  onClick={() => handleDeletePreset(preset.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemText
              primary={preset.name}
              secondary={`${
                preset.actions.length
              }件のアクション: ${preset.actions
                .map((a) => a.action)
                .join(', ')}`}
            />
          </ListItem>
        ))}
      </List>

      {presets.length === 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ py: 3, textAlign: 'center' }}
        >
          プリセットが登録されていません
        </Typography>
      )}

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 2, mt: 3 }}>
          設定を保存しました
        </Alert>
      )}

      <Button variant="contained" onClick={handleSave} fullWidth sx={{ mt: 3 }}>
        保存
      </Button>

      {/* プリセット編集ダイアログ */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingPreset ? 'プリセットを編集' : 'プリセットを追加'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="プリセット名"
            fullWidth
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              アクション一覧
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => handleOpenActionDialog()}
              sx={{ mb: 1 }}
            >
              アクションを追加
            </Button>

            {formActions.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                アクションが登録されていません
              </Typography>
            )}

            {formActions.map((act, index) => (
              <Paper key={`action-${act.action}-${index}`} sx={{ p: 2, mb: 1 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Box>
                    <Typography variant="body1" fontWeight="bold">
                      {act.action}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      結果: {act.results.length}件 | タイプ: {act.types.length}
                      件
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenActionDialog(index)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteAction(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>キャンセル</Button>
          <Button
            onClick={handleSavePreset}
            variant="contained"
            disabled={!formName || formActions.length === 0}
          >
            {editingPreset ? '更新' : '追加'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* アクション編集ダイアログ */}
      <Dialog
        open={actionDialogOpen}
        onClose={handleCloseActionDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingActionIndex === null
            ? 'アクションを追加'
            : 'アクションを編集'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="アクション名"
            fullWidth
            value={actionFormName}
            onChange={(e) => setActionFormName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="結果の選択肢（カンマ区切り）"
            fullWidth
            multiline
            rows={3}
            value={actionFormResults}
            onChange={(e) => setActionFormResults(e.target.value)}
            placeholder="例: Try, Drop Goal, Kick Out"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="タイプの選択肢（カンマ区切り）"
            fullWidth
            multiline
            rows={2}
            value={actionFormTypes}
            onChange={(e) => setActionFormTypes(e.target.value)}
            placeholder="例: BK, FW"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseActionDialog}>キャンセル</Button>
          <Button
            onClick={handleSaveAction}
            variant="contained"
            disabled={!actionFormName}
          >
            {editingActionIndex === null ? '追加' : '更新'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

ActionPresetSettings.displayName = 'ActionPresetSettings';
