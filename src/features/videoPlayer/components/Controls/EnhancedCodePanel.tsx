import React from 'react';
import { Box, Typography, Grid, Button } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { EnhancedCodeButton } from './EnhancedCodeButton';
import { useCodePanel } from './hooks/useCodePanel';
import { useActionPreset } from '../../../../contexts/ActionPresetContext';
import type { ActionDefinition } from '../../../../types/Settings';

interface EnhancedCodePanelProps {
  addTimelineData: (
    actionName: string,
    startTime: number,
    endTime: number,
    qualifier: string,
    actionType?: string,
    actionResult?: string,
  ) => void;
  teamNames: string[];
  firstTeamName?: string; // タイムラインと色を一致させるための基準チーム名
}

/**
 * SportsCodeスタイルの階層的コードパネル
 * チームごとにアクションを表示し、Result → Type の順に選択
 */
export const EnhancedCodePanel: React.FC<EnhancedCodePanelProps> = ({
  addTimelineData,
  teamNames,
  firstTeamName,
}) => {
  const { activeActions } = useActionPreset();

  const {
    selectedTeam,
    selectedAction,
    selectedResult,
    selectedType,
    isRecording,
    handleSelectAction,
    handleSelectResult,
    handleSelectType,
    handleSelectAndToggle,
  } = useCodePanel(activeActions, addTimelineData);

  // アクションボタンクリック時の処理
  const handleActionClick = (teamName: string, action: ActionDefinition) => {
    const isSameAction =
      selectedTeam === teamName && selectedAction === action.action;

    // 記録中の同じアクションをクリックした場合は記録終了
    if (isRecording && isSameAction) {
      handleSelectAndToggle(teamName, action.action);
      return;
    }

    // Result/Typeがない場合は即座に記録開始/終了
    if (action.results.length === 0 && action.types.length === 0) {
      handleSelectAndToggle(teamName, action.action);
      return;
    }

    // Result/Typeがある場合
    if (isSameAction) {
      // 既に選択済みで記録中でない場合は記録開始
      // （Result/Typeを変更後、再度クリックして記録開始するケース）
      handleSelectAndToggle(teamName, action.action);
    } else {
      // 初回選択時はインライン展開して即座に記録開始
      handleSelectAction(teamName, action.action);
      // 選択後すぐに記録開始
      setTimeout(() => {
        handleSelectAndToggle(teamName, action.action);
      }, 50);
    }
  };

  // チームごとのアクションボタンをレンダリング
  const renderTeamActions = (teamName: string) => {
    // タイムラインと同じロジックでチーム色を決定
    const referenceTeamName = firstTeamName || teamNames[0];
    const isFirstTeam = teamName === referenceTeamName;
    const color = isFirstTeam ? 'team1' : 'team2';

    return (
      <Box>
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
          }}
        >
          {activeActions.map((action) => {
            const isSelected =
              selectedAction === action.action && selectedTeam === teamName;

            return (
              <Box key={action.action}>
                {/* アクションボタン */}
                <Button
                  variant={isSelected ? 'contained' : 'outlined'}
                  color={color}
                  onClick={() => handleActionClick(teamName, action)}
                  startIcon={
                    isRecording && isSelected ? (
                      <FiberManualRecordIcon
                        sx={{ animation: 'pulse 1.5s ease-in-out infinite' }}
                      />
                    ) : undefined
                  }
                  sx={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    minHeight: 36,
                    fontSize: '0.8rem',
                    px: 1.5,
                    fontWeight: isSelected ? 'bold' : 'normal',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                    },
                  }}
                >
                  {action.action}
                </Button>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  // 選択中のアクションを取得
  const selectedActionDef = activeActions.find(
    (action) => action.action === selectedAction,
  );
  const hasOptions =
    selectedActionDef &&
    (selectedActionDef.results.length > 0 ||
      selectedActionDef.types.length > 0);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={6}>
          {teamNames[0] && renderTeamActions(teamNames[0])}
        </Grid>
        <Grid item xs={6}>
          {teamNames[1] && renderTeamActions(teamNames[1])}
        </Grid>
      </Grid>

      {/* Result/Type選択エリア（全幅で表示） */}
      {hasOptions && selectedActionDef && (
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            backgroundColor: 'action.hover',
            borderRadius: 1,
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {/* Type選択 */}
          {selectedActionDef.types.length > 0 && (
            <Box sx={{ mb: selectedActionDef.results.length > 0 ? 1.5 : 0 }}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 'bold', mb: 0.5, display: 'block' }}
              >
                Type
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gap: 0.5,
                  gridTemplateColumns: 'repeat(4, 1fr)',
                }}
              >
                {selectedActionDef.types.map((type) => (
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

          {/* Result選択 */}
          {selectedActionDef.results.length > 0 && (
            <Box>
              <Typography
                variant="caption"
                sx={{ fontWeight: 'bold', mb: 0.5, display: 'block' }}
              >
                Result
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gap: 0.5,
                  gridTemplateColumns: 'repeat(4, 1fr)',
                }}
              >
                {selectedActionDef.results.map((result) => (
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
        </Box>
      )}
    </Box>
  );
};
