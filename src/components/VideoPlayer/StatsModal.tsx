import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { useEffect, useState } from 'react';
import { TimelineData } from '../../types/TimelineData';
import { useAnalysis } from '../../hooks/useAnalysis';
import { Pie, PieChart } from 'recharts';
import { ActionResultPieChart } from './ActionResultPieChart';
interface StatsModalProps {
    timeline: TimelineData[];
    team1Name: string;
    team2Name: string;
}

export const StatsModal = ({ timeline, team1Name, team2Name }: StatsModalProps) => {
    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 900,
        height: 900,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 10,
        p: 4,
        zIndex: 2000,
        justifyItem: 'center',
        overflowY: 'scroll',
        marginY: '50vw'
    };

    const [open, setOpen] = useState<boolean>(false);
    const toggleOpen = () => setOpen(!open);
    useEffect(() => {
        window.electronAPI.on('general-shortcut-event', (event, args) => {
            console.log('hello')
            if (args === 'analyze') {
                setOpen(!open)
            }
        })
    }, []);

    const { countActions, calculateActionDuration, countActionByTeamName } = useAnalysis(timeline);
    // ラベル名
    const formatDuration = (seconds: number) => {
        const min = Math.floor(seconds % 3600 / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec}`;
    }
    const renderCustomizedLabel = ({ name, value }: any) => {
        return name.replace(' ポゼッション', '') + ' ' + formatDuration(value);
    };
    // 参考: https://recharts.org/en-US/

    const actions: string[] = ["スクラム", "ラインアウト", "キック"];

    // TODO 見切れないようにpadding, marginを調整
    return (
        <Modal
            open={open}
            onClose={toggleOpen}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            sx={{ zIndex: 1600 }}
        >
            <Box sx={style}>
                <Box>
                    <h2>ポゼッション</h2>
                    <PieChart width={500} height={200}>
                        <Pie
                            nameKey="name"
                            dataKey="value"
                            startAngle={180}
                            endAngle={0}
                            data={calculateActionDuration().filter((item) => item.name.includes('ポゼッション'))}
                            cx="50%"
                            cy="100%"
                            outerRadius={80}
                            fill="#8884d8"
                            label={renderCustomizedLabel}
                        />
                    </PieChart>
                </Box>
                {actions && actions.map((value, index) => (
                    <Box key={index} display={'flex'} flexDirection={'row'}>
                        <ActionResultPieChart countActionByTeamName={countActionByTeamName} teamName={team1Name} actionName={value} />
                        <ActionResultPieChart countActionByTeamName={countActionByTeamName} teamName={team2Name} actionName={value} />
                    </Box>
                ))}
            </Box>
        </Modal>
    );
}
