import { Box, Button, Slider } from "@mui/material"
import { useEffect } from "react"

export const VideoController = (
    { setIsVideoPlaying, isVideoPlaying, setPlayBackRate, currentTime, setCurrentTime, handleCurrentTime, maxSec }
        : { setIsVideoPlaying: any, isVideoPlaying: any, setPlayBackRate: any, currentTime: number, setCurrentTime: any, handleCurrentTime: any, maxSec: number }
) => {

    //TODO currentTimeが映像の時間に合わせて更新されるようにする
    useEffect(() => {
        window.electronAPI.on('shortcut-event', (event, args) => {
            if (args > 0) {
                setPlayBackRate(args)
                if (args === 1) {
                    setIsVideoPlaying(!isVideoPlaying)
                }
            } else {
                setCurrentTime(currentTime + args)
            }
        })
    }, [isVideoPlaying])

    return (
        <>
            <Button onClick={() => setIsVideoPlaying(!isVideoPlaying)}>{isVideoPlaying ? 'Pause All' : 'Play All'}</Button>
            <Button onClick={() => setCurrentTime(currentTime - 10)}>10秒戻る</Button>
            <Button onClick={() => setCurrentTime(currentTime - 5)}>5秒戻る</Button>
            <Button onClick={() => setPlayBackRate(0.5)}>0.5倍速</Button>
            <Button onClick={() => setPlayBackRate(1)}>1倍速</Button>
            <Button onClick={() => setPlayBackRate(2)}>2倍速</Button>
            <Button onClick={() => setPlayBackRate(6)}>6倍速</Button>
            <p>{currentTime}</p>
            <Box width={500}>
                <Slider aria-label="Time"
                    valueLabelDisplay="auto"
                    value={currentTime}
                    onChange={handleCurrentTime}
                    min={0} max={maxSec} />
            </Box></>
    )
}