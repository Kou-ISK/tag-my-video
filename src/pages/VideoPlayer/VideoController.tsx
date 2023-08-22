import { Box, Button, Slider } from "@mui/material"

export const VideoController = (
    { setVideoState, setPlayBackRate, currentTime, handleCurrentTime, maxSec }
        : { setVideoState: any, setPlayBackRate: any, currentTime: number, handleCurrentTime: any, maxSec: number }
) => {
    return (
        <>
            <Button onClick={() => setVideoState('play')}>Play All</Button>
            <Button onClick={() => setVideoState('pause')}>Pause All</Button>
            <Button onClick={() => setVideoState('mute')}>Mute All</Button>
            <Button onClick={() => setPlayBackRate(0.5)}>0.5倍速</Button>
            <Button onClick={() => setPlayBackRate(1)}>1倍速</Button>
            <Button onClick={() => setPlayBackRate(2)}>2倍速</Button>
            <Button onClick={() => setPlayBackRate(6)}>6倍速</Button>
            <Box width={500}>
                <Slider aria-label="Time"
                    valueLabelDisplay="auto"
                    value={currentTime}
                    step={1}
                    onChange={handleCurrentTime}
                    min={0} max={maxSec} />
            </Box></>
    )
}