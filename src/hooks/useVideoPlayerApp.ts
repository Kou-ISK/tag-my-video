import { useState } from "react";
import { TimelineData } from "../types/TimelineData";
import { ulid } from "ulid";

export const useVideoPlayerApp = () => {
    const [timeline, setTimeline] = useState<TimelineData[]>([]);
    const [videoList, setVideoList] = useState<string[]>();
    const [currentTime, setCurrentTime] = useState(0);
    const [timelineFilePath, setTimelineFilePath] = useState<string | undefined>();
    const [metaDataConfigFilePath, setMetaDataConfigFilePath] = useState<string>('');

    const [isFileSelected, setIsFileSelected] = useState(false);

    const [maxSec, setMaxSec] = useState(0);

    const [videoState, setVideoState] = useState<"play" | "pause" | "mute">("pause");
    const [playBackRate, setPlayBackRate] = useState(1);

    const handleCurrentTime = (event: Event, newValue: number | number[]) => {
        setCurrentTime(newValue as number);
    };
    const [packagePath, setPackagePath] = useState<string>('');

    const addTimelineData = (actionName: string,
        startTime: number,
        endTime: number,
        qualifier: string) => {
        const newTimelineInstance: TimelineData = { id: ulid(), actionName, startTime, endTime, qualifier };
        setTimeline([...timeline, newTimelineInstance]);
    }

    const updateQualifier = (id: string, qualifier: string) => {
        const updatedTimeline = timeline.map((item) =>
            item.id === id ? { ...item, qualifier } : item
        )
        setTimeline(updatedTimeline)
    }

    return {
        timeline, setTimeline, videoList, setVideoList,
        currentTime, setCurrentTime, timelineFilePath, setTimelineFilePath,
        metaDataConfigFilePath, setMetaDataConfigFilePath,
        isFileSelected, setIsFileSelected,
        maxSec, setMaxSec, videoState, setVideoState, playBackRate, setPlayBackRate, handleCurrentTime,
        packagePath, setPackagePath, addTimelineData, updateQualifier
    }
}