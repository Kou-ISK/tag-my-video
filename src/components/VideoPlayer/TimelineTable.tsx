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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
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

  useEffect(() => {
    if (!timelineFilePath) {
      return;
    }

    let isActive = true;
    fetch(timelineFilePath)
      .then((response) => response.json())
      .then((data) => {
        if (isActive) {
          setTimeline(data);
        }
      })
      .catch((error) => console.error('Error loading JSON:', error));

    return () => {
      isActive = false;
    };
  }, [timelineFilePath, setTimeline]);

  const filteredTimeline = useMemo(() => {
    if (!filterText.trim()) return timeline;
    const keyword = filterText.toLowerCase();
    return timeline.filter((item) => {
      return (
        item.actionName.toLowerCase().includes(keyword) ||
        item.qualifier.toLowerCase().includes(keyword) ||
        item.actionResult.toLowerCase().includes(keyword) ||
        item.actionType.toLowerCase().includes(keyword)
      );
    });
  }, [timeline, filterText]);

  const handleSort = (column: SortColumn) => {
    const nextDesc = sortColumn === column ? !isDesc : true;
    setSortColumn(column);
    setIsDesc(nextDesc);
    sortTimelineDatas(column, nextDesc);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
        sx={{ p: { xs: 1, md: 1.5 } }}
      >
        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
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
        <TextField
          value={filterText}
          onChange={(event) => setFilterText(event.target.value)}
          placeholder="アクション・タグで絞り込み"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>
      <TableContainer sx={{ flex: 1, minHeight: 0 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell
                sortDirection={
                  sortColumn === 'actionName' ? (isDesc ? 'desc' : 'asc') : false
                }
              >
                <TableSortLabel
                  active={sortColumn === 'actionName'}
                  direction={sortColumn === 'actionName' && !isDesc ? 'asc' : 'desc'}
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
                  direction={sortColumn === 'startTime' && !isDesc ? 'asc' : 'desc'}
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
                  direction={sortColumn === 'endTime' && !isDesc ? 'asc' : 'desc'}
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
                      onChange={(event) => getSelectedTimelineId(event, item.id)}
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
                        handleCurrentTime(e as React.SyntheticEvent, item.startTime)
                      }
                    >
                      {formatTime(item.startTime)}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={(e) =>
                        handleCurrentTime(e as React.SyntheticEvent, item.endTime)
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
