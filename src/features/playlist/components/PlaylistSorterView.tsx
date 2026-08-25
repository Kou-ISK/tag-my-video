import React, { useMemo, useState } from 'react';
import {
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import FilterList from '@mui/icons-material/FilterList';
import ViewColumn from '@mui/icons-material/ViewColumn';
import type { PlaylistItem } from '../../../types/playlist/core';

export type SorterColumnId =
  | 'index'
  | 'action'
  | 'start'
  | 'duration'
  | 'labels'
  | 'note'
  | 'annotation'
  | 'video';

export interface SorterColumn {
  id: SorterColumnId;
  label: string;
  width: number;
  visible: boolean;
}

export interface PlaylistSorterViewProps {
  items: PlaylistItem[];
  currentIndex: number;
  selectedItemIds: Set<string>;
  onSelectItem: (
    id: string,
    modifiers: { additive: boolean; range: boolean },
  ) => void;
  onPlayItem: (id: string) => void;
  onDeleteSelected: () => void;
}

export const DEFAULT_SORTER_COLUMNS: SorterColumn[] = [
  { id: 'index', label: '#', width: 54, visible: true },
  { id: 'action', label: 'アクション', width: 180, visible: true },
  { id: 'start', label: '開始', width: 92, visible: true },
  { id: 'duration', label: '長さ', width: 76, visible: true },
  { id: 'labels', label: 'ラベル', width: 180, visible: true },
  { id: 'note', label: 'メモ', width: 180, visible: true },
  { id: 'annotation', label: '注釈', width: 70, visible: true },
  { id: 'video', label: '映像', width: 130, visible: true },
];

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainder = (seconds % 60).toFixed(1).padStart(4, '0');
  return `${minutes}:${remainder}`;
};

const labelsFor = (item: PlaylistItem): string =>
  item.labels?.map((label) => label.name).join(' / ') ?? '';

export const getSorterCellValue = (
  item: PlaylistItem,
  column: SorterColumnId,
): string | number => {
  switch (column) {
    case 'action':
      return item.actionName;
    case 'start':
      return item.startTime;
    case 'duration':
      return item.endTime - item.startTime;
    case 'labels':
      return labelsFor(item);
    case 'note':
      return item.note ?? item.memo ?? '';
    case 'annotation':
      return item.annotation ? 1 : 0;
    case 'video':
      return item.videoSource ?? '';
    case 'index':
      return 0;
  }
};

export const sortSorterItems = (
  items: PlaylistItem[],
  column: SorterColumnId | null,
  direction: 'asc' | 'desc' | null,
): PlaylistItem[] => {
  if (!column || !direction) return items;
  const multiplier = direction === 'asc' ? 1 : -1;
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const left = getSorterCellValue(a.item, column);
      const right = getSorterCellValue(b.item, column);
      const comparison =
        typeof left === 'number' && typeof right === 'number'
          ? left - right
          : String(left).localeCompare(String(right), 'ja');
      return comparison * multiplier || a.index - b.index;
    })
    .map(({ item }) => item);
};

export const PlaylistSorterView = ({
  items,
  currentIndex,
  selectedItemIds,
  onSelectItem,
  onPlayItem,
  onDeleteSelected,
}: PlaylistSorterViewProps): React.ReactElement => {
  const [columns, setColumns] = useState<SorterColumn[]>(DEFAULT_SORTER_COLUMNS);
  const [query, setQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<SorterColumnId | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<HTMLElement | null>(null);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return items;
    return items.filter((item) =>
      [item.actionName, labelsFor(item), item.note, item.memo]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase()
        .includes(normalized),
    );
  }, [items, query]);
  const displayItems = useMemo(
    () => sortSorterItems(filteredItems, sortColumn, sortDirection),
    [filteredItems, sortColumn, sortDirection],
  );
  const visibleColumns = columns.filter((column) => column.visible);

  const toggleSort = (column: SorterColumnId): void => {
    if (sortColumn !== column) {
      setSortColumn(column);
      setSortDirection('asc');
    } else if (sortDirection === 'asc') setSortDirection('desc');
    else {
      setSortColumn(null);
      setSortDirection(null);
    }
  };

  return (
    <Paper
      component="section"
      elevation={0}
      data-testid="playlist-sorter"
      aria-label="Sorter workspace"
      onKeyDown={(event) => {
        if ((event.key === 'Delete' || event.key === 'Backspace') && event.target === event.currentTarget) {
          event.preventDefault();
          onDeleteSelected();
        }
      }}
      tabIndex={0}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}
    >
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ px: 1, py: 0.5, borderBottom: 1, borderColor: 'divider' }}>
        <TextField
          size="small"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="クリップを検索"
          aria-label="Sorter search"
          sx={{ width: 240, '& .MuiInputBase-root': { height: 28, fontSize: 12 } }}
          InputProps={{ startAdornment: <InputAdornment position="start"><FilterList sx={{ fontSize: 16 }} /></InputAdornment> }}
        />
        <Box sx={{ flex: 1 }} />
        <Tooltip title="表示列"><IconButton size="small" aria-label="表示列" onClick={(event) => setColumnMenuAnchor(event.currentTarget)}><ViewColumn fontSize="small" /></IconButton></Tooltip>
        <Menu anchorEl={columnMenuAnchor} open={Boolean(columnMenuAnchor)} onClose={() => setColumnMenuAnchor(null)}>
          {columns.filter((column) => column.id !== 'index').map((column) => (
            <MenuItem key={column.id} dense>
              <FormControlLabel
                control={<Checkbox size="small" checked={column.visible} onChange={() => setColumns((previous) => previous.map((entry) => entry.id === column.id ? { ...entry, visible: !entry.visible } : entry))} />}
                label={column.label}
              />
            </MenuItem>
          ))}
        </Menu>
        <Typography variant="caption" color="text.secondary">{displayItems.length}/{items.length}</Typography>
      </Stack>
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Table size="small" stickyHeader sx={{ minWidth: 960, tableLayout: 'fixed', '& th, & td': { borderColor: 'divider', py: 0.25, px: 0.75, height: 28, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 12 } }}>
          <TableHead>
            <TableRow>
              {visibleColumns.map((column) => {
                const sorted = sortColumn === column.id;
                return <TableCell key={column.id} component="th" scope="col" onClick={() => toggleSort(column.id)} sx={{ width: column.width, cursor: 'pointer', fontWeight: 600, position: column.id === 'index' ? 'sticky' : undefined, left: column.id === 'index' ? 0 : undefined, zIndex: column.id === 'index' ? 4 : 3 }} aria-sort={sorted ? sortDirection === 'asc' ? 'ascending' : 'descending' : 'none'}>{column.label}{sorted ? (sortDirection === 'asc' ? ' ↑' : ' ↓') : ''}</TableCell>;
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {displayItems.map((item) => {
              const sourceIndex = items.findIndex((entry) => entry.id === item.id);
              const playing = sourceIndex === currentIndex;
              const selected = selectedItemIds.has(item.id);
              return <TableRow key={item.id} hover selected={selected} data-testid={`sorter-row-${item.id}`} onClick={(event) => onSelectItem(item.id, { additive: event.metaKey || event.ctrlKey, range: event.shiftKey })} onDoubleClick={() => onPlayItem(item.id)} sx={{ cursor: 'pointer', '&.Mui-selected': { bgcolor: 'action.selected' }, ...(playing ? { borderLeft: 2, borderColor: 'primary.main' } : {}) }}>
                {visibleColumns.map((column) => {
                  let value: React.ReactNode;
                  switch (column.id) {
                    case 'index': value = sourceIndex + 1; break;
                    case 'action': value = item.actionName; break;
                    case 'start': value = formatTime(item.startTime); break;
                    case 'duration': value = `${(item.endTime - item.startTime).toFixed(1)}s`; break;
                    case 'labels': value = labelsFor(item); break;
                    case 'note': value = item.note ?? item.memo ?? ''; break;
                    case 'annotation': value = item.annotation ? '●' : ''; break;
                    case 'video': value = item.videoSource ? 'Angle 1' : ''; break;
                  }
                  return <TableCell key={column.id} sx={{ fontVariantNumeric: column.id === 'start' || column.id === 'duration' ? 'tabular-nums' : undefined, position: column.id === 'index' ? 'sticky' : undefined, left: column.id === 'index' ? 0 : undefined, bgcolor: column.id === 'index' ? 'background.paper' : undefined, zIndex: column.id === 'index' ? 1 : undefined }}>{value}</TableCell>;
                })}
              </TableRow>;
            })}
          </TableBody>
        </Table>
        {items.length === 0 ? <Typography color="text.secondary" sx={{ p: 3 }}>プレイリストが空です。タイムラインからクリップを追加してください。</Typography> : displayItems.length === 0 ? <Typography color="text.secondary" sx={{ p: 3 }}>検索結果がありません。検索条件を解除してください。</Typography> : null}
      </Box>
    </Paper>
  );
};
