import { Button, Checkbox, Input, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel } from '@mui/material';
import { useEffect, useState } from 'react';
import { TimelineData } from '../../types/TimelineData';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';

interface TimelineTableProps {
    timelineFilePath: string | undefined,
    setCurrentTime: any,
    timeline: TimelineData[],
    setTimeline: any,
    getSelectedTimelineId: any,
    updateQualifier: any,
    sortTimelineDatas: any
}

export const TimelineTable = ({ timelineFilePath, setCurrentTime, timeline, setTimeline, getSelectedTimelineId, updateQualifier, sortTimelineDatas }: TimelineTableProps) => {

    useEffect(() => {
        console.log(timelineFilePath)
        if (timelineFilePath !== undefined && timelineFilePath !== 'notSelected') {
            fetch(timelineFilePath)
                .then(response => response.json())
                .then(data => setTimeline(data))
                .catch(error => console.error('Error loading JSON:', error));
        }
    }, [timelineFilePath]);

    const [isActionNameDesc, setIsActionNameDesc] = useState<boolean>(true);
    const [isStartTimeDesc, setIsStartTimeDesc] = useState<boolean>(true);
    const [isEndTimeDesc, setIsEndTimeDesc] = useState<boolean>(true);

    const handleSortByActionName = () => {
        sortTimelineDatas('actionName', isActionNameDesc)
        setIsActionNameDesc(!isActionNameDesc)
    }

    const handleSortByStartTime = () => {
        sortTimelineDatas('startTime', isStartTimeDesc)
        setIsStartTimeDesc(!isStartTimeDesc)
    }

    const handleSortByEndTime = () => {
        sortTimelineDatas('endTime', isEndTimeDesc)
        setIsEndTimeDesc(!isEndTimeDesc)
    }

    // チェックボックスを配置し、選択したものだけのリストを作る。
    // TODO セルの高さと幅を修正する
    return (
        <TableContainer sx={{ overflowY: 'scroll', maxWidth: '75vw' }} component={Paper}>
            <Table stickyHeader>
                <TableHead>
                    <TableRow sx={{ position: 'sticky', zIndex: 1500 }}>
                        <TableCell onClick={handleSortByActionName}>Action Name{isActionNameDesc ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />}
                        </TableCell>
                        <TableCell align="left" onClick={handleSortByStartTime}>Start Time{isStartTimeDesc ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />}
                        </TableCell>
                        <TableCell align="left" onClick={handleSortByEndTime}>
                            End Time{isEndTimeDesc ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />}
                        </TableCell>
                        <TableCell align="left">Qualifier</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {timeline.map((item, index) => (
                        <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 }, zIndex: 1000 }} >
                            <TableCell><Checkbox onClick={(event) => getSelectedTimelineId(event, item.id)} />{item.actionName}</TableCell>
                            <TableCell align="left"><Button onClick={() => setCurrentTime(item.startTime)}>{item.startTime}</Button></TableCell>
                            <TableCell align="left"><Button onClick={() => setCurrentTime(item.endTime)}>{item.endTime}</Button></TableCell>
                            <TableCell align="left"><Input type='text' value={item.qualifier} onChange={(e) => updateQualifier(item.id, e.currentTarget.value)} /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
