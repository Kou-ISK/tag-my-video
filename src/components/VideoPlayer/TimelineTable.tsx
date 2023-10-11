import { Button, Checkbox, Input, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useEffect, useState } from 'react';
import { TimelineData } from '../../types/TimelineData';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { ActionResultSelector } from './ActionResultSelector';
import { ActionTypeSelector } from './ActionTypeSelector';

interface TimelineTableProps {
    timelineFilePath: string | undefined,
    setCurrentTime: any,
    timeline: TimelineData[],
    setTimeline: any,
    getSelectedTimelineId: any,
    updateQualifier: any,
    updateActionResult: any,
    updateActionType: any,
    sortTimelineDatas: any
}

export const TimelineTable = ({ timelineFilePath, setCurrentTime, timeline, setTimeline, getSelectedTimelineId, updateQualifier, updateActionResult, updateActionType, sortTimelineDatas }: TimelineTableProps) => {

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

    return (
        <TableContainer sx={{ overflowY: 'scroll', maxWidth: '75vw' }} component={Paper}>
            <Table stickyHeader size="small">
                <TableHead>
                    <TableRow sx={{ position: 'sticky', zIndex: 1500 }}>
                        <TableCell padding='none' align="center" onClick={handleSortByActionName}>Action Name{isActionNameDesc ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />}
                        </TableCell>
                        <TableCell padding='none' align="left" onClick={handleSortByStartTime}>Start Time{isStartTimeDesc ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />}
                        </TableCell>
                        <TableCell padding='none' align="left" onClick={handleSortByEndTime}>
                            End Time{isEndTimeDesc ? <ArrowDropDownIcon /> : <ArrowDropUpIcon />}
                        </TableCell>
                        <TableCell padding='none' align="left">Qualifiers</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {timeline.map((item, index) => (
                        <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 }, zIndex: 1000 }} >
                            <TableCell padding='none' align="left"><Checkbox onClick={(event) => getSelectedTimelineId(event, item.id)} />{item.actionName}</TableCell>
                            <TableCell padding='none' align="left"><Button onClick={() => setCurrentTime(item.startTime)}>{item.startTime}</Button></TableCell>
                            <TableCell padding='none' align="left"><Button onClick={() => setCurrentTime(item.endTime)}>{item.endTime}</Button></TableCell>
                            <TableCell padding='none' align="left" sx={{ display: 'flex', flexDirection: 'row' }}>
                                <ActionTypeSelector id={item.id} actionName={item.actionName} actionType={item.actionType} updateActionType={updateActionType} />
                                <ActionResultSelector id={item.id} actionName={item.actionName} actionResult={item.actionResult} updateActionResult={updateActionResult} />
                                <Input type='text' sx={{ width: '30%', margin: '0', padding: '0' }} value={item.qualifier} onChange={(e) => updateQualifier(item.id, e.currentTarget.value)} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
