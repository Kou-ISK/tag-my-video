import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Box, Typography } from '@mui/material';
import { TimelineData } from '../../../../../types/TimelineData';
import { TimelineAxis } from './TimelineAxis';
import { TimelineLane } from './TimelineLane';
import { TimelineEditDialog, TimelineEditDraft } from './TimelineEditDialog';
import { TimelineContextMenu } from './TimelineContextMenu';

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
  onUpdateTimelineItem?: (
    id: string,
    updates: Partial<Omit<TimelineData, 'id'>>,
  ) => void;
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
  onUpdateTimelineItem,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<TimelineEditDraft | null>(
    null,
  );
  const [contextMenu, setContextMenu] = useState<{
    position: { top: number; left: number };
    itemId: string;
  } | null>(null);

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

      // コンテキストメニューを表示
      setContextMenu({
        position: { top: event.clientY, left: event.clientX },
        itemId: id,
      });

      // 選択されていない場合は選択
      if (!selectedIds.includes(id)) {
        onSelectionChange([id]);
      }
    },
    [selectedIds, onSelectionChange],
  );

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleContextMenuEdit = useCallback(() => {
    if (!contextMenu) return;
    const item = timeline.find((entry) => entry.id === contextMenu.itemId);
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
    setContextMenu(null);
  }, [contextMenu, timeline]);

  const handleContextMenuDelete = useCallback(() => {
    if (!contextMenu) return;
    onDelete([contextMenu.itemId]);
    setContextMenu(null);
  }, [contextMenu, onDelete]);

  const handleContextMenuJumpTo = useCallback(() => {
    if (!contextMenu) return;
    const item = timeline.find((entry) => entry.id === contextMenu.itemId);
    if (!item) return;
    onSeek(item.startTime);
    setContextMenu(null);
  }, [contextMenu, timeline, onSeek]);

  const handleContextMenuDuplicate = useCallback(() => {
    if (!contextMenu) return;
    const item = timeline.find((entry) => entry.id === contextMenu.itemId);
    if (!item) return;

    // 複製機能は今後実装予定
    console.log('Duplicate item:', item);
    setContextMenu(null);
  }, [contextMenu, timeline]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      // フォーカスされているアイテムがない場合は最初のアイテムをフォーカス
      if (!focusedItemId && timeline.length > 0) {
        if (
          ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(
            event.key,
          )
        ) {
          event.preventDefault();
          setFocusedItemId(timeline[0].id);
          onSelectionChange([timeline[0].id]);
          return;
        }
      }

      if (!focusedItemId) return;
      const currentIndex = timeline.findIndex(
        (item) => item.id === focusedItemId,
      );
      if (currentIndex === -1) return;

      switch (event.key) {
        case 'ArrowUp': {
          event.preventDefault();
          if (currentIndex > 0) {
            const nextId = timeline[currentIndex - 1].id;
            setFocusedItemId(nextId);
            onSelectionChange([nextId]);
          }
          break;
        }
        case 'ArrowDown': {
          event.preventDefault();
          if (currentIndex < timeline.length - 1) {
            const nextId = timeline[currentIndex + 1].id;
            setFocusedItemId(nextId);
            onSelectionChange([nextId]);
          }
          break;
        }
        case 'Enter': {
          event.preventDefault();
          const item = timeline[currentIndex];
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
          break;
        }
        case 'Delete':
        case 'Backspace': {
          event.preventDefault();
          onDelete([focusedItemId]);
          // フォーカスを次のアイテムに移動
          if (currentIndex < timeline.length - 1) {
            setFocusedItemId(timeline[currentIndex + 1].id);
            onSelectionChange([timeline[currentIndex + 1].id]);
          } else if (currentIndex > 0) {
            setFocusedItemId(timeline[currentIndex - 1].id);
            onSelectionChange([timeline[currentIndex - 1].id]);
          } else {
            setFocusedItemId(null);
          }
          break;
        }
        default:
          break;
      }
    },
    [focusedItemId, timeline, onSelectionChange, onDelete],
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

    console.debug('[VisualTimeline] Saving timeline edit:', {
      id: editingDraft.id,
      qualifier: editingDraft.qualifier,
      actionType: editingDraft.actionType,
      actionResult: editingDraft.actionResult,
      startTime: safeStart,
      endTime: safeEnd,
    });

    // onUpdateTimelineItemが利用可能な場合は、すべての更新を1回で行う
    if (onUpdateTimelineItem) {
      console.debug(
        '[VisualTimeline] Using onUpdateTimelineItem for batch update',
      );
      onUpdateTimelineItem(editingDraft.id, {
        qualifier: editingDraft.qualifier,
        actionType: editingDraft.actionType,
        actionResult: editingDraft.actionResult,
        startTime: safeStart,
        endTime: safeEnd,
      });
    } else {
      // 後方互換性のため、個別の更新関数も残す
      if (onUpdateQualifier) {
        onUpdateQualifier(editingDraft.id, editingDraft.qualifier);
      }
      if (onUpdateActionType) {
        console.debug(
          '[VisualTimeline] Calling onUpdateActionType:',
          editingDraft.actionType,
        );
        onUpdateActionType(editingDraft.id, editingDraft.actionType);
      }
      if (onUpdateActionResult) {
        console.debug(
          '[VisualTimeline] Calling onUpdateActionResult:',
          editingDraft.actionResult,
        );
        onUpdateActionResult(editingDraft.id, editingDraft.actionResult);
      }
      if (onUpdateTimeRange) {
        onUpdateTimeRange(editingDraft.id, safeStart, safeEnd);
      }
    }

    setEditingDraft(null);
  }, [
    editingDraft,
    onUpdateQualifier,
    onUpdateActionType,
    onUpdateActionResult,
    onUpdateTimeRange,
    onUpdateTimelineItem,
  ]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const timeMarkers = useMemo(() => {
    const markers: number[] = [];
    if (maxSec <= 0) return markers;

    // 目盛りの間隔: 動画の長さに応じて調整（より広めに）
    let interval: number;
    if (maxSec <= 120) {
      interval = 15;
    } else if (maxSec <= 300) {
      interval = 30;
    } else if (maxSec <= 600) {
      interval = 60;
    } else if (maxSec <= 1800) {
      interval = 120;
    } else {
      interval = 300;
    }

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
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          px: 2,
          pt: 2,
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
            focusedItemId={focusedItemId}
            onHoverChange={setHoveredItemId}
            onItemClick={handleItemClick}
            onItemContextMenu={handleItemContextMenu}
            timeToPosition={timeToPosition}
            currentTimePosition={currentTimePosition}
            formatTime={formatTime}
            firstTeamName={firstTeamName}
            onSeek={onSeek}
            maxSec={maxSec}
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

      <TimelineContextMenu
        anchorPosition={contextMenu?.position || null}
        onClose={handleCloseContextMenu}
        onEdit={handleContextMenuEdit}
        onDelete={handleContextMenuDelete}
        onJumpTo={handleContextMenuJumpTo}
        onDuplicate={handleContextMenuDuplicate}
      />
    </Box>
  );
};
