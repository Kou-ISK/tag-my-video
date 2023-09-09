import { Box } from "@mui/material";
import { TimelineData } from '../../types/TimelineData';
import { CodeButton } from "./CodeButton";
import { useEffect, useState } from "react";

export const CodePanel = ({ timeline, setTimeline, metaDataConfigFilePath, addTimelineData }: { timeline: TimelineData[], setTimeline: any, metaDataConfigFilePath: string, addTimelineData: any }) => {
    // .metadata/config.jsonの内容を読み込み、チーム名をボタンにつける
    const [team1Name, setTeam1Name] = useState<string>('');
    const [actionList, setActionList] = useState(["Carry", "Pass", "Kick", "Tackle", "Check"]);
    const [team2Name, setTeam2Name] = useState<string>('');
    useEffect(() => {
        console.log(metaDataConfigFilePath)
        if (metaDataConfigFilePath !== undefined) {
            // TODO fetchが上手くいっていない問題に対応する(undefinedになる)
            fetch(metaDataConfigFilePath)
                .then(response => response.json())
                .then(data => {
                    if (data) {
                        setTeam1Name(data.team1Name);
                        setTeam2Name(data.team2Name);
                    }
                })
                .catch(error => console.error('Error loading JSON:', error));
        }
    }, [metaDataConfigFilePath])
    console.log(team1Name, team2Name)
    return (
        <Box sx={{
            border: '2px primary.main',
            padding: '2vw'
        }}>
            {actionList.map((value, index) => (
                <>
                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        <CodeButton actionName={team1Name + ' ' + value} addTimelineData={addTimelineData} />
                        <CodeButton actionName={team2Name + ' ' + value} addTimelineData={addTimelineData} />
                    </Box>
                </>
            ))}
        </Box>
    )
}
