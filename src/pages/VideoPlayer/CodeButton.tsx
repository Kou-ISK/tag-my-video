import { Button } from "@mui/material"
import { useState } from "react";
import videojs from "video.js";

export const CodeButton = ({ actionName, addTimelineData }: { actionName: string, addTimelineData: any }) => {
    const [isActionButonPushed, setIsActionButtonPushed] = useState(false);
    const [startTime, setStartTime] = useState(0);


    const addTimeline = (qualifier: string) => {
        const player = videojs('video_0');

        if (player) {
            const currentTime = player.currentTime();
            if (currentTime) {
                if (!isActionButonPushed) {
                    setStartTime(currentTime);
                } else {
                    const newEndTime = currentTime;
                    addTimelineData(actionName,
                        startTime,
                        newEndTime,
                        qualifier)

                }
                setIsActionButtonPushed(!isActionButonPushed);
            }
        }
    }


    return (
        <>
            <Button sx={{ "margin": "3px" }} variant={isActionButonPushed ? "contained" : "outlined"} onClick={() => addTimeline('')}>{actionName}</Button></>
    )
}