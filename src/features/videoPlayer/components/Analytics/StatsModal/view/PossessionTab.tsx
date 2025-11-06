import React from 'react';
import { Box, Divider, Paper, Typography } from '@mui/material';
import { Pie, PieChart, ResponsiveContainer, Cell, Legend } from 'recharts';
import { NoDataPlaceholder } from './NoDataPlaceholder';

interface PossessionTabProps {
  hasData: boolean;
  data: Array<{ name: string; value: number }>;
  emptyMessage: string;
}

const PIE_COLORS = ['#1e88e5', '#43a047', '#fb8c00', '#8e24aa'];

export const PossessionTab = ({
  hasData,
  data,
  emptyMessage,
}: PossessionTabProps) => {
  if (!hasData || data.length === 0) {
    return <NoDataPlaceholder message={emptyMessage} />;
  }

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        ポゼッション比較
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="80%"
              innerRadius="55%"
              label={({ name, value }) =>
                `${name.replace(' ポゼッション', '')}: ${value.toFixed(0)} sec`
              }
            >
              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={PIE_COLORS[index % PIE_COLORS.length]}
                />
              ))}
            </Pie>
            <Legend verticalAlign="bottom" iconType="circle" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};
