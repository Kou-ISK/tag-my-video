import { Button } from "@mui/material"
import { TimelineData } from "../../types/TimelineData"
import { useState } from "react";
import videojs from "video.js";

export const CodeButton = ({ actionName, timeline, setTimeline }: { actionName: string, timeline: TimelineData[], setTimeline: any }) => {
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
                    const timelineInstance: TimelineData = {
                        actionName,
                        startTime,
                        endTime: newEndTime,
                        qualifier
                    };
                    setTimeline([...timeline, timelineInstance]);
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