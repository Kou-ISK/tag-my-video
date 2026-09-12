import type { ReactElement } from 'react';
import { Button, Stack, Typography } from '@mui/material';
export const StudioPlayerCountView = ({
  count,
  onChange,
}: {
  count: number;
  onChange: (count: number) => void;
}): ReactElement => (
  <Stack spacing={1}>
    <Typography variant="body2">
      {count}人のリンク · 中心をドラッグして足元へ配置
    </Typography>
    <Stack direction="row" spacing={1}>
      <Button disabled={count <= 2} onClick={() => onChange(count - 1)}>
        末尾を削除
      </Button>
      <Button disabled={count >= 15} onClick={() => onChange(count + 1)}>
        選手を追加
      </Button>
    </Stack>
  </Stack>
);
