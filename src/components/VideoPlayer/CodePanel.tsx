import { Box } from "@mui/material";
import { CodeButton } from "./CodeButton";
import { useEffect, useState } from "react";

interface CodePanelProps {
    metaDataConfigFilePath: string,
    addTimelineData: any
    team1Name: string,
    team2Name: string,
    setTeam1Name: any,
    setTeam2Name: any,
}

export const CodePanel = ({ metaDataConfigFilePath, addTimelineData, team1Name, team2Name, setTeam1Name, setTeam2Name }: CodePanelProps) => {
    // .metadata/config.jsonの内容を読み込み、チーム名をボタンにつける
    const [actionList, setActionList] = useState([]);

    useEffect(() => {
        if (metaDataConfigFilePath !== undefined) {
            // TODO fetchが上手くいっていない問題に対応する(undefinedになる)
            fetch(metaDataConfigFilePath)
                .then(response => response.json())
                .then(data => {
                    if (data) {
                        setTeam1Name(data.team1Name);
                        setTeam2Name(data.team2Name);
                        setActionList(data.actionList);
                    }
                })
                .catch(error => console.error('Error loading JSON:', error));
        }
    }, [metaDataConfigFilePath])

    return (
        <Box sx={{
            border: '2px primary.main',
            padding: '2px',
            overflowY: 'scroll',
            width: '25vw'
        }}>
            {actionList && actionList.map((value, index) => (
                <>
                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        <CodeButton actionName={team1Name + ' ' + value} addTimelineData={addTimelineData} color="error" />
                        <CodeButton actionName={team2Name + ' ' + value} addTimelineData={addTimelineData} color="primary" />
                    </Box>
                </>
            ))}
        </Box>
    )
}
