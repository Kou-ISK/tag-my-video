import { Box } from "@mui/material";
import React, { Dispatch, SetStateAction, useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

interface VideoPlayerProps {
    videoSrc: string;
    id: string;
    videoState: "play" | "pause" | "mute";
    videoPlayBackRate: number;
    currentTime: number;
    setMaxSec: Dispatch<SetStateAction<number>>;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoSrc, id, videoState, videoPlayBackRate, currentTime, setMaxSec }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            const option = { 'autoplay': true, 'aspectRatio': '16:9' }
            const player = videojs(videoRef.current, option);
            return () => {
                player.dispose();
            };
        }
    }, [videoRef]);

    useEffect(() => {
        console.log(videoRef.current);
        if (videoRef.current) {
            const option = { 'autoplay': true, 'aspectRatio': '16:9' }
            const player = videojs(videoRef.current, option);

            player.ready(() => {
                const duration = player.duration()
                if (duration !== undefined) {
                    setMaxSec(duration);
                }
            });

            if (videoState === "play") {
                player.play();
            } else if (videoState === "pause") {
                player.pause();
            } else if (videoState === "mute") {
                player.muted(true);
            }
            player.playbackRate(videoPlayBackRate);
        }
    }, [videoState, videoRef, videoPlayBackRate]);

    useEffect(() => {
        if (videoRef.current) {
            const player = videojs(videoRef.current);
            if (!isNaN(currentTime)) {
                player.currentTime(currentTime);
            }
        }
    }, [currentTime])

    return (
        <Box width="100%" height="100%">
            <video
                ref={videoRef}
                className="video-js"
                preload="auto"
                width="640"
                height="360"
                id={id}
            >
                <source src={videoSrc} type="video/mp4" />
            </video>
        </Box>
    );
};
