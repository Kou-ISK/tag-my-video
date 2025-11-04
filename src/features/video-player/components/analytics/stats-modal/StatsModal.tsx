import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TimelineIcon from '@mui/icons-material/Timeline';
import PieChartIcon from '@mui/icons-material/PieChart';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import InsightsIcon from '@mui/icons-material/Insights';
import { TimelineData } from '../../../../../types/TimelineData';
import { useAnalysis } from '../../../../../hooks/useAnalysis';
import { PossessionTab } from './PossessionTab';
import { ActionBreakdownTab } from './ActionBreakdownTab';
import { MomentumTab } from './MomentumTab';
import { MatrixTab } from './MatrixTab';

export type StatsView =
  | 'possession'
  | 'results'
  | 'types'
  | 'momentum'
  | 'matrix';

interface StatsModalProps {
  open: boolean;
  onClose: () => void;
  view: StatsView;
  onViewChange?: (view: StatsView) => void;
  timeline: TimelineData[];
  teamNames: string[];
  onJumpToSegment?: (segment: TimelineData) => void;
}

interface TabDefinition {
  value: StatsView;
  label: string;
  icon: ReactElement;
}

const TAB_DEFINITIONS: TabDefinition[] = [
  {
    value: 'possession',
    label: 'ポゼッション',
    icon: <PieChartIcon fontSize="small" />,
  },
  {
    value: 'results',
    label: 'アクション結果',
    icon: <QueryStatsIcon fontSize="small" />,
  },
  {
    value: 'types',
    label: 'アクション種別',
    icon: <InsightsIcon fontSize="small" />,
  },
  {
    value: 'momentum',
    label: 'モーメンタム',
    icon: <TimelineIcon fontSize="small" />,
  },
  {
    value: 'matrix',
    label: 'クロス集計',
    icon: <InsightsIcon fontSize="small" />,
  },
];

const ACTIONS_TO_SUMMARISE = ['スクラム', 'ラインアウト', 'キック', 'PK'];

export const StatsModal: React.FC<StatsModalProps> = ({
  open,
  onClose,
  view,
  onViewChange,
  timeline,
  teamNames,
  onJumpToSegment,
}) => {
  const [currentView, setCurrentView] = useState<StatsView>(view);

  useEffect(() => {
    setCurrentView(view);
  }, [view]);

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: StatsView,
  ) => {
    setCurrentView(newValue);
    onViewChange?.(newValue);
  };

  const {
    calculateActionDuration,
    countActionResultByTeamName,
    countActionTypeByTeamName,
    createMomentumData,
  } = useAnalysis(timeline);

  const possessionData = useMemo(
    () =>
      calculateActionDuration().filter((item) =>
        item.name.includes('ポゼッション'),
      ),
    [calculateActionDuration],
  );

  const hasTimelineData = timeline.length > 0;

  const resolvedTeamNames = useMemo(() => {
    const set = new Set<string>();
    teamNames.forEach((name) => set.add(name));
    timeline.forEach((item) => {
      const [team] = item.actionName.split(' ');
      if (team) set.add(team);
    });
    if (set.size === 0) {
      return ['チームA', 'チームB'];
    }
    return Array.from(set);
  }, [teamNames, timeline]);

  const uniqueActionTypes = useMemo(() => {
    const set = new Set<string>();
    timeline.forEach((item) => {
      const value = item.actionType || '未設定';
      set.add(value);
    });
    return Array.from(set).sort();
  }, [timeline]);

  const uniqueActionResults = useMemo(() => {
    const set = new Set<string>();
    timeline.forEach((item) => {
      const value = item.actionResult || '未設定';
      set.add(value);
    });
    return Array.from(set).sort();
  }, [timeline]);

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

        {currentView === 'possession' && (
          <PossessionTab
            hasData={hasTimelineData}
            data={possessionData}
            emptyMessage="ポゼッションを算出するためのタイムラインがまだありません。"
          />
        )}

        {currentView === 'results' && (
          <ActionBreakdownTab
            hasData={hasTimelineData}
            actions={ACTIONS_TO_SUMMARISE}
            teamNames={resolvedTeamNames}
            countActionFunction={countActionResultByTeamName}
            titleFormatter={(actionName) => `${actionName} の結果別割合`}
            emptyMessage="アクションの結果を表示するにはタイムラインを作成してください。"
          />
        )}

        {currentView === 'types' && (
          <ActionBreakdownTab
            hasData={hasTimelineData}
            actions={ACTIONS_TO_SUMMARISE}
            teamNames={resolvedTeamNames}
            countActionFunction={countActionTypeByTeamName}
            titleFormatter={(actionName) => `${actionName} の種別別内訳`}
            emptyMessage="アクション種別を表示するにはタイムラインを作成してください。"
          />
        )}

        {currentView === 'momentum' && (
          <MomentumTab
            hasData={hasTimelineData}
            createMomentumData={createMomentumData}
            teamNames={resolvedTeamNames}
            emptyMessage="モーメンタムを表示するにはタイムラインを作成してください。"
          />
        )}

        {currentView === 'matrix' && (
          <MatrixTab
            hasData={hasTimelineData}
            timeline={timeline}
            teamNames={resolvedTeamNames}
            uniqueActionTypes={uniqueActionTypes}
            uniqueActionResults={uniqueActionResults}
            onJumpToSegment={onJumpToSegment}
            emptyMessage="クロス集計を表示するにはタイムラインを作成してください。"
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
