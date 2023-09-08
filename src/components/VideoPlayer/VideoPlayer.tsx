import { Box } from "@mui/material";
import React, { Dispatch, SetStateAction, useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

interface VideoPlayerProps {
    videoSrc: string;
    id: string;
    isVideoPlaying: boolean
    videoPlayBackRate: number;
    currentTime: number;
    setMaxSec: Dispatch<SetStateAction<number>>;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoSrc, id, isVideoPlaying, videoPlayBackRate, currentTime, setMaxSec }) => {
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
        if (videoRef.current) {
            const option = { 'autoplay': true, 'aspectRatio': '16:9' }
            const player = videojs(videoRef.current, option);

            player.ready(() => {
                const duration = player.duration()
                if (duration !== undefined) {
                    setMaxSec(duration);
                }
            });
            if (isVideoPlaying) {
                player.play();
            } else if (!isVideoPlaying) {
                player.pause();
            }
            player.playbackRate(videoPlayBackRate);
        }
    }, [isVideoPlaying, videoRef, videoPlayBackRate]);

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
                controls
            >
                <source src={videoSrc} type="video/mp4" />
            </video>
        </Box>
    );
};
