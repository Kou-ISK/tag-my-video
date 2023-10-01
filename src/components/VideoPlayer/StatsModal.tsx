import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { useEffect, useState } from 'react';
import { TimelineData } from '../../types/TimelineData';
import { useAnalysis } from '../../hooks/useAnalysis';
import * as path from 'path';
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
        boxShadow: 24,
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

    const transformedData = useAnalysis(timeline);
    console.log(transformedData.transformedData)
    // 参考: https://mui.com/x/react-charts/

    return (
        <Modal
            open={open}
            onClose={toggleOpen}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <PieChart width={400} height={400}>
                    <Pie
                        dataKey="value"
                        startAngle={180}
                        endAngle={0}
                        data={transformedData.transformedData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label
                    />
                </PieChart>

                {/* <PieChart
                    series={[{ data: transformedData.transformedData }]}
                /> */}
            </Box>
        </Modal>
    );
}