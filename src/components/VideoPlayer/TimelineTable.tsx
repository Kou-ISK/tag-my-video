import {
  Box,
  Button,
  Checkbox,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { TimelineData } from '../../types/TimelineData';
import { ActionTypeSelector } from './ActionTypeSelector';
import { ActionResultSelector } from './ActionResultSelector';
import React from 'react';

type SortColumn = 'actionName' | 'startTime' | 'endTime';

interface TimelineTableProps {
  timelineFilePath: string;
  handleCurrentTime: (
    event: React.SyntheticEvent | Event,
    newValue: number | number[],
  ) => void;
  timeline: TimelineData[];
  setTimeline: Dispatch<SetStateAction<TimelineData[]>>;
  getSelectedTimelineId: (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string,
  ) => void;
  updateQualifier: (id: string, qualifier: string) => void;
  updateActionResult: (id: string, actionResult: string) => void;
  updateActionType: (id: string, actionType: string) => void;
  sortTimelineDatas: (column: string, sortDesc: boolean) => void;
  currentTime?: number;
  selectedTimelineIds?: string[];
}

const formatTime = (seconds: number) => {
  if (Number.isNaN(seconds)) return '-';
  const whole = Math.max(seconds, 0);
  const mm = Math.floor(whole / 60)
    .toString()
    .padStart(2, '0');
  const ss = Math.floor(whole % 60)
    .toString()
    .padStart(2, '0');
  return `${mm}:${ss}`;
};

export const TimelineTable = ({
  timelineFilePath,
  handleCurrentTime,
  timeline,
  setTimeline,
  getSelectedTimelineId,
  updateQualifier,
  updateActionResult,
  updateActionType,
  sortTimelineDatas,
  currentTime = 0,
  selectedTimelineIds = [],
}: TimelineTableProps) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>('startTime');
  const [isDesc, setIsDesc] = useState<boolean>(true);
  const [filterText, setFilterText] = useState<string>('');
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('all');
  const [actionNameFilter, setActionNameFilter] = useState<string>('all');
  const [resultFilter, setResultFilter] = useState<string>('all');

  // チーム名、種別、アクション名、結果の抽出
  const teamNames = useMemo(() => {
    const teams = new Set<string>();
    timeline.forEach((item) => {
      const teamName = item.actionName.split(' ')[0];
      if (teamName) teams.add(teamName);
    });
    return Array.from(teams);
  }, [timeline]);

  const actionTypes = useMemo(() => {
    const types = new Set<string>();
    timeline.forEach((item) => {
      if (item.actionType) types.add(item.actionType);
    });
    return Array.from(types);
  }, [timeline]);

  const actionNames = useMemo(() => {
    const names = new Set<string>();
    timeline.forEach((item) => {
      // チーム名を除いたアクション名を抽出
      const parts = item.actionName.split(' ');
      if (parts.length > 1) {
        const actionName = parts.slice(1).join(' ');
        if (actionName) names.add(actionName);
      }
    });
    return Array.from(names).sort();
  }, [timeline]);

  const actionResults = useMemo(() => {
    const results = new Set<string>();
    timeline.forEach((item) => {
      if (item.actionResult) results.add(item.actionResult);
    });
    return Array.from(results);
  }, [timeline]);

  const filteredTimeline = useMemo(() => {
    let filtered = timeline;

    // テキスト検索
    if (filterText.trim()) {
      const keyword = filterText.toLowerCase();
      filtered = filtered.filter((item) => {
        return (
          item.actionName.toLowerCase().includes(keyword) ||
          item.qualifier.toLowerCase().includes(keyword) ||
          item.actionResult.toLowerCase().includes(keyword) ||
          item.actionType.toLowerCase().includes(keyword)
        );
      });
    }

    // チームフィルタ
    if (teamFilter !== 'all') {
      filtered = filtered.filter((item) =>
        item.actionName.startsWith(teamFilter),
      );
    }

    // アクション種別フィルタ
    if (actionTypeFilter !== 'all') {
      filtered = filtered.filter(
        (item) => item.actionType === actionTypeFilter,
      );
    }

    // アクション名フィルタ
    if (actionNameFilter !== 'all') {
      filtered = filtered.filter((item) => {
        const parts = item.actionName.split(' ');
        const actionName = parts.slice(1).join(' ');
        return actionName === actionNameFilter;
      });
    }

    // 結果フィルタ
    if (resultFilter !== 'all') {
      filtered = filtered.filter((item) => item.actionResult === resultFilter);
    }

    return filtered;
  }, [
    timeline,
    filterText,
    teamFilter,
    actionTypeFilter,
    actionNameFilter,
    resultFilter,
  ]);

  const hasActiveFilters =
    filterText.trim() !== '' ||
    teamFilter !== 'all' ||
    actionTypeFilter !== 'all' ||
    actionNameFilter !== 'all' ||
    resultFilter !== 'all';

  const resetFilters = () => {
    setFilterText('');
    setTeamFilter('all');
    setActionTypeFilter('all');
    setActionNameFilter('all');
    setResultFilter('all');
  };

  const handleSort = (column: SortColumn) => {
    const nextDesc = sortColumn === column ? !isDesc : true;
    setSortColumn(column);
    setIsDesc(nextDesc);
    sortTimelineDatas(column, nextDesc);
  };

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
    >
      {/* フィルタバー */}
      <Stack spacing={1.5} sx={{ p: { xs: 1, md: 1.5 } }}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="subtitle1">
            タイムライン
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
              sx={{ ml: 1 }}
            >
              {filteredTimeline.length}件 / 全{timeline.length}件
            </Typography>
          </Typography>

          {hasActiveFilters && (
            <Tooltip title="フィルタをリセット">
              <IconButton size="small" onClick={resetFilters}>
                <FilterListOffIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        {/* フィルタ行 */}
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          alignItems="center"
        >
          <TextField
            value={filterText}
            onChange={(event) => setFilterText(event.target.value)}
            placeholder="検索..."
            size="small"
            sx={{ minWidth: { xs: '100%', sm: 160 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>チーム</InputLabel>
            <Select
              value={teamFilter}
              label="チーム"
              onChange={(e) => setTeamFilter(e.target.value)}
            >
              <MenuItem value="all">全て</MenuItem>
              {teamNames.map((team) => (
                <MenuItem key={team} value={team}>
                  {team}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>アクション</InputLabel>
            <Select
              value={actionNameFilter}
              label="アクション"
              onChange={(e) => setActionNameFilter(e.target.value)}
            >
              <MenuItem value="all">全て</MenuItem>
              {actionNames.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>種別</InputLabel>
            <Select
              value={actionTypeFilter}
              label="種別"
              onChange={(e) => setActionTypeFilter(e.target.value)}
            >
              <MenuItem value="all">全て</MenuItem>
              {actionTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type || '未分類'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>結果</InputLabel>
            <Select
              value={resultFilter}
              label="結果"
              onChange={(e) => setResultFilter(e.target.value)}
            >
              <MenuItem value="all">全て</MenuItem>
              {actionResults.map((result) => (
                <MenuItem key={result} value={result}>
                  {result || '未設定'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* アクティブフィルタのChip表示 */}
        {hasActiveFilters && (
          <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
            {filterText && (
              <Chip
                label={`検索: "${filterText}"`}
                size="small"
                onDelete={() => setFilterText('')}
              />
            )}
            {teamFilter !== 'all' && (
              <Chip
                label={`チーム: ${teamFilter}`}
                size="small"
                onDelete={() => setTeamFilter('all')}
              />
            )}
            {actionNameFilter !== 'all' && (
              <Chip
                label={`アクション: ${actionNameFilter}`}
                size="small"
                onDelete={() => setActionNameFilter('all')}
              />
            )}
            {actionTypeFilter !== 'all' && (
              <Chip
                label={`種別: ${actionTypeFilter}`}
                size="small"
                onDelete={() => setActionTypeFilter('all')}
              />
            )}
            {resultFilter !== 'all' && (
              <Chip
                label={`結果: ${resultFilter}`}
                size="small"
                onDelete={() => setResultFilter('all')}
              />
            )}
          </Stack>
        )}
      </Stack>

      <TableContainer sx={{ flex: 1, minHeight: 0 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell
                sortDirection={
                  sortColumn === 'actionName'
                    ? isDesc
                      ? 'desc'
                      : 'asc'
                    : false
                }
              >
                <TableSortLabel
                  active={sortColumn === 'actionName'}
                  direction={
                    sortColumn === 'actionName' && !isDesc ? 'asc' : 'desc'
                  }
                  onClick={() => handleSort('actionName')}
                >
                  アクション
                </TableSortLabel>
              </TableCell>
              <TableCell
                sortDirection={
                  sortColumn === 'startTime' ? (isDesc ? 'desc' : 'asc') : false
                }
              >
                <TableSortLabel
                  active={sortColumn === 'startTime'}
                  direction={
                    sortColumn === 'startTime' && !isDesc ? 'asc' : 'desc'
                  }
                  onClick={() => handleSort('startTime')}
                >
                  開始
                </TableSortLabel>
              </TableCell>
              <TableCell
                sortDirection={
                  sortColumn === 'endTime' ? (isDesc ? 'desc' : 'asc') : false
                }
              >
                <TableSortLabel
                  active={sortColumn === 'endTime'}
                  direction={
                    sortColumn === 'endTime' && !isDesc ? 'asc' : 'desc'
                  }
                  onClick={() => handleSort('endTime')}
                >
                  終了
                </TableSortLabel>
              </TableCell>
              <TableCell>タグ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTimeline.map((item) => {
              const isActive =
                currentTime >= item.startTime && currentTime <= item.endTime;
              const isSelected = selectedTimelineIds.includes(item.id);

              return (
                <TableRow
                  key={item.id}
                  hover
                  selected={isSelected}
                  sx={{
                    position: 'relative',
                    ...(isActive
                      ? {
                          backgroundColor: 'action.hover',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: 0,
                            width: 3,
                            bgcolor: 'primary.main',
                          },
                        }
                      : {}),
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event) =>
                        getSelectedTimelineId(event, item.id)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap>
                      {item.actionName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={(e) =>
                        handleCurrentTime(
                          e as React.SyntheticEvent,
                          item.startTime,
                        )
                      }
                    >
                      {formatTime(item.startTime)}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={(e) =>
                        handleCurrentTime(
                          e as React.SyntheticEvent,
                          item.endTime,
                        )
                      }
                    >
                      {formatTime(item.endTime)}
                    </Button>
                  </TableCell>
                  <TableCell sx={{ minWidth: 220 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ActionTypeSelector
                        id={item.id}
                        actionName={item.actionName}
                        actionType={item.actionType}
                        updateActionType={updateActionType}
                      />
                      <ActionResultSelector
                        id={item.id}
                        actionName={item.actionName}
                        actionResult={item.actionResult}
                        updateActionResult={updateActionResult}
                      />
                      <TextField
                        value={item.qualifier}
                        onChange={(event) =>
                          updateQualifier(item.id, event.currentTarget.value)
                        }
                        size="small"
                        placeholder="メモ"
                        sx={{ minWidth: 140 }}
                      />
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredTimeline.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary">
                    一致するタイムラインがありません
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
