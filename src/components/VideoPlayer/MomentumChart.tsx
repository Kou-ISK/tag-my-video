import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";
import React from "react";
import { Box } from "@mui/material";

interface MomentumChartProps {
    createMomentumData: any;
    team1Name: string;
    team2Name: string;
}

export const MomentumChart: React.FC<MomentumChartProps> = ({
    createMomentumData,
    team1Name,
    team2Name,
}: MomentumChartProps) => {
    const data = createMomentumData(team1Name, team2Name);
    const minYValue = Math.round(Math.min(...data.map((item: any) => item.value))) - 5;
    const maxYValue = Math.round(Math.max(...data.map((item: any) => item.value))) + 5;

    const teamColors: { [key: string]: string } = {
        [team1Name]: "royalblue",
        [team2Name]: "darkgoldenrod",
    };

    const getBarColor = (entry: any) => {
        // チームごとに異なる色を割り当て
        const defaultColor = teamColors[entry.teamName] || "lightgrey"; // 該当する色がない場合はデフォルトの色
        // ポゼッションの終わり方によって異なる色を割り当て
        if (entry.isTryScored) { return "crimson" }
        else if (entry.isPositiveResult) { return "green" }
        else { return defaultColor; }
    };

    return (
        <>
            <h2>モメンタムチャート</h2>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly' }}>
                <p>{team1Name}</p>
                <p>{team2Name}</p>
            </Box>
            <ResponsiveContainer height={500} width="90%">
                <BarChart data={data} layout="vertical" barCategoryGap={0} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <XAxis type="number" domain={[minYValue, maxYValue]} />
                    <YAxis type="category" hide />
                    <Bar dataKey="value">
                        {data.map((entry: any, index: number) => (
                            <>
                                <Cell
                                    key={index}
                                    fill={getBarColor(entry)}
                                />
                            </>
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </>
    );
};
