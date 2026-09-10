import type { ReactElement } from 'react';
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';
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
const shortcuts: Record<string, string> = {
  select: 'V',
  pen: 'P',
  arrow: 'A',
  rectangle: 'R',
  circle: 'O',
  text: 'T',
};
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
    aria-label="Paint 描画ツール"
    onChange={(_, value: DrawingToolType | null) => {
      if (value) onChange(value);
    }}
    sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      width: 80,
      flexShrink: 0,
      alignContent: 'start',
      overflowY: 'auto',
      p: 0.5,
      bgcolor: 'background.paper',
      borderRight: 1,
      borderColor: 'divider',
      gap: 0.5,
      '& .MuiToggleButtonGroup-grouped': {
        border: 0,
        borderColor: 'divider',
        borderRadius: '3px !important',
        m: 0,
      },
    }}
  >
    {[
      { label: '選択', ids: ['select'] },
      {
        label: '描画',
        ids: [
          'pen',
          'arrow',
          'curvedArrow',
          'line',
          'rectangle',
          'circle',
          'polygon',
          'text',
        ],
      },
      {
        label: '選手',
        ids: ['beam', 'disc', 'linkedDiscs', 'ring', 'spotlight'],
      },
    ].map((group) => (
      <Box
        key={group.label}
        role="group"
        aria-label={group.label}
        sx={{ display: 'contents' }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ gridColumn: '1 / -1', px: 0.5, pt: 0.5, fontSize: 10 }}
        >
          {group.label}
        </Typography>
        {group.ids.map((id) => {
          const index = STUDIO_TOOLS.findIndex((entry) => entry.id === id);
          const entry = STUDIO_TOOLS[index];
          const Icon = icons[index];
          return (
            <Tooltip
              key={entry.id}
              title={`${entry.label}${shortcuts[entry.id] ? ` (${shortcuts[entry.id]})` : ''}`}
              placement="right"
            >
              <ToggleButton
                disabled={disabled}
                value={entry.id}
                aria-label={entry.label}
                sx={{
                  minWidth: 36,
                  minHeight: 32,
                  p: 0.5,
                  flexDirection: 'column',
                  gap: 0.5,
                  fontSize: 10,
                  lineHeight: 1.2,
                }}
              >
                <Icon fontSize="small" />
              </ToggleButton>
            </Tooltip>
          );
        })}
      </Box>
    ))}
  </ToggleButtonGroup>
);
