import { Box } from '@mui/material';
import { Cell, Legend, Pie, PieChart } from 'recharts';
import React from 'react';
import { rechartsData } from '../../../../types/RechartsData';

interface ActionPieChartProps {
  countActionFunction: (teamName: string, actionName: string) => rechartsData[];
  teamName: string;
  actionName: string;
}
const CUSTOM_COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#AF19FF',
  '#FF6600',
  '#33CC33',
  '#FF3399',
  '#66CCCC',
  '#FF6666',
];

export const ActionPieChart = ({
  countActionFunction,
  teamName,
  actionName,
}: ActionPieChartProps) => {
  const data = countActionFunction(teamName, actionName);
  // 全体の合計値を計算
  const total = data.reduce((sum, entry) => sum + entry.value, 0);
  return (
    <>
      <Box
        sx={{ flexDirection: 'column', margin: '5px', justifyContent: 'left' }}
      >
        <PieChart width={400} height={180}>
          <Legend />
          <Pie
            nameKey="name"
            dataKey="value"
            startAngle={180}
            endAngle={0}
            data={data}
            cx="50%"
            cy="100%"
            innerRadius={50}
            outerRadius={80}
            label={({ value }) =>
              `${((value / total) * 100).toFixed(1)}% - ` + value
            }
          >
            {data.map((_, index: number) => (
              <Cell key={`cell-${index}`} fill={CUSTOM_COLORS[index]} />
            ))}
          </Pie>
        </PieChart>
      </Box>
    </>
  );
};
