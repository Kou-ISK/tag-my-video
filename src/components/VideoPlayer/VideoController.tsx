import { Box, Button, Slider } from "@mui/material"
import { useEffect, useState } from "react"
import videojs from "video.js"

export const VideoController = (
    { setIsVideoPlaying, isVideoPlaying, setPlayBackRate, setCurrentTime, handleCurrentTime, maxSec }
        : { setIsVideoPlaying: any, isVideoPlaying: any, setPlayBackRate: any, setCurrentTime: any, handleCurrentTime: any, maxSec: number }
) => {
    const [videoTime, setVideoTime] = useState<number>(0); // Sliderで表示される映像の再生時間を管理

    useEffect(() => {
        window.electronAPI.on('shortcut-event', (event, args) => {
            if (args > 0) {
                setPlayBackRate(args)
                if (args === 1) {
                    setIsVideoPlaying(!isVideoPlaying)
                }
            } else {
                setCurrentTime(videoTime + args)
            }
        })
    }, [isVideoPlaying])

    // 映像の再生位置を監視し、変更があればvideoTimeを更新
    useEffect(() => {
        const player = videojs('video_0');
        if (player) {
            player.on("timeupdate", () => {
                const newVideoTime = player.currentTime();
                if (newVideoTime) {
                    setVideoTime(newVideoTime);
                }
            });
        }
        return () => {
            player.off("timeupdate", setVideoTime);
        };
    }, []);

    return (
        <>
            <Button onClick={() => setIsVideoPlaying(!isVideoPlaying)}>{isVideoPlaying ? 'Pause All' : 'Play All'}</Button>
            <Button onClick={() => setCurrentTime(videoTime - 10)}>10秒戻る</Button>
            <Button onClick={() => setCurrentTime(videoTime - 5)}>5秒戻る</Button>
            <Button onClick={() => setPlayBackRate(0.5)}>0.5倍速</Button>
            <Button onClick={() => setPlayBackRate(1)}>1倍速</Button>
            <Button onClick={() => setPlayBackRate(2)}>2倍速</Button>
            <Button onClick={() => setPlayBackRate(6)}>6倍速</Button>
            <Box sx={{ paddingLeft: "30px" }} width={500}>
                <Slider aria-label="Time"
                    valueLabelDisplay="auto"
                    value={videoTime}
                    onChange={handleCurrentTime}
                    min={0} max={maxSec} />
            </Box></>
    )
}