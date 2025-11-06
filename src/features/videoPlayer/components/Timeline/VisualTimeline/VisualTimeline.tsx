import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Box, Typography } from '@mui/material';
import { TimelineData } from '../../../../../types/TimelineData';
import { TimelineHeader } from './TimelineHeader';
import { TimelineAxis } from './TimelineAxis';
import { TimelineLane } from './TimelineLane';
import { TimelineEditDialog, TimelineEditDraft } from './TimelineEditDialog';

interface VisualTimelineProps {
  timeline: TimelineData[];
  maxSec: number;
  currentTime: number;
  onSeek: (time: number) => void;
  onDelete: (ids: string[]) => void;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onUpdateQualifier?: (id: string, qualifier: string) => void;
  onUpdateActionType?: (id: string, actionType: string) => void;
  onUpdateActionResult?: (id: string, actionResult: string) => void;
  onUpdateTimeRange?: (id: string, startTime: number, endTime: number) => void;
}

export const VisualTimeline: React.FC<VisualTimelineProps> = ({
  timeline,
  maxSec,
  currentTime,
  onSeek,
  onDelete,
  selectedIds,
  onSelectionChange,
  onUpdateQualifier,
  onUpdateActionType,
  onUpdateActionResult,
  onUpdateTimeRange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<TimelineEditDraft | null>(
    null,
  );

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const groupedByAction = useMemo(() => {
    const groups: Record<string, TimelineData[]> = {};
    timeline.forEach((item) => {
      const actionName = item.actionName;
      if (!groups[actionName]) {
        groups[actionName] = [];
      }
      groups[actionName].push(item);
    });
    return groups;
  }, [timeline]);

  const actionNames = useMemo(
    () => Object.keys(groupedByAction).sort(),
    [groupedByAction],
  );

  const currentTimePosition = useMemo(() => {
    if (maxSec <= 0) return 0;
    return Math.min(100, Math.max(0, (currentTime / maxSec) * 100));
  }, [currentTime, maxSec]);

  const timeToPosition = useCallback(
    (time: number) => {
      if (maxSec <= 0) return 0;
      return (time / maxSec) * containerWidth;
    },
    [containerWidth, maxSec],
  );

  const positionToTime = useCallback(
    (position: number) => {
      if (containerWidth <= 0) return 0;
      return (position / containerWidth) * maxSec;
    },
    [containerWidth, maxSec],
  );

  const handleTimelineClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const time = positionToTime(clickX);
      onSeek(time);
    },
    [onSeek, positionToTime],
  );

  const handleItemClick = useCallback(
    (event: React.MouseEvent, id: string) => {
      event.stopPropagation();

      if (event.shiftKey) {
        if (selectedIds.includes(id)) {
          onSelectionChange(
            selectedIds.filter((selectedId) => selectedId !== id),
          );
        } else {
          onSelectionChange([...selectedIds, id]);
        }
        return;
      }

      if (event.metaKey || event.ctrlKey) {
        if (selectedIds.includes(id)) {
          onSelectionChange(
            selectedIds.filter((selectedId) => selectedId !== id),
          );
        } else {
          onSelectionChange([...selectedIds, id]);
        }
        return;
      }

      const item = timeline.find((entry) => entry.id === id);
      if (!item) return;
      onSelectionChange([id]);
      onSeek(item.startTime);
    },
    [onSeek, onSelectionChange, selectedIds, timeline],
  );

  const handleItemContextMenu = useCallback(
    (event: React.MouseEvent, id: string) => {
      event.preventDefault();
      event.stopPropagation();
      const item = timeline.find((entry) => entry.id === id);
      if (!item) return;
      setEditingDraft({
        id: item.id,
        actionName: item.actionName,
        qualifier: item.qualifier || '',
        actionType: item.actionType || '',
        actionResult: item.actionResult || '',
        startTime: item.startTime.toString(),
        endTime: item.endTime.toString(),
        originalStartTime: item.startTime,
        originalEndTime: item.endTime,
      });
    },
    [timeline],
  );

  const handleCloseDialog = useCallback(() => {
    setEditingDraft(null);
  }, []);

  const handleDialogChange = useCallback(
    (changes: Partial<TimelineEditDraft>) => {
      setEditingDraft((prev) => (prev ? { ...prev, ...changes } : prev));
    },
    [],
  );

  const handleDeleteSingle = useCallback(() => {
    if (!editingDraft) return;
    onDelete([editingDraft.id]);
    setEditingDraft(null);
  }, [editingDraft, onDelete]);

  const handleSaveDialog = useCallback(() => {
    if (!editingDraft) return;

    const parsedStart = Number(editingDraft.startTime);
    const parsedEnd = Number(editingDraft.endTime);

    const safeStart = Number.isFinite(parsedStart)
      ? Math.max(0, parsedStart)
      : editingDraft.originalStartTime;
    const safeEndSource = Number.isFinite(parsedEnd)
      ? parsedEnd
      : editingDraft.originalEndTime;
    const safeEnd = Math.max(safeStart, safeEndSource);

    if (onUpdateQualifier) {
      onUpdateQualifier(editingDraft.id, editingDraft.qualifier);
    }
    if (onUpdateActionType) {
      onUpdateActionType(editingDraft.id, editingDraft.actionType);
    }
    if (onUpdateActionResult) {
      onUpdateActionResult(editingDraft.id, editingDraft.actionResult);
    }
    if (onUpdateTimeRange) {
      onUpdateTimeRange(editingDraft.id, safeStart, safeEnd);
    }

    setEditingDraft(null);
  }, [
    editingDraft,
    onUpdateQualifier,
    onUpdateActionType,
    onUpdateActionResult,
    onUpdateTimeRange,
  ]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const timeMarkers = useMemo(() => {
    const markers: number[] = [];
    if (maxSec <= 0) return markers;
    const interval = Math.max(10, Math.ceil(maxSec / 50) * 10);
    for (let i = 0; i <= maxSec; i += interval) {
      markers.push(i);
    }
    return markers;
  }, [maxSec]);

  const firstTeamName = actionNames[0]?.split(' ')[0];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <TimelineHeader
        totalCount={timeline.length}
        selectedCount={selectedIds.length}
        onDeleteSelected={() => onDelete(selectedIds)}
      />

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          px: 2,
          pb: 2,
        }}
      >
        <TimelineAxis
          containerRef={containerRef}
          maxSec={maxSec}
          currentTimePosition={currentTimePosition}
          timeMarkers={timeMarkers}
          onSeek={handleTimelineClick}
          formatTime={formatTime}
        />

        {actionNames.map((actionName) => (
          <TimelineLane
            key={actionName}
            actionName={actionName}
            items={groupedByAction[actionName]}
            selectedIds={selectedIds}
            hoveredItemId={hoveredItemId}
            onHoverChange={setHoveredItemId}
            onItemClick={handleItemClick}
            onItemContextMenu={handleItemContextMenu}
            timeToPosition={timeToPosition}
            currentTimePosition={currentTimePosition}
            formatTime={formatTime}
            firstTeamName={firstTeamName}
          />
        ))}

        {timeline.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 200,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              タイムラインが空です。アクションボタンでタグ付けを開始してください。
            </Typography>
          </Box>
        )}
      </Box>

      <TimelineEditDialog
        draft={editingDraft}
        open={Boolean(editingDraft)}
        onChange={handleDialogChange}
        onClose={handleCloseDialog}
        onDelete={handleDeleteSingle}
        onSave={handleSaveDialog}
      />
    </Box>
  );
};
