import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { TimelineData } from '../../types/TimelineData';
import { useTheme } from '@mui/material/styles';
import { ActionList } from '../../ActionList';

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
}) => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [labelDialog, setLabelDialog] = useState<{
    open: boolean;
    itemId: string;
    currentLabel: string;
    currentActionType: string;
    currentActionResult: string;
    actionName: string;
  }>({
    open: false,
    itemId: '',
    currentLabel: '',
    currentActionType: '',
    currentActionResult: '',
    actionName: '',
  });
  const [labelInput, setLabelInput] = useState('');
  const [actionTypeInput, setActionTypeInput] = useState('');
  const [actionResultInput, setActionResultInput] = useState('');

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

  // アクション名別にグループ化
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

  const actionNames = Object.keys(groupedByAction).sort();

  // 現在時刻の位置（パーセント）を計算
  const currentTimePosition = useMemo(() => {
    if (maxSec <= 0) return 0;
    const position = Math.min(100, Math.max(0, (currentTime / maxSec) * 100));
    return position;
  }, [currentTime, maxSec]);

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

  // 右クリックでラベル編集
  const handleItemRightClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const item = timeline.find((t) => t.id === id);
    if (item) {
      setLabelDialog({
        open: true,
        itemId: id,
        currentLabel: item.qualifier || '',
        currentActionType: item.actionType || '',
        currentActionResult: item.actionResult || '',
        actionName: item.actionName,
      });
      setLabelInput(item.qualifier || '');
      setActionTypeInput(item.actionType || '');
      setActionResultInput(item.actionResult || '');
    }
  };

  // アクション定義を取得
  const getActionDefinition = (actionName: string) => {
    const baseAction = actionName.split(' ').slice(1).join(' ');
    return ActionList.find((a) => a.action === baseAction);
  };

  // ラベル保存
  const handleSaveLabel = () => {
    console.log('[VisualTimeline] handleSaveLabel called', {
      itemId: labelDialog.itemId,
      labelInput,
      actionTypeInput,
      actionResultInput,
    });
    if (labelDialog.itemId) {
      // qualifier, actionType, actionResultは空文字列でも保存（クリアする場合もある）
      if (onUpdateQualifier) {
        console.log('[VisualTimeline] Calling onUpdateQualifier', labelInput);
        onUpdateQualifier(labelDialog.itemId, labelInput);
      }
      if (onUpdateActionType) {
        console.log(
          '[VisualTimeline] Calling onUpdateActionType',
          actionTypeInput,
        );
        onUpdateActionType(labelDialog.itemId, actionTypeInput);
      }
      if (onUpdateActionResult) {
        console.log(
          '[VisualTimeline] Calling onUpdateActionResult',
          actionResultInput,
        );
        onUpdateActionResult(labelDialog.itemId, actionResultInput);
      }
    }
    setLabelDialog({
      open: false,
      itemId: '',
      currentLabel: '',
      currentActionType: '',
      currentActionResult: '',
      actionName: '',
    });
    setLabelInput('');
    setActionTypeInput('');
    setActionResultInput('');
  };

  // ラベルダイアログを閉じる
  const handleCloseLabel = () => {
    setLabelDialog({
      open: false,
      itemId: '',
      currentLabel: '',
      currentActionType: '',
      currentActionResult: '',
      actionName: '',
    });
    setLabelInput('');
    setActionTypeInput('');
    setActionResultInput('');
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
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 2,
          }}
        >
          {/* 左: 空白（アクション名の幅に合わせる） */}
          <Box sx={{ width: 120, flexShrink: 0 }} />

          {/* 右: 時間軸 */}
          <Box
            ref={containerRef}
            onClick={handleTimelineClick}
            sx={{
              position: 'relative',
              flex: 1,
              height: 40,
              backgroundColor:
                theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
              borderRadius: 1,
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
                left: `${currentTimePosition}%`,
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
        </Box>

        {/* アクション別レーン */}
        {actionNames.map((actionName) => {
          const teamName = actionName.split(' ')[0];
          const isTeam1 = teamName === actionNames[0]?.split(' ')[0];

          return (
            <Box
              key={actionName}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                position: 'relative',
              }}
            >
              {/* 左: アクション名 */}
              <Typography
                variant="caption"
                sx={{
                  color: isTeam1 ? 'team1.main' : 'team2.main',
                  fontWeight: 'bold',
                  fontSize: '0.7rem',
                  width: 120,
                  flexShrink: 0,
                  textAlign: 'right',
                  pr: 1,
                }}
              >
                {actionName}
              </Typography>

              {/* 右: タイムラインバー */}
              <Box
                sx={{
                  position: 'relative',
                  height: 32,
                  flex: 1,
                  backgroundColor:
                    theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                {groupedByAction[actionName].map((item) => {
                  const left = timeToPosition(item.startTime);
                  const width = Math.max(
                    20,
                    timeToPosition(item.endTime) - left,
                  );
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
                        onContextMenu={(e) => handleItemRightClick(e, item.id)}
                        onMouseEnter={() => setHoveredItem(item.id)}
                        onMouseLeave={() => setHoveredItem(null)}
                        sx={{
                          position: 'absolute',
                          left: `${left}px`,
                          width: `${width}px`,
                          top: 4,
                          bottom: 4,
                          backgroundColor: isSelected
                            ? theme.palette.secondary.main
                            : isTeam1
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
                            transform: 'scaleY(1.2)',
                            zIndex: 5,
                          },
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'white',
                            fontSize: '0.65rem',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {formatTime(item.startTime)}
                        </Typography>
                      </Box>
                    </Tooltip>
                  );
                })}

                {/* 各レーンに現在時刻インジケーター */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: `${currentTimePosition}%`,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    backgroundColor: 'error.main',
                    zIndex: 10,
                    pointerEvents: 'none',
                  }}
                />
              </Box>
            </Box>
          );
        })}

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

      {/* ラベル追加ダイアログ */}
      <Dialog
        open={labelDialog.open}
        onClose={handleCloseLabel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>アクション詳細を編集</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* アクションタイプ */}
            {(() => {
              const actionDef = getActionDefinition(labelDialog.actionName);
              return actionDef && actionDef.types ? (
                <FormControl fullWidth>
                  <InputLabel>アクションタイプ</InputLabel>
                  <Select
                    value={actionTypeInput}
                    label="アクションタイプ"
                    onChange={(e) => setActionTypeInput(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>なし</em>
                    </MenuItem>
                    {actionDef.types.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : null;
            })()}

            {/* アクション結果 */}
            {(() => {
              const actionDef = getActionDefinition(labelDialog.actionName);
              return actionDef && actionDef.results ? (
                <FormControl fullWidth>
                  <InputLabel>結果</InputLabel>
                  <Select
                    value={actionResultInput}
                    label="結果"
                    onChange={(e) => setActionResultInput(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>なし</em>
                    </MenuItem>
                    {actionDef.results.map((result) => (
                      <MenuItem key={result} value={result}>
                        {result}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : null;
            })()}

            {/* フリー入力ラベル */}
            <TextField
              margin="dense"
              label="メモ・備考"
              type="text"
              fullWidth
              variant="outlined"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              placeholder="任意のメモを入力してください"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveLabel();
                }
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLabel}>キャンセル</Button>
          <Button onClick={handleSaveLabel} variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
