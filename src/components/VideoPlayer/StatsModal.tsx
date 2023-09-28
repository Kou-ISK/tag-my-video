import * as React from 'react';
import Box from '@mui/material/Box';
import { BarChart } from '@mui/x-charts/BarChart';
import Modal from '@mui/material/Modal';
import { useEffect, useState } from 'react';
import { TimelineData } from '../../types/TimelineData';

interface StatsModalProps {
    timeline: TimelineData[];
}

export const StatsModal = ({ timeline }: StatsModalProps) => {
    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
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


    // 参考: https://mui.com/x/react-charts/

    // 仮のラベル
    const xLabels = [
        'Page A',
        'Page B',
        'Page C',
        'Page D',
        'Page E',
        'Page F',
        'Page G',
    ];

    return (
        <Modal
            open={open}
            onClose={toggleOpen}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <BarChart
                    width={500}
                    height={300}
                    series={timeline}
                    xAxis={[{ data: xLabels, scaleType: 'band' }]}
                />
            </Box>
        </Modal>
    );
}