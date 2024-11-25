import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import React from 'react';
import { Box } from '@mui/material';

interface MomentumChartProps {
  createMomentumData: any;
  teamNames: string[];
}

// 凡例用のデータ
const legendData = [
  { color: 'orangered', label: 'Try' },
  { color: 'green', label: 'Positive' },
  { color: 'mediumpurple', label: 'Negative' },
];

// 凡例コンポーネント
const LegendComponent = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {legendData.map((item, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              backgroundColor: item.color,
              marginRight: '5px',
            }}
          ></div>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export const MomentumChart: React.FC<MomentumChartProps> = ({
  createMomentumData,
  teamNames,
}: MomentumChartProps) => {
  const data = createMomentumData(teamNames[0], teamNames[1]);
  const minYValue =
    Math.round(Math.min(...data.map((item: any) => item.value))) - 5;
  const maxYValue =
    Math.round(Math.max(...data.map((item: any) => item.value))) + 5;

  const getBarColor = (entry: any) => {
    const defaultColor = 'lightslategrey'; // 該当する色がない場合はデフォルトの色
    // ポゼッションの終わり方によって異なる色を割り当て
    if (entry.outcome === 'Try') {
      return 'orangered';
    } else if (entry.outcome === 'Positive') {
      return 'green';
    } else if (entry.outcome === 'Negative') {
      return 'mediumpurple';
    } else {
      return defaultColor;
    }
  };

  return (
    <>
      <h2>モメンタムチャート</h2>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
        }}
      >
        {teamNames &&
          teamNames.map((value, index) => <h3 key={index}>{value}</h3>)}
      </Box>
      <LegendComponent />
      <ResponsiveContainer height={500} width="90%">
        <BarChart
          data={data}
          layout="vertical"
          barCategoryGap={0}
          margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
        >
          <XAxis type="number" domain={[minYValue, maxYValue]} />
          <YAxis type="category" hide />
          <Bar dataKey="value">
            {data.map((entry: any, index: number) => (
              <Cell key={index} fill={getBarColor(entry)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </>
  );
};
