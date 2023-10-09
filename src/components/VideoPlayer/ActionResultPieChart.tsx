import { Box } from "@mui/material"
import { Cell, Pie, PieChart } from "recharts"

interface ActionResultPieChartProps {
    countActionByTeamName: any,
    teamName: string,
    actionName: string
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

export const ActionResultPieChart = ({ countActionByTeamName, teamName, actionName }: ActionResultPieChartProps) => {
    const data = countActionByTeamName(teamName, actionName)
    return (
        <>
            <Box sx={{ flexDirection: 'column', margin: '5px', justifyContent: 'left' }}>
                <h2>{teamName + ' ' + actionName}</h2>
                <PieChart width={400} height={180} >
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
                        label={({ name, value }) => (name + ' ' + value)} >
                        {data.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={CUSTOM_COLORS[index]} />
                        ))}
                    </Pie>
                </PieChart>
            </Box>
        </>
    )
}