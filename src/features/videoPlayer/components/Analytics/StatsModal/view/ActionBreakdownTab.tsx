import React from 'react';
import { Grid, Paper, Stack, Typography, Divider } from '@mui/material';
import { ActionPieChart } from '../../ActionPieChart';
import { NoDataPlaceholder } from './NoDataPlaceholder';
import { rechartsData } from '../../../../../../types/RechartsData';

interface ActionBreakdownTabProps {
  hasData: boolean;
  actions: ReadonlyArray<string>;
  teamNames: ReadonlyArray<string>;
  countActionFunction: (teamName: string, actionName: string) => rechartsData[];
  titleFormatter: (actionName: string) => string;
  emptyMessage: string;
}

export const ActionBreakdownTab = ({
  hasData,
  actions,
  teamNames,
  countActionFunction,
  titleFormatter,
  emptyMessage,
}: ActionBreakdownTabProps) => {
  if (!hasData || actions.length === 0) {
    return <NoDataPlaceholder message={emptyMessage} />;
  }

  return (
    <Stack spacing={3}>
      {actions.map((actionName) => (
        <Paper key={actionName} elevation={1} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            {titleFormatter(actionName)}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {teamNames.map((team) => (
              <Grid item xs={12} md={6} key={team}>
                <ActionPieChart
                  countActionFunction={countActionFunction}
                  teamName={team}
                  actionName={actionName}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
      ))}
    </Stack>
  );
};
