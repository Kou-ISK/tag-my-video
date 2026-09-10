import type { ReactElement } from 'react';
import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { TacticsPresetProps } from './useTacticsPresets';
import { STUDIO_TOOLS } from './studioGeometry';
export const TacticsPresetsView = (props: TacticsPresetProps): ReactElement => (
  <Stack spacing={1}>
    <Typography variant="subtitle2">描画プリセット</Typography>
    <Typography variant="caption" color="text.secondary">
      選択した図形とスタイルをこの端末へ保存します（最大24件）。追跡結果は含めません。
    </Typography>
    <TextField
      label="プリセット名"
      value={props.name}
      onChange={(event) => props.onNameChange(event.target.value)}
      slotProps={{ htmlInput: { maxLength: 80 } }}
    />
    <Button disabled={!props.canSave} onClick={props.onSave}>
      選択した描画を保存
    </Button>
    {!props.preferences.presets.length && (
      <Typography variant="body2" color="text.secondary">
        保存済みプリセットはありません。
      </Typography>
    )}
    {props.preferences.presets.map((preset) => (
      <Stack direction="row" key={preset.id} alignItems="center">
        <Button
          disabled={!props.enabled}
          onClick={() => props.onInsert(preset.id)}
          sx={{ justifyContent: 'flex-start', flex: 1, minWidth: 0 }}
        >
          {preset.name}
        </Button>
        <Button
          aria-label={`${preset.name}を削除`}
          onClick={() => props.onDelete(preset.id)}
        >
          削除
        </Button>
      </Stack>
    ))}
    {props.error && (
      <Typography role="alert" color="error" variant="body2">
        {props.error}
      </Typography>
    )}
    <Divider />
    <Typography variant="subtitle2">Coach のツール</Typography>
    <Stack>
      {STUDIO_TOOLS.filter((tool) => tool.id !== 'select').map((tool) => (
        <FormControlLabel
          key={tool.id}
          label={tool.label}
          control={
            <Checkbox
              size="small"
              checked={props.preferences.coachTools.includes(tool.id)}
              onChange={() => props.onCoachToolToggle(tool.id)}
            />
          }
        />
      ))}
    </Stack>
    <Typography variant="subtitle2">Coach の4色</Typography>
    <Stack direction="row" spacing={0.5}>
      {props.preferences.coachColors.map((color, index) => (
        <TextField
          key={index}
          label={`色${index + 1}`}
          type="color"
          value={color}
          onChange={(event) =>
            props.onCoachColorChange(index, event.target.value)
          }
          sx={{ minWidth: 0 }}
        />
      ))}
    </Stack>
  </Stack>
);
