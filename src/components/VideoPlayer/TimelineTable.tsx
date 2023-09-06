import { Button, Input, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useEffect } from 'react';
import { TimelineData } from '../../types/TimelineData';

export const TimelineTable = ({ timelineFilePath, setCurrentTime, timeline, setTimeline, updateQualifier }: { timelineFilePath: string | undefined, setCurrentTime: any, timeline: TimelineData[], setTimeline: any, updateQualifier: any }) => {

    useEffect(() => {
        if (timelineFilePath !== undefined && timelineFilePath !== 'notSelected') {
            fetch(timelineFilePath)
                .then(response => response.json())
                .then(data => setTimeline(data))
                .catch(error => console.error('Error loading JSON:', error));
        }
    }, [timelineFilePath]);

    return (
        <div style={{ overflowY: 'scroll', maxHeight: '500px' }}> {/* Set the max height and overflow for scrolling */}
            <TableContainer component={Paper}>
                <Table sx={{
                    maxWidth: 900, tableLayout: "fixed"
                }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell >Action Name</TableCell>
                            <TableCell align="left">Start Time</TableCell>
                            <TableCell align="left">End Time</TableCell>
                            <TableCell align="left">Qualifier</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {timeline.map((item, index) => (
                            <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
                                <TableCell>{item.actionName}</TableCell>
                                <TableCell align="left"><Button onClick={() => setCurrentTime(item.startTime)}>{item.startTime}</Button></TableCell>
                                <TableCell align="left"><Button onClick={() => setCurrentTime(item.endTime)}>{item.endTime}</Button></TableCell>
                                <TableCell align="left"><Input type='text' value={item.qualifier} onChange={(e) => updateQualifier(item.id, e.currentTarget.value)} /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};
