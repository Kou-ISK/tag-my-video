import type { ReactElement } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { StudioEditor } from './useStudioEditor';
import { getObjectBounds } from '../components/annotationCanvasUtils';
import { StudioTacticalPropertiesView } from './StudioTacticalPropertiesView';
import { resizeStudioObject } from './studioGeometry';

type Props = StudioEditor['inspector'];
export const StudioPropertiesView = (props: Props): ReactElement => {
  const object = props.selected;
  const bounds = object && getObjectBounds(object);
  return (
    <Stack spacing={1.5}>
      <Typography variant="caption" color="text.secondary">
        {object ? '選択した描画のスタイル' : '新しい描画のスタイル'}
      </Typography>
      {!object && props.tool === 'linkedDiscs' && (
        <Stack spacing={1}>
          <Typography variant="body2" role="status">
            足元を順にクリックしてリンク（{props.linkCount} /
            15人）。Enterで確定、Escで中止。
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button onClick={props.onFinishLink} disabled={props.linkCount < 2}>
              リンクを確定
            </Button>
            <Button onClick={props.onCancelLink} disabled={!props.linkCount}>
              中止
            </Button>
          </Stack>
        </Stack>
      )}
      <Stack direction="row" spacing={1}>
        <TextField
          type="color"
          label="色"
          value={object?.color ?? props.color}
          onChange={(event) => props.onColorChange(event.target.value)}
          sx={{ width: 72 }}
        />
        <TextField
          type="number"
          label="線の太さ"
          value={object?.strokeWidth ?? props.strokeWidth}
          onChange={(event) => {
            const value = Number(event.target.value);
            if (value >= 1 && value <= 30) props.onStrokeWidthChange(value);
          }}
          slotProps={{ htmlInput: { min: 1, max: 30 } }}
          sx={{ flex: 1 }}
        />
        <TextField
          type="number"
          label="不透明度 %"
          value={Math.round((object?.opacity ?? props.opacity) * 100)}
          onChange={(event) => {
            const value = Number(event.target.value);
            if (value >= 10 && value <= 100) props.onOpacityChange(value / 100);
          }}
          slotProps={{ htmlInput: { min: 10, max: 100, step: 10 } }}
          sx={{ flex: 1 }}
        />
      </Stack>
      <Box>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={object?.fill ?? props.fill}
              onChange={(_, checked) => props.onFillChange(checked)}
            />
          }
          label="塗りつぶし"
        />
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={object?.dashed ?? props.dashed}
              onChange={(_, checked) => props.onDashedChange(checked)}
            />
          }
          label="破線"
        />
      </Box>
      {object && (
        <StudioTacticalPropertiesView
          object={object}
          onUpdate={props.onUpdate}
        />
      )}
      {object?.type === 'text' && (
        <>
          <TextField
            label="テキスト"
            value={object.text ?? ''}
            onChange={(event) => props.onUpdate({ text: event.target.value })}
          />
          <TextField
            label="文字サイズ"
            type="number"
            value={object.fontSize ?? 28}
            slotProps={{ htmlInput: { min: 10, max: 160 } }}
            onChange={(event) => {
              const size = Number(event.target.value);
              if (size >= 10 && size <= 160) props.onUpdate({ fontSize: size });
            }}
          />
        </>
      )}
      {object && bounds && (
        <Stack direction="row" spacing={1}>
          <TextField
            key={`${object.id}-width-${Math.round(bounds.maxX - bounds.minX)}`}
            label="幅"
            type="number"
            defaultValue={Math.round(bounds.maxX - bounds.minX)}
            slotProps={{ htmlInput: { min: 4 } }}
            onBlur={(event) => {
              const width = Number(event.target.value);
              if (width >= 4 && width <= 10000)
                props.onUpdate(
                  resizeStudioObject(object, width, bounds.maxY - bounds.minY),
                );
            }}
          />
          <TextField
            key={`${object.id}-height-${Math.round(bounds.maxY - bounds.minY)}`}
            label="高さ"
            type="number"
            defaultValue={Math.round(bounds.maxY - bounds.minY)}
            slotProps={{ htmlInput: { min: 4 } }}
            onBlur={(event) => {
              const height = Number(event.target.value);
              if (height >= 4 && height <= 10000)
                props.onUpdate(
                  resizeStudioObject(object, bounds.maxX - bounds.minX, height),
                );
            }}
          />
        </Stack>
      )}
    </Stack>
  );
};
