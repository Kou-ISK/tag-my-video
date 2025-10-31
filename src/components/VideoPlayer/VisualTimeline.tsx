import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { TimelineData } from '../../types/TimelineData';
import { useTheme } from '@mui/material/styles';

interface VisualTimelineProps {
  timeline: TimelineData[];
  maxSec: number;
  currentTime: number;
  onSeek: (time: number) => void;
  onDelete: (ids: string[]) => void;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export const VisualTimeline: React.FC<VisualTimelineProps> = ({
  timeline,
  maxSec,
  currentTime,
  onSeek,
  onDelete,
  selectedIds,
  onSelectionChange,
}) => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // コンテナ幅の監視
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // チーム別にグループ化
  const groupedByTeam = useMemo(() => {
    const groups: Record<string, TimelineData[]> = {};
    timeline.forEach((item) => {
      const teamName = item.actionName.split(' ')[0];
      if (!groups[teamName]) {
        groups[teamName] = [];
      }
      groups[teamName].push(item);
    });
    return groups;
  }, [timeline]);

  const teams = Object.keys(groupedByTeam);

  // 時間を位置に変換
  const timeToPosition = (time: number) => {
    if (maxSec <= 0) return 0;
    return (time / maxSec) * containerWidth;
  };

  // 位置を時間に変換
  const positionToTime = (position: number) => {
    if (containerWidth <= 0) return 0;
    return (position / containerWidth) * maxSec;
  };

  // タイムラインクリックでシーク
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const time = positionToTime(clickX);
    onSeek(time);
  };

  // アイテムクリックで選択
  const handleItemClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    if (e.shiftKey) {
      // Shift+クリック: 複数選択
      if (selectedIds.includes(id)) {
        onSelectionChange(selectedIds.filter((sid) => sid !== id));
      } else {
        onSelectionChange([...selectedIds, id]);
      }
    } else if (e.metaKey || e.ctrlKey) {
      // Cmd/Ctrl+クリック: 追加選択
      if (selectedIds.includes(id)) {
        onSelectionChange(selectedIds.filter((sid) => sid !== id));
      } else {
        onSelectionChange([...selectedIds, id]);
      }
    } else {
      // 通常クリック: 単一選択してシーク
      const item = timeline.find((t) => t.id === id);
      if (item) {
        onSelectionChange([id]);
        onSeek(item.startTime);
      }
    }
  };

  // 時刻表示用のフォーマット
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 時間マーカーを生成（10秒ごと）
  const timeMarkers = useMemo(() => {
    const markers: number[] = [];
    const interval = Math.max(10, Math.ceil(maxSec / 50) * 10); // 最大50個のマーカー
    for (let i = 0; i <= maxSec; i += interval) {
      markers.push(i);
    }
    return markers;
  }, [maxSec]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* ヘッダー */}
      <Box sx={{ p: 2, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          タイムライン
        </Typography>
        <Chip label={`${timeline.length}件`} size="small" color="primary" />
        {selectedIds.length > 0 && (
          <>
            <Chip
              label={`${selectedIds.length}件選択`}
              size="small"
              color="secondary"
            />
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(selectedIds)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>

      {/* タイムラインエリア */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          px: 2,
          pb: 2,
        }}
      >
        {/* 時間軸 */}
        <Box
          ref={containerRef}
          onClick={handleTimelineClick}
          sx={{
            position: 'relative',
            height: 40,
            backgroundColor:
              theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
            borderRadius: 1,
            mb: 2,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor:
                theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
            },
          }}
        >
          {/* 時間マーカー */}
          {timeMarkers.map((time) => (
            <Box
              key={time}
              sx={{
                position: 'absolute',
                left: `${(time / maxSec) * 100}%`,
                top: 0,
                bottom: 0,
                borderLeft: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'flex-end',
                pb: 0.5,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.65rem',
                  transform: 'translateX(-50%)',
                  color: 'text.secondary',
                }}
              >
                {formatTime(time)}
              </Typography>
            </Box>
          ))}

          {/* 現在時刻インジケーター */}
          <Box
            sx={{
              position: 'absolute',
              left: `${(currentTime / maxSec) * 100}%`,
              top: 0,
              bottom: 0,
              width: 2,
              backgroundColor: 'error.main',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: -6,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: `6px solid ${theme.palette.error.main}`,
              }}
            />
          </Box>
        </Box>

        {/* チーム別レーン */}
        {teams.map((teamName, teamIndex) => (
          <Box key={teamName} sx={{ mb: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1,
                color: teamIndex === 0 ? 'team1.main' : 'team2.main',
                fontWeight: 'bold',
              }}
            >
              {teamName}
            </Typography>
            <Box
              sx={{
                position: 'relative',
                height: 60,
                backgroundColor:
                  theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
              }}
            >
              {groupedByTeam[teamName].map((item) => {
                const left = timeToPosition(item.startTime);
                const width = Math.max(20, timeToPosition(item.endTime) - left);
                const isSelected = selectedIds.includes(item.id);
                const isHovered = hoveredItem === item.id;

                return (
                  <Tooltip
                    key={item.id}
                    title={
                      <Stack spacing={0.5}>
                        <Typography variant="caption">
                          {item.actionName}
                        </Typography>
                        <Typography variant="caption">
                          {formatTime(item.startTime)} -{' '}
                          {formatTime(item.endTime)}
                        </Typography>
                        {item.qualifier && (
                          <Typography variant="caption">
                            備考: {item.qualifier}
                          </Typography>
                        )}
                      </Stack>
                    }
                  >
                    <Box
                      onClick={(e) => handleItemClick(e, item.id)}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      sx={{
                        position: 'absolute',
                        left: `${left}px`,
                        width: `${width}px`,
                        top: 8,
                        bottom: 8,
                        backgroundColor: isSelected
                          ? theme.palette.secondary.main
                          : teamIndex === 0
                          ? theme.palette.team1.main
                          : theme.palette.team2.main,
                        opacity: isHovered ? 1 : isSelected ? 0.9 : 0.7,
                        borderRadius: 1,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        px: 0.5,
                        border: isSelected ? 2 : 0,
                        borderColor: 'secondary.dark',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'scaleY(1.1)',
                          zIndex: 5,
                        },
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'white',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.actionName.split(' ').slice(1).join(' ')}
                      </Typography>
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          </Box>
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
    </Box>
  );
};
