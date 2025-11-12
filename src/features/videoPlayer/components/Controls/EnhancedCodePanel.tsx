import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import ClearIcon from '@mui/icons-material/Clear';
import { EnhancedCodeButton } from './EnhancedCodeButton';
import { useCodePanel } from './hooks/useCodePanel';
import { useActionPreset } from '../../../../contexts/ActionPresetContext';

interface EnhancedCodePanelProps {
  addTimelineData: (
    actionName: string,
    startTime: number,
    endTime: number,
    qualifier: string,
  ) => void;
  teamNames: string[];
}

/**
 * SportsCodeスタイルの階層的コードパネル
 * チームごとにアクションを表示し、Result → Type の順に選択
 */
export const EnhancedCodePanel: React.FC<EnhancedCodePanelProps> = ({
  addTimelineData,
  teamNames,
}) => {
  const { activeActions } = useActionPreset();
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    selectedTeam,
    selectedAction,
    selectedResult,
    selectedType,
    availableResults,
    availableTypes,
    isRecording,
    canRecord,
    selectionSummary,
    handleSelectAction,
    handleSelectResult,
    handleSelectType,
    resetSelection,
    toggleRecording,
  } = useCodePanel(activeActions, addTimelineData);

  // Result/Type選択ダイアログを開く
  const handleOpenDialog = () => {
    if (
      selectedAction &&
      (availableResults.length > 0 || availableTypes.length > 0)
    ) {
      setDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // チームごとのアクションボタンをレンダリング
  const renderTeamActions = (teamName: string, teamIndex: number) => {
    const color = teamIndex === 0 ? 'team1' : 'team2';

    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="subtitle2"
          sx={{
            mb: 1,
            fontWeight: 'bold',
            color: `${color}.main`,
          }}
        >
          {teamName}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            flexGrow: 1,
            overflowY: 'auto',
          }}
        >
          {activeActions.map((action) => (
            <Button
              key={action.action}
              variant={
                selectedAction === action.action && selectedTeam === teamName
                  ? 'contained'
                  : 'outlined'
              }
              color={color}
              onClick={() => {
                handleSelectAction(teamName, action.action);
                // アクション選択後、Result/Typeがあればダイアログを自動で開く
                setTimeout(() => {
                  if (action.results.length > 0 || action.types.length > 0) {
                    setDialogOpen(true);
                  }
                }, 100);
              }}
              startIcon={
                isRecording &&
                selectedAction === action.action &&
                selectedTeam === teamName ? (
                  <FiberManualRecordIcon
                    sx={{ animation: 'pulse 1.5s ease-in-out infinite' }}
                  />
                ) : undefined
              }
              sx={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                minHeight: 36,
                fontSize: '0.8rem',
                px: 1.5,
                fontWeight:
                  selectedAction === action.action && selectedTeam === teamName
                    ? 'bold'
                    : 'normal',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                },
              }}
              onDoubleClick={() => {
                if (
                  selectedAction === action.action &&
                  selectedTeam === teamName &&
                  canRecord
                ) {
                  toggleRecording();
                }
              }}
            >
              {action.action}
            </Button>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        gap: 1,
      }}
    >
      {/* コンパクトな選択状態表示 */}
      {selectionSummary && (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Chip
            label={selectionSummary}
            size="small"
            color="primary"
            onClick={handleOpenDialog}
            onDelete={resetSelection}
            deleteIcon={<ClearIcon />}
          />
        </Stack>
      )}

      {/* チーム別アクション選択 */}
      <Box
        sx={{
          flexGrow: selectedAction ? 0 : 1,
          minHeight: selectedAction ? 150 : 0,
        }}
      >
        <Grid container spacing={1} sx={{ height: '100%' }}>
          <Grid item xs={6} sx={{ height: '100%' }}>
            {teamNames[0] && renderTeamActions(teamNames[0], 0)}
          </Grid>
          <Grid item xs={6} sx={{ height: '100%' }}>
            {teamNames[1] && renderTeamActions(teamNames[1], 1)}
          </Grid>
        </Grid>
      </Box>

      {/* Result/Type選択ダイアログ */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '80vh',
          },
        }}
      >
        <DialogTitle>
          {selectedTeam} - {selectedAction}
        </DialogTitle>
        <DialogContent>
          {/* Result選択 */}
          {availableResults.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 'bold', mb: 1 }}
              >
                Result
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gap: 0.75,
                  gridTemplateColumns: 'repeat(2, 1fr)',
                }}
              >
                {availableResults.map((result) => (
                  <EnhancedCodeButton
                    key={result}
                    label={result}
                    isSelected={selectedResult === result}
                    onClick={() => handleSelectResult(result)}
                    size="small"
                    color="secondary"
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Type選択 */}
          {availableTypes.length > 0 && (
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 'bold', mb: 1 }}
              >
                Type
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gap: 0.75,
                  gridTemplateColumns: 'repeat(2, 1fr)',
                }}
              >
                {availableTypes.map((type) => (
                  <EnhancedCodeButton
                    key={type}
                    label={type}
                    isSelected={selectedType === type}
                    onClick={() => handleSelectType(type)}
                    size="small"
                    color="secondary"
                  />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>閉じる</Button>
          <Button
            variant="contained"
            onClick={() => {
              handleCloseDialog();
              if (canRecord) {
                toggleRecording();
              }
            }}
            disabled={!canRecord}
          >
            記録開始
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
