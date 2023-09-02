import { Box } from "@mui/material";
import { TimelineData } from '../../types/TimelineData';
import { CodeButton } from "./CodeButton";
import { useEffect, useState } from "react";
import { MetaData } from "../../types/MetaData";

export const CodePanel = ({ timeline, setTimeline, metaDataConfigFilePath }: { timeline: TimelineData[], setTimeline: any, metaDataConfigFilePath: string }) => {
    // .metadata/config.jsonの内容を読み込み、チーム名をボタンにつける
    const [team1Name, setTeam1Name] = useState<string>('');
    const actionList = ["Carry", "Pass", "Kick", "Tackle", "Check"];
    const [team2Name, setTeam2Name] = useState<string>('');
    const [metaData, setMetaData] = useState<MetaData>();
    useEffect(() => {
        console.log(metaDataConfigFilePath)
        if (metaDataConfigFilePath !== undefined) {
            // TODO fetchが上手くいっていない問題に対応する(undefinedになる)
            fetch(metaDataConfigFilePath)
                .then(response => response.json())
                .then(data => setMetaData(data))
                .catch(error => console.error('Error loading JSON:', error));
            console.log(metaData)
            setTeam1Name(metaData.team1Name);
            setTeam2Name(metaData.team2Name);
        }
    }, [metaDataConfigFilePath])

    return (
        <Box sx={{
            border: '2px primary.main',
            padding: '2vw'
        }}>
            {actionList.map((value, index) => (
                <>
                    <CodeButton actionName={team1Name + ' ' + value} timeline={timeline} setTimeline={setTimeline} />
                    <CodeButton actionName={team2Name + ' ' + value} timeline={timeline} setTimeline={setTimeline} />
                </>
            ))}
        </Box>
    )
}
