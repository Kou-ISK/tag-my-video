import { Box } from "@mui/material";
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
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
    const playerRef = useRef<any>(null); // プレイヤーの参照を保持

    useEffect(() => {
        if (videoRef.current) {
            const option = { 'autoplay': true, 'aspectRatio': '16:9' };

            // プレイヤーが初期化されていない場合のみ初期化
            if (!playerRef.current) {
                const player = videojs(videoRef.current, option);
                playerRef.current = player;
                player.ready(() => {
                    const duration = player.duration();
                    if (duration !== undefined) {
                        setMaxSec(duration);
                    }
                });
            }

            // プレイヤーの状態を設定
            const player = playerRef.current;
            if (player) {
                if (videoState === "play") {
                    player.play();
                } else if (videoState === "pause") {
                    player.pause();
                } else if (videoState === "mute") {
                    player.muted(true);
                }
                player.playbackRate(videoPlayBackRate);
                if (!isNaN(currentTime)) {
                    player.currentTime(currentTime);
                }
            }

            return () => {
                if (playerRef.current) {
                    playerRef.current.dispose();
                    playerRef.current = null;
                }
            };
        }
    }, [videoRef, videoState, currentTime, videoPlayBackRate]);

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
