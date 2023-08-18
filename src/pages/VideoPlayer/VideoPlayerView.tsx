import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";

type VideoPlayerViewProps = {
    id: string;
    filePath: string;
    player: Player | null;
};

export const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({ id, filePath, player }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && player) {
            player.src(filePath);
            player.load();
            player.on("timeupdate", () => {
                const currentTime = player.currentTime();
                player.tech_.trigger('play');
                player.tech_.setCurrentTime(currentTime);
            });
        }
    }, [filePath, player]);

    return (
        <div>
            <video
                ref={videoRef}
                id={id}
                className="video-js"
                controls
                preload="auto"
                width="800"
                height="450"
                data-setup="{}"
            >
                <source src={filePath} type="video/mp4" />
            </video>
        </div>
    );
};
