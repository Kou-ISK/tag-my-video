import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis, Label, Legend } from 'recharts';
import React from "react";
import { Box } from "@mui/material";

interface MomentumChartProps {
    createMomentumData: any;
    teamNames: string[];
}

export const MomentumChart: React.FC<MomentumChartProps> = ({
    createMomentumData,
    teamNames
}: MomentumChartProps) => {
    const data = createMomentumData(teamNames[0], teamNames[1]);
    const minYValue = Math.round(Math.min(...data.map((item: any) => item.value))) - 5;
    const maxYValue = Math.round(Math.max(...data.map((item: any) => item.value))) + 5;

    const getBarColor = (entry: any) => {
        const defaultColor = "lightgrey"; // 該当する色がない場合はデフォルトの色
        // ポゼッションの終わり方によって異なる色を割り当て
        if (entry.isTryScored) { return "orangered" }
        else if (entry.isPositiveResult) { return "green" }
        else if (entry.isNegativeResult) { return "mediumpurple" }
        else { return defaultColor; }
    };

    return (
        <>
            <h2>モメンタムチャート</h2>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly' }}>
                <p>{teamNames[0]}</p>
                <p>{teamNames[1]}</p>
            </Box>
            <ResponsiveContainer height={500} width="90%">
                <BarChart data={data} layout="vertical" barCategoryGap={0} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <XAxis type="number" domain={[minYValue, maxYValue]} />
                    <YAxis type="category" hide />
                    <Bar dataKey="value">
                        {data.map((entry: any, index: number) => (
                            <Cell
                                key={index}
                                fill={getBarColor(entry)}
                            />
                        ))}
                    </Bar>
                    <Legend />
                </BarChart>
            </ResponsiveContainer>
        </>
    );
};
