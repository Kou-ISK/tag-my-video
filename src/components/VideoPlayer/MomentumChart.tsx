import { Bar, BarChart, Tooltip, XAxis, YAxis } from "recharts"

interface MomentumChartProps {
    createMomentumData: any,
    team1Name: string,
    team2Name: string
}

export const MomentumChart = ({ createMomentumData, team1Name, team2Name }: MomentumChartProps) => {
    const data = createMomentumData(team1Name, team2Name)
    return (
        <>
            <h2>モメンタムチャート</h2>
            <BarChart width={730} height={250} data={data}>
                <XAxis dataKey="timespan" />
                <YAxis />
                <Tooltip content={<CustomTooltip team1Name={team1Name} team2Name={team2Name} />} />
                <Bar dataKey="value" fill="#8884d8">
                </Bar>
            </BarChart>
        </>
    )
}

const CustomTooltip = ({ active, payload, label, team1Name, team2Name }: any) => {
    if (active && payload && payload.length) {
        const entry = payload[0].payload; // バーのデータ
        const teamName = entry.value > 0 ? team1Name : team2Name; // チーム名
        return (
            <div className="custom-tooltip">
                <p>{teamName}</p>
            </div>
        );
    }
    return null;
};
