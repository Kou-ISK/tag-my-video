import { Box } from "@mui/material";
import { CodeButton } from "./CodeButton";
import { useEffect, useState } from "react";

interface CodePanelProps {
    metaDataConfigFilePath: string,
    addTimelineData: any
    teamNames: string[];
    setTeamNames: any;
}

export const CodePanel = ({ metaDataConfigFilePath, addTimelineData, teamNames, setTeamNames }: CodePanelProps) => {
    // .metadata/config.jsonの内容を読み込み、チーム名をボタンにつける
    const [actionList, setActionList] = useState([]);

    useEffect(() => {
        if (metaDataConfigFilePath !== undefined) {
            // TODO fetchが上手くいっていない問題に対応する(undefinedになる)
            fetch(metaDataConfigFilePath)
                .then(response => response.json())
                .then(data => {
                    if (data) {
                        setTeamNames([data.team1Name, data.team2Name]);
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
            {actionList && actionList.map((value) => (
                <>
                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        {teamNames.map((teamName, index) =>
                            <CodeButton actionName={teamName + ' ' + value} addTimelineData={addTimelineData} color={index === 0 ? "error" : "primary"} />
                        )}
                    </Box>
                </>
            ))}
        </Box>
    )
}
