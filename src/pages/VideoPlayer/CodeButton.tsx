import { Button } from "@mui/material"
import { TimelineData } from "../../types/TimelineData"
import { useEffect, useRef, useState } from "react";
import videojs from "video.js";

export const CodeButton = ({ actionName, timeline, setTimeline }: { actionName: string, timeline: TimelineData[], setTimeline: any }) => {
    const [isActionButonPushed, setIsActionButtonPushed] = useState(false);
    const currentPlayerRef = useRef<any>();
    const [startTime, setStartTime] = useState(0);
    useEffect(() => {
        currentPlayerRef.current = videojs('video_0');
        return () => {
            if (currentPlayerRef.current) {
                currentPlayerRef.current.dispose();
            }
        };
    }, [actionName]);

    const addTimeline = (qualifier: string) => {
        const currentPlayer = currentPlayerRef.current;

        if (currentPlayer) {
            const currentTime = currentPlayer.currentTime();
            if (!isNaN(currentTime)) {
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
            <Button variant={isActionButonPushed ? "contained" : "outlined"} onClick={() => addTimeline('')}>{actionName}</Button></>
    )
}