import { Box } from "@mui/material";
import { TimelineData } from '../../types/TimelineData';
import { CodeButton } from "./CodeButton";

export const CodePanel = ({ timeline, setTimeline }: { timeline: TimelineData[], setTimeline: any }) => {
    const actionList = ["Carry", "Pass", "Kick"];

    return (
        <Box>
            {actionList.map((value, index) => (
                <CodeButton actionName={value} timeline={timeline} setTimeline={setTimeline} />
            ))}
        </Box>
    )
}
