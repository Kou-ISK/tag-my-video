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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
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

const TAB_DEFINITIONS: {
  value: StatsView;
  label: string;
  icon: ReactElement;
}[] = [
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

const PIE_COLORS = ['#1e88e5', '#43a047', '#fb8c00', '#8e24aa'];

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
  const [matrixDetail, setMatrixDetail] = useState<{
    title: string;
    entries: TimelineData[];
  } | null>(null);

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

  const possessionData = useMemo(() => {
    return calculateActionDuration().filter((item) =>
      item.name.includes('ポゼッション'),
    );
  }, [calculateActionDuration]);

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

  const buildMatrix = (
    entries: TimelineData[],
    rowKeys: string[],
    columnKeys: string[],
    rowAccessor: (item: TimelineData) => string,
    colAccessor: (item: TimelineData) => string,
  ) => {
    if (rowKeys.length === 0 || columnKeys.length === 0) {
      return [] as Array<Array<{ count: number; entries: TimelineData[] }>>;
    }

    const rowMap = new Map<string, number>();
    rowKeys.forEach((key, index) => rowMap.set(key, index));
    const colMap = new Map<string, number>();
    columnKeys.forEach((key, index) => colMap.set(key, index));

    const cells: Array<Array<{ count: number; entries: TimelineData[] }>> =
      rowKeys.map(() =>
        columnKeys.map(() => ({ count: 0, entries: [] as TimelineData[] })),
      );

    entries.forEach((item) => {
      const rowKey = rowAccessor(item);
      const colKey = colAccessor(item);
      const rowIndex = rowMap.get(rowKey);
      const colIndex = colMap.get(colKey);
      if (rowIndex === undefined || colIndex === undefined) {
        return;
      }
      const cell = cells[rowIndex]?.[colIndex];
      if (!cell) {
        return;
      }
      cell.count += 1;
      cell.entries.push(item);
    });

    return cells;
  };

  const actionTypeVsResult = useMemo(() => {
    return buildMatrix(
      timeline,
      uniqueActionTypes,
      uniqueActionResults,
      (item) => item.actionType || '未設定',
      (item) => item.actionResult || '未設定',
    );
  }, [timeline, uniqueActionTypes, uniqueActionResults]);

  const actionsByTeam = useMemo(() => {
    const map = new Map<
      string,
      {
        actions: string[];
        byType: Array<Array<{ count: number; entries: TimelineData[] }>>;
        byResult: Array<Array<{ count: number; entries: TimelineData[] }>>;
      }
    >();

    resolvedTeamNames.forEach((team) => {
      const entries = timeline.filter((item) =>
        item.actionName.startsWith(`${team} `),
      );
      const actionSet = new Set<string>();
      entries.forEach((item) => {
        const parts = item.actionName.split(' ');
        const baseAction = parts.slice(1).join(' ') || parts[0] || '未設定';
        actionSet.add(baseAction);
      });
      const actions = Array.from(actionSet).sort();

      const byType = buildMatrix(
        entries,
        actions,
        uniqueActionTypes,
        (item) => {
          const parts = item.actionName.split(' ');
          return parts.slice(1).join(' ') || parts[0] || '未設定';
        },
        (item) => item.actionType || '未設定',
      );

      const byResult = buildMatrix(
        entries,
        actions,
        uniqueActionResults,
        (item) => {
          const parts = item.actionName.split(' ');
          return parts.slice(1).join(' ') || parts[0] || '未設定';
        },
        (item) => item.actionResult || '未設定',
      );

      map.set(team, { actions, byType, byResult });
    });

    return map;
  }, [resolvedTeamNames, timeline, uniqueActionTypes, uniqueActionResults]);

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
                        label={({ name, value }) =>
                          `${name.replace(
                            ' ポゼッション',
                            '',
                          )}: ${value.toFixed(0)} sec`
                        }
                      >
                        {possessionData.map((_, index) => (
                          <Cell
                            key={index}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        height={36}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            ) : (
              renderNoData(
                'ポゼッションを算出するためのタイムラインがまだありません。',
              )
            )}
          </Box>
        )}

        {/* アクション結果 */}
        {currentView === 'results' && (
          <Box>
            {hasTimelineData ? (
              <Stack spacing={3}>
                {ACTIONS_TO_SUMMARISE.map((actionName) => (
                  <Paper
                    key={actionName}
                    elevation={1}
                    sx={{ p: 3, borderRadius: 2 }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 2 }}
                    >
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
              renderNoData(
                'アクションの結果を表示するにはタイムラインを作成してください。',
              )
            )}
          </Box>
        )}

        {/* アクション種別 */}
        {currentView === 'types' && (
          <Box>
            {hasTimelineData ? (
              <Stack spacing={3}>
                {ACTIONS_TO_SUMMARISE.map((actionName) => (
                  <Paper
                    key={actionName}
                    elevation={1}
                    sx={{ p: 3, borderRadius: 2 }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 2 }}
                    >
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
              renderNoData(
                'アクション種別を表示するにはタイムラインを作成してください。',
              )
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
              renderNoData(
                'モーメンタムを表示するにはタイムラインを作成してください。',
              )
            )}
          </Box>
        )}

        {/* クロス集計 */}
        {currentView === 'matrix' && (
          <Box>
            {hasTimelineData ? (
              <Stack spacing={4}>
                <MatrixSection
                  title="アクション種別 × アクション結果"
                  rowKeys={uniqueActionTypes}
                  columnKeys={uniqueActionResults}
                  matrix={actionTypeVsResult}
                  onDrilldown={(title, entries) =>
                    setMatrixDetail({ title, entries })
                  }
                />
                {Array.from(actionsByTeam.entries()).map(([team, matrices]) => {
                  if (matrices.actions.length === 0) {
                    return null;
                  }
                  return (
                    <Stack key={team} spacing={3}>
                      <MatrixSection
                        title={`${team} - アクション × アクション種別`}
                        rowKeys={matrices.actions}
                        columnKeys={uniqueActionTypes}
                        matrix={matrices.byType}
                        onDrilldown={(title, entries) =>
                          setMatrixDetail({ title, entries })
                        }
                      />
                      <MatrixSection
                        title={`${team} - アクション × アクション結果`}
                        rowKeys={matrices.actions}
                        columnKeys={uniqueActionResults}
                        matrix={matrices.byResult}
                        onDrilldown={(title, entries) =>
                          setMatrixDetail({ title, entries })
                        }
                      />
                    </Stack>
                  );
                })}
              </Stack>
            ) : (
              renderNoData(
                'クロス集計を表示するにはタイムラインを作成してください。',
              )
            )}
          </Box>
        )}
      </DialogContent>

      <DrilldownDialog
        detail={matrixDetail}
        onClose={() => setMatrixDetail(null)}
        onJump={(segment) => {
          onJumpToSegment?.(segment);
          setMatrixDetail(null);
        }}
      />
    </Dialog>
  );
};

interface MatrixSectionProps {
  title: string;
  rowKeys: string[];
  columnKeys: string[];
  matrix: Array<Array<{ count: number; entries: TimelineData[] }>>;
  onDrilldown: (title: string, entries: TimelineData[]) => void;
}

const MatrixSection: React.FC<MatrixSectionProps> = ({
  title,
  rowKeys,
  columnKeys,
  matrix,
  onDrilldown,
}) => {
  if (rowKeys.length === 0 || columnKeys.length === 0) {
    return null;
  }

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ borderRadius: 2 }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>行/列</TableCell>
              {columnKeys.map((column) => (
                <TableCell key={column} align="center" sx={{ fontWeight: 600 }}>
                  {column || '未設定'}
                </TableCell>
              ))}
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                合計
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rowKeys.map((rowKey, rowIndex) => {
              const rowCells = matrix[rowIndex] ?? [];
              const rowTotal = rowCells.reduce(
                (sum, cell) => sum + cell.count,
                0,
              );
              return (
                <TableRow key={rowKey} hover>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {rowKey || '未設定'}
                  </TableCell>
                  {columnKeys.map((columnKey, colIndex) => {
                    const cell = rowCells[colIndex] ?? {
                      count: 0,
                      entries: [],
                    };
                    const titleLabel = `${title} - ${rowKey || '未設定'} × ${
                      columnKey || '未設定'
                    }`;
                    return (
                      <TableCell key={`${rowKey}-${columnKey}`} align="center">
                        {cell.count > 0 ? (
                          <Button
                            size="small"
                            onClick={() =>
                              onDrilldown(titleLabel, cell.entries)
                            }
                          >
                            {cell.count}
                          </Button>
                        ) : (
                          <Typography variant="caption" color="text.disabled">
                            0
                          </Typography>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell align="center">
                    <Typography variant="body2" color="text.secondary">
                      {rowTotal}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

interface DrilldownDialogProps {
  detail: { title: string; entries: TimelineData[] } | null;
  onClose: () => void;
  onJump: (entry: TimelineData) => void;
}

const DrilldownDialog: React.FC<DrilldownDialogProps> = ({
  detail,
  onClose,
  onJump,
}) => {
  if (!detail) return null;

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {detail.title}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {detail.entries.map((entry, index) => {
            const actionParts = entry.actionName.split(' ');
            const team = actionParts[0];
            const action = actionParts.slice(1).join(' ');
            return (
              <Paper
                key={`${entry.id}-${index}`}
                variant="outlined"
                sx={{ p: 2, borderRadius: 2 }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  justifyContent="space-between"
                >
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {team}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      アクション: {action}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        size="small"
                        label={`種別: ${entry.actionType || '未設定'}`}
                      />
                      <Chip
                        size="small"
                        label={`結果: ${entry.actionResult || '未設定'}`}
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {entry.startTime.toFixed(1)}s - {entry.endTime.toFixed(1)}
                      s
                    </Typography>
                  </Stack>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => onJump(entry)}
                  >
                    この場面を再生
                  </Button>
                </Stack>
              </Paper>
            );
          })}

          {detail.entries.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              この組み合わせに該当するタイムラインはありません。
            </Typography>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
