import * as React from 'react';
import Box from '@mui/material/Box';
import { BarChart } from '@mui/x-charts/BarChart';
import Modal from '@mui/material/Modal';
import { useEffect, useState } from 'react';
import { TimelineData } from '../../types/TimelineData';
import { useAnalysis } from '../../hooks/useAnalysis';
import { TransformedData } from '../../types/TransformedData';

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
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
        zIndex: 2000
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

    const valueFormatter = (value: number) => `${value}sec`;
    const chartSetting = {
        xAxis: [
            {
                label: 'Duration',
            },
        ],
        width: 500,
        height: 400,
    };
    return (
        <Modal
            open={open}
            onClose={toggleOpen}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <p>データでるよ</p>
                <BarChart
                    dataset={transformedData.transformedData}
                    yAxis={[{ scaleType: 'band', dataKey: 'actionName' }]}
                    series={[
                        { dataKey: 'duration', label: 'Duration', valueFormatter },
                    ]}
                    layout="horizontal"
                    {...chartSetting}
                />
            </Box>
        </Modal>
    );
}