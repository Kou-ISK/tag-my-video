import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tabs,
  Tab,
  Typography,
  Grid,
  Paper,
  Divider,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TimelineIcon from '@mui/icons-material/Timeline';
import PieChartIcon from '@mui/icons-material/PieChart';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import InsightsIcon from '@mui/icons-material/Insights';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TimelineData } from '../../types/TimelineData';
import { useAnalysis } from '../../hooks/useAnalysis';
import { ActionPieChart } from './ActionPieChart';
import { MomentumChart } from './MomentumChart';

export type StatsView = 'possession' | 'results' | 'types' | 'momentum';

interface StatsModalProps {
  open: boolean;
  onClose: () => void;
  view: StatsView;
  onViewChange?: (view: StatsView) => void;
  timeline: TimelineData[];
  teamNames: string[];
}

const TAB_DEFINITIONS: { value: StatsView; label: string; icon: ReactElement }[] = [
  { value: 'possession', label: 'ポゼッション', icon: <PieChartIcon fontSize="small" /> },
  { value: 'results', label: 'アクション結果', icon: <QueryStatsIcon fontSize="small" /> },
  { value: 'types', label: 'アクション種別', icon: <InsightsIcon fontSize="small" /> },
  { value: 'momentum', label: 'モーメンタム', icon: <TimelineIcon fontSize="small" /> },
];

const ACTIONS_TO_SUMMARISE = ['スクラム', 'ラインアウト', 'キック', 'PK'];

const PIE_COLORS = ['#1e88e5', '#43a047', '#fb8c00', '#8e24aa'];

export const StatsModal: React.FC<StatsModalProps> = ({
  open,
  onClose,
  view,
  onViewChange,
  timeline,
  teamNames,
}) => {
  const [currentView, setCurrentView] = useState<StatsView>(view);

  useEffect(() => {
    setCurrentView(view);
  }, [view]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: StatsView) => {
    setCurrentView(newValue);
    onViewChange?.(newValue);
  };

  const {
    calculateActionDuration,
    countActionResultByTeamName,
    countActionTypeByTeamName,
    createMomentumData,
  } = useAnalysis(timeline);

  const possessionData = useMemo(() => {
    return calculateActionDuration().filter((item) => item.name.includes('ポゼッション'));
  }, [calculateActionDuration]);

  const hasTimelineData = timeline.length > 0;
  const resolvedTeamNames = teamNames.length > 0 ? teamNames : ['チームA', 'チームB'];

  const renderNoData = (message: string) => (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px dashed',
        borderColor: 'divider',
        p: 6,
        textAlign: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Paper>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      aria-labelledby="stats-dialog-title"
    >
      <DialogTitle id="stats-dialog-title" sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h6" component="span">
              分析ダッシュボード
            </Typography>
            <Typography variant="body2" color="text.secondary">
              タイムラインから自動集計された指標を確認できます
            </Typography>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 0 }}>
        <Tabs
          value={currentView}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          {TAB_DEFINITIONS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              icon={tab.icon}
              iconPosition="start"
              label={tab.label}
            />
          ))}
        </Tabs>

        {/* ポゼッション */}
        {currentView === 'possession' && (
          <Box>
            {hasTimelineData ? (
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  ポゼッション比較
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={possessionData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        innerRadius="55%"
                        label={({ name, value }) => `${name.replace(' ポゼッション', '')}: ${value.toFixed(0)} sec`}
                      >
                        {possessionData.map((_, index) => (
                          <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend verticalAlign="bottom" iconType="circle" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            ) : (
              renderNoData('ポゼッションを算出するためのタイムラインがまだありません。')
            )}
          </Box>
        )}

        {/* アクション結果 */}
        {currentView === 'results' && (
          <Box>
            {hasTimelineData ? (
              <Stack spacing={3}>
                {ACTIONS_TO_SUMMARISE.map((actionName) => (
                  <Paper key={actionName} elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      {actionName} の結果別割合
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      {resolvedTeamNames.map((team) => (
                        <Grid item xs={12} md={6} key={team}>
                          <ActionPieChart
                            countActionFunction={countActionResultByTeamName}
                            teamName={team}
                            actionName={actionName}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                ))}
              </Stack>
            ) : (
              renderNoData('アクションの結果を表示するにはタイムラインを作成してください。')
            )}
          </Box>
        )}

        {/* アクション種別 */}
        {currentView === 'types' && (
          <Box>
            {hasTimelineData ? (
              <Stack spacing={3}>
                {ACTIONS_TO_SUMMARISE.map((actionName) => (
                  <Paper key={actionName} elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      {actionName} の種別別内訳
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      {resolvedTeamNames.map((team) => (
                        <Grid item xs={12} md={6} key={team}>
                          <ActionPieChart
                            countActionFunction={countActionTypeByTeamName}
                            teamName={team}
                            actionName={actionName}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                ))}
              </Stack>
            ) : (
              renderNoData('アクション種別を表示するにはタイムラインを作成してください。')
            )}
          </Box>
        )}

        {/* モーメンタム */}
        {currentView === 'momentum' && (
          <Box>
            {hasTimelineData ? (
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  モーメンタムチャート
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <MomentumChart
                  createMomentumData={createMomentumData}
                  teamNames={resolvedTeamNames}
                />
              </Paper>
            ) : (
              renderNoData('モーメンタムを表示するにはタイムラインを作成してください。')
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
