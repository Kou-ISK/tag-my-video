import { studioControlLayout } from './studioControlLayout';
import type { ReactElement } from 'react';
import {
  Button,
  Typography,
  Stack,
  ToggleButton,
  Tooltip,
} from '@mui/material';
import { DeleteOutline, Redo, Undo } from '@mui/icons-material';
import type { StudioEditor } from './useStudioEditor';
import { STUDIO_TOOLS } from './studioGeometry';

export interface StudioCoachViewProps {
  tools?: ReadonlyArray<string>;
  colors?: string[];
  editor: StudioEditor['inspector'];
  onClearFrame: () => void;
}
const defaultTools = new Set([
  'select',
  'beam',
  'disc',
  'linkedDiscs',
  'curvedArrow',
  'pen',
  'spotlight',
  'text',
]);
const defaultColors = ['#FFD60A', '#FFFFFF', '#64A9FF', '#FF453A'];
export const StudioCoachView = ({
  editor,
  tools,
  colors = defaultColors,
  onClearFrame,
}: StudioCoachViewProps): ReactElement => (
  <Stack
    direction="row"
    alignItems="center"
    useFlexGap
    spacing={0.5}
    role="group"
    aria-label="プレゼン 描画操作"
    sx={[
      studioControlLayout,
      {
        flexWrap: 'wrap',
        rowGap: 0.5,
        p: 1,
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      },
    ]}
  >
    <Typography variant="caption" sx={{ width: '100%' }}>
      プレゼン：一時停止して描画し、再生して説明します。描画は編集モードと共有・保存されます。
    </Typography>
    {STUDIO_TOOLS.filter(
      (tool) =>
        tool.id === 'select' ||
        (tools ? tools.includes(tool.id) : defaultTools.has(tool.id)),
    ).map((tool) => (
      <ToggleButton
        key={tool.id}
        value={tool.id}
        selected={editor.tool === tool.id}
        disabled={!editor.enabled}
        onClick={() => editor.onToolChange(tool.id)}
        size="small"
      >
        {tool.label}
      </ToggleButton>
    ))}
    <Stack direction="row" sx={{ px: 1 }}>
      {colors.map((color, index) => (
        <Tooltip key={color} title={`色${index + 1}`}>
          <ToggleButton
            value={color}
            aria-label={`${`色${index + 1}`}の描画`}
            selected={editor.color === color}
            disabled={!editor.enabled}
            onClick={() => editor.onColorChange(color)}
            sx={{ m: 0.25, p: 0.5, minWidth: 26, height: 28 }}
          >
            <span
              style={{
                background: color,
                width: 14,
                height: 14,
                borderRadius: '50%',
                display: 'block',
              }}
            />
          </ToggleButton>
        </Tooltip>
      ))}
    </Stack>
    <Button
      startIcon={<Undo />}
      disabled={!editor.enabled || !editor.canUndo}
      onClick={editor.onUndo}
    >
      戻す
    </Button>
    <Button
      startIcon={<Redo />}
      disabled={!editor.enabled || !editor.canRedo}
      onClick={editor.onRedo}
    >
      やり直す
    </Button>
    <Button
      startIcon={<DeleteOutline />}
      disabled={!editor.enabled}
      onClick={onClearFrame}
    >
      この場面を消去
    </Button>
  </Stack>
);
