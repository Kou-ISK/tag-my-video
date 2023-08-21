import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

interface VideoPlayerProps {
    videoSrc: string;
    videoState: "play" | "pause" | "mute";
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoSrc, videoState }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            const player = videojs(videoRef.current);

            return () => {
                player.dispose();
            };
        }
    }, [videoRef]);

    useEffect(() => {
        if (videoRef.current) {
            const player = videojs(videoRef.current);

            if (videoState === "play") {
                player.play();
            } else if (videoState === "pause") {
                player.pause();
            } else if (videoState === "mute") {
                player.muted(true);
            }
        }
    }, [videoState, videoRef]);

    return (
        <div>
            <video
                ref={videoRef}
                className="video-js"
                controls
                preload="auto"
                width="640"
                height="360"
                key={videoSrc}
            >
                <source src={videoSrc} type="video/mp4" />
            </video>
            <p>{videoSrc}</p>
            <p>{videoState}</p>
        </div>
    );
};
