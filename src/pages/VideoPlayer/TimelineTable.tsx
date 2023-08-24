import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useEffect, useState } from 'react';
import { TimelineData } from '../../types/TimelineData';

export const TimelineTable = ({ timeLineFilePath, setCurrentTime }: { timeLineFilePath: string, setCurrentTime: any }) => {
    const [jsonData, setJsonData] = useState<TimelineData[]>([]);

    useEffect(() => {
        fetch(timeLineFilePath)
            .then(response => response.json())
            .then(data => setJsonData(data))
            .catch(error => console.error('Error loading JSON:', error));
    }, [timeLineFilePath]);

    return (
        <>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Action Name</TableCell>
                            <TableCell align="left">Start Time</TableCell>
                            <TableCell align="left">End Time</TableCell>
                            <TableCell align="left">Qualifier</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {jsonData.map((item, index) => (
                            <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
                                <TableCell>{item.actionName}</TableCell>
                                <TableCell align="left"><Button onClick={() => setCurrentTime(item.startTime)}>{item.startTime}</Button></TableCell>
                                <TableCell align="left"><Button onClick={() => setCurrentTime(item.endTime)}>{item.endTime}</Button></TableCell>
                                <TableCell align="left">{item.qualifier}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};
