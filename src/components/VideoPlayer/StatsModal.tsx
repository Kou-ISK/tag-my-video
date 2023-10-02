import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { useEffect, useState } from 'react';
import { TimelineData } from '../../types/TimelineData';
import { calculateActionDuration } from '../../hooks/useAnalysis';
import { Pie, PieChart } from 'recharts';
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

    const durationData = calculateActionDuration(timeline);
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

    return (
        <Modal
            open={open}
            onClose={toggleOpen}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            sx={{ zIndex: 1600 }}
        >
            <Box sx={style}>
                {/* ポゼッショングラフ */}
                <PieChart width={200} height={200}>
                    <Pie
                        nameKey="name"
                        dataKey="value"
                        startAngle={180}
                        endAngle={0}
                        data={durationData.filter((item) => item.name.includes('ポゼッション'))}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        label={renderCustomizedLabel}
                    />
                </PieChart>
            </Box>
        </Modal>
    );
}
