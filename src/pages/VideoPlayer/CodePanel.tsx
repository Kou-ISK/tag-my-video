import { Box } from "@mui/material";
import { TimelineData } from '../../types/TimelineData';
import { CodeButton } from "./CodeButton";

export const CodePanel = ({ timeline, setTimeline }: { timeline: TimelineData[], setTimeline: any }) => {
    // .metadata/config.jsonの内容を読み込み、チーム名をボタンにつける
    const actionList = ["Carry", "Pass", "Kick", "Tackle", "Check"];

    return (
        <Box sx={{
            border: '2px primary.main',
            padding: '2vw'
        }}>
            {actionList.map((value, index) => (
                <CodeButton actionName={value} timeline={timeline} setTimeline={setTimeline} />
            ))}
        </Box>
    )
}
