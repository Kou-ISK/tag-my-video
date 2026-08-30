import React from 'react';
import {
  Box,
  Divider,
  IconButton,
  Slider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ArrowRightAlt,
  Brush,
  Clear,
  CropSquare,
  PauseCircle,
  RadioButtonUnchecked,
  TextFields,
  Timeline,
  Undo,
  DragIndicator,
  OpenWith,
} from '@mui/icons-material';
import type { DrawingToolType } from '../../../types/playlist/core';
import { FloatingToolPanel, IconAction } from '../../../components/ui';

type AnnotationToolbarProps = {
  isActive: boolean;
  toolbarRef: React.RefObject<HTMLDivElement | null>;
  position: { x: number; y: number };
  isDragging: boolean;
  onDragStart: (event: React.MouseEvent) => void;
  tool: DrawingToolType;
  onToolChange: (tool: DrawingToolType) => void;
  colors: string[];
  color: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (value: number) => void;
  canUndo: boolean;
  onUndo: () => void;
  onClear: () => void;
  freezeDuration: number;
  minFreezeDuration: number;
  onFreezeDurationChange: (value: number) => void;
};

export const AnnotationToolbar = ({
  isActive,
  toolbarRef,
  position,
  isDragging,
  onDragStart,
  tool,
  onToolChange,
  colors,
  color,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  canUndo,
  onUndo,
  onClear,
  freezeDuration,
  minFreezeDuration,
  onFreezeDurationChange,
}: AnnotationToolbarProps) => {
  if (!isActive) return null;

  return (
    <FloatingToolPanel
        panelRef={toolbarRef}
        position={position}
        isDragging={isDragging}
        label="描画ツール"
        sx={{
          p: 0.5,
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 0.4,
          width: 'fit-content',
          overflow: 'hidden',
        }}
      >
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          onMouseDown={onDragStart}
          sx={{
            cursor: 'grab',
            color: 'text.secondary',
            pb: 0.25,
          }}
        >
          <DragIndicator fontSize="small" />
          <Typography variant="labelCompact">移動</Typography>
        </Stack>

        {tool === 'select' && (
          <Typography
            variant="labelCompact"
            sx={{
              lineHeight: 1.1,
              px: 0.25,
            }}
          >
            クリック:選択
            <br />
            ドラッグ:移動
            <br />
            Delete:削除
          </Typography>
        )}

        <ToggleButtonGroup
          value={tool}
          exclusive
          onChange={(_, value) => value && onToolChange(value)}
          size="small"
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 0.25,
            '& .MuiToggleButton-root': (theme) => ({
              minWidth: theme.custom.density.compact.interactiveTarget,
              height: theme.custom.density.compact.controlHeight,
              p: 0,
            }),
          }}
        >
          <ToggleButton value="pen">
            <Tooltip title="ペン">
              <Brush fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="select">
            <Tooltip title="選択/ドラッグで移動・Deleteで削除">
              <OpenWith fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="line">
            <Tooltip title="直線">
              <Timeline fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="arrow">
            <Tooltip title="矢印">
              <ArrowRightAlt fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="rectangle">
            <Tooltip title="四角形">
              <CropSquare fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="circle">
            <Tooltip title="円/楕円">
              <RadioButtonUnchecked fontSize="small" />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="text">
            <Tooltip title="テキスト">
              <TextFields fontSize="small" />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        <Divider />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gap: 0.25,
          }}
        >
          {colors.map((paletteColor) => (
            <IconButton
              key={paletteColor}
              size="small"
              onClick={() => onColorChange(paletteColor)}
              sx={{
                width: 16,
                height: 16,
                bgcolor: paletteColor,
                  border: (theme) =>
                    color === paletteColor
                      ? `2px solid ${theme.custom.tokens.border.focus}`
                      : `1px solid ${theme.custom.tokens.border.strong}`,
                  '&:hover': { bgcolor: paletteColor },
                }}
                aria-label={`色 ${paletteColor}`}
              />
          ))}
        </Box>

        <Divider />

        <Stack spacing={0.25} sx={{ px: 0.5 }}>
          <Typography variant="labelCompact">
            太さ
          </Typography>
          <Slider
            size="small"
            value={strokeWidth}
            min={1}
            max={10}
            onChange={(_, value) => onStrokeWidthChange(value as number)}
            sx={{ width: '100%', mt: -0.5 }}
          />
        </Stack>

        <Divider />

        <Stack direction="row" spacing={0.25}>
          <IconAction
            icon={<Undo fontSize="small" />}
            label="元に戻す"
            onClick={onUndo}
            disabled={!canUndo}
            size="small"
          />
          <IconAction
            icon={<Clear fontSize="small" />}
            label="全てクリア"
            onClick={onClear}
            size="small"
          />
        </Stack>

        <Divider />

        <Stack spacing={0.25} sx={{ px: 0.5 }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <PauseCircle fontSize="small" sx={{ color: 'warning.main' }} />
            <Typography variant="labelCompact">
              停止 {freezeDuration}秒
            </Typography>
          </Stack>
          <Slider
            size="small"
            value={freezeDuration}
            min={minFreezeDuration}
            max={10}
            step={0.5}
            onChange={(_, value) => onFreezeDurationChange(value as number)}
            sx={{ width: '100%' }}
          />
        </Stack>
    </FloatingToolPanel>
  );
};
