import type { ReactElement } from 'react';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { Flare, Hub, Adjust, TurnSlightRight } from '@mui/icons-material';
import NearMeOutlined from '@mui/icons-material/NearMeOutlined';
import NorthEast from '@mui/icons-material/NorthEast';
import HorizontalRule from '@mui/icons-material/HorizontalRule';
import EditOutlined from '@mui/icons-material/EditOutlined';
import CropSquare from '@mui/icons-material/CropSquare';
import CircleOutlined from '@mui/icons-material/CircleOutlined';
import PanoramaFishEye from '@mui/icons-material/PanoramaFishEye';
import HighlightAlt from '@mui/icons-material/HighlightAlt';
import Polyline from '@mui/icons-material/Polyline';
import TextFields from '@mui/icons-material/TextFields';
import type { DrawingToolType } from '../../../types/playlist/core';
import { STUDIO_TOOLS } from './studioGeometry';
const icons = [
  NearMeOutlined,
  Flare,
  Adjust,
  Hub,
  TurnSlightRight,
  NorthEast,
  HorizontalRule,
  EditOutlined,
  CropSquare,
  CircleOutlined,
  PanoramaFishEye,
  HighlightAlt,
  Polyline,
  TextFields,
];
export const StudioToolsView = ({
  tool,
  onChange,
  disabled,
}: {
  tool: DrawingToolType;
  onChange: (tool: DrawingToolType) => void;
  disabled: boolean;
}): ReactElement => (
  <ToggleButtonGroup
    exclusive
    value={tool}
    aria-label="Tactics 描画ツール"
    onChange={(_, value: DrawingToolType | null) => {
      if (value) onChange(value);
    }}
    sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 0.5,
      '& .MuiToggleButtonGroup-grouped': {
        border: 1,
        borderColor: 'divider',
        borderRadius: '6px !important',
        m: 0,
      },
    }}
  >
    {STUDIO_TOOLS.map((entry, index) => {
      const Icon = icons[index];
      return (
        <Tooltip key={entry.id} title={entry.label}>
          <ToggleButton
            disabled={disabled}
            value={entry.id}
            aria-label={entry.label}
            sx={{
              minWidth: 36,
              minHeight: 52,
              p: 0.5,
              flexDirection: 'column',
              gap: 0.5,
              fontSize: 10,
              lineHeight: 1.2,
            }}
          >
            <Icon fontSize="small" />
            {entry.label}
          </ToggleButton>
        </Tooltip>
      );
    })}
  </ToggleButtonGroup>
);
