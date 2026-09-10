import type { ReactElement } from 'react';
import {
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import Undo from '@mui/icons-material/Undo';
import Redo from '@mui/icons-material/Redo';
import ContentCopy from '@mui/icons-material/ContentCopy';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import { IconAction } from '../../../components/ui';
import type { AnnotationTarget } from '../../../types/playlist/core';
import type { StudioEditor } from './useStudioEditor';
import { StudioToolsView } from './StudioToolsView';
import { StudioPropertiesView } from './StudioPropertiesView';
import { STUDIO_TOOLS } from './studioGeometry';

export type StudioSidebarViewProps = StudioEditor['inspector'] & {
  target: AnnotationTarget;
  hasSecondary: boolean;
  onTargetChange: (target: AnnotationTarget) => void;
};
export const StudioSidebarView = (
  props: StudioSidebarViewProps,
): ReactElement => {
  const index = props.objects.findIndex(
    (object) => object.id === props.selectedId,
  );
  return (
    <Box
      component="aside"
      aria-label="Studio Inspector"
      onKeyDown={props.onKeyDown}
      sx={{
        width: 292,
        minWidth: 260,
        flexShrink: 0,
        overflowY: 'auto',
        bgcolor: 'background.paper',
        borderLeft: 1,
        borderColor: 'divider',
      }}
    >
      <Stack spacing={2} sx={{ p: 2 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="subtitle2">Studio</Typography>
          <Stack direction="row">
            <IconAction
              label="元に戻す"
              disabled={!props.canUndo || !props.enabled}
              onClick={props.onUndo}
              icon={<Undo fontSize="small" />}
            />
            <IconAction
              label="やり直す"
              disabled={!props.canRedo || !props.enabled}
              onClick={props.onRedo}
              icon={<Redo fontSize="small" />}
            />
          </Stack>
        </Stack>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={props.target}
          onChange={(_, value: AnnotationTarget | null) => {
            if (value) props.onTargetChange(value);
          }}
          aria-label="描画アングル"
        >
          <ToggleButton value="primary">アングル1</ToggleButton>
          <ToggleButton value="secondary" disabled={!props.hasSecondary}>
            アングル2
          </ToggleButton>
        </ToggleButtonGroup>
        {!props.enabled && (
          <Typography role="status" variant="body2" color="text.secondary">
            映像のあるクリップを選択し、プレビューを停止すると編集できます。
          </Typography>
        )}
        <StudioToolsView
          tool={props.tool}
          onChange={props.onToolChange}
          disabled={!props.enabled}
        />
        <Typography variant="caption" color="text.secondary">
          ドラッグして描画。選択ツールで移動し、右下をドラッグするとサイズを変更できます。
        </Typography>
        <Divider />
        <Box
          component="fieldset"
          disabled={!props.enabled}
          sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}
        >
          <StudioPropertiesView {...props} />
        </Box>
        <Divider />
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="subtitle2">
            レイヤー · {props.objects.length}
          </Typography>
          <Stack direction="row">
            <IconAction
              label="前面へ"
              disabled={
                !props.enabled || index < 0 || index >= props.objects.length - 1
              }
              onClick={() => props.onMoveLayer(1)}
              icon={<ArrowUpward fontSize="small" />}
            />
            <IconAction
              label="背面へ"
              disabled={!props.enabled || index <= 0}
              onClick={() => props.onMoveLayer(-1)}
              icon={<ArrowDownward fontSize="small" />}
            />
          </Stack>
        </Stack>
        {props.objects.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            描画はまだありません。
          </Typography>
        ) : (
          <List dense disablePadding aria-label="描画レイヤー">
            {[...props.objects].reverse().map((object) => (
              <ListItem key={object.id} disablePadding>
                <ListItemButton
                  selected={object.id === props.selectedId}
                  onClick={() => props.onSelect(object.id)}
                  sx={{ borderRadius: 1, gap: 1 }}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: object.color,
                      border: 1,
                      borderColor: 'divider',
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                    {object.text ||
                      STUDIO_TOOLS.find((tool) => tool.id === object.type)
                        ?.label ||
                      object.type}
                  </Typography>
                  <Typography variant="technical" color="text.secondary">
                    {object.timestamp.toFixed(1)}s
                  </Typography>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<ContentCopy />}
            disabled={!props.enabled || !props.selected}
            onClick={props.onDuplicate}
          >
            複製
          </Button>
          <Button
            startIcon={<DeleteOutline />}
            disabled={!props.enabled || !props.selected}
            onClick={props.onDelete}
          >
            削除
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};
