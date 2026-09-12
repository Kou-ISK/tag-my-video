import type { ReactElement, ReactNode } from 'react';
import {
  IconButton,
  Tooltip,
  type IconButtonProps,
} from '@mui/material';

export interface IconActionProps
  extends Omit<IconButtonProps, 'children' | 'aria-label'> {
  icon: ReactNode;
  label: string;
  tooltip?: ReactNode;
  loading?: boolean;
}

/**
 * An icon-only action with a stable accessible name and discoverable tooltip.
 * Visual icon size and the interactive hit area are intentionally separate.
 */
export const IconAction = ({
  icon,
  label,
  tooltip = label,
  loading = false,
  disabled = false,
  ...buttonProps
}: IconActionProps): ReactElement => {
  const action = (
    <IconButton
      {...buttonProps}
      aria-label={label}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
    >
      {icon}
    </IconButton>
  );

  return <Tooltip title={tooltip}>{action}</Tooltip>;
};
