// VideoPlayerView.tsx

import { useEffect } from 'react';
import videojs from 'video.js';
import { Player } from 'videojs';

interface VideoPlayerViewProps {
    id: string;
    filePath: string;
    onPlayerReady: (player: Player) => void;
}

export const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({ id, filePath, onPlayerReady }) => {

    useEffect(() => {
        const player = videojs(id);
        onPlayerReady(player.player_);

        player.src(filePath);

        return () => {
            player.dispose();
        };
    }, [id, filePath, onPlayerReady]);

    return (
        <video id={id}
            className="video-js"
            controls
            autoPlay={true}
            style={{ width: '400px', aspectRatio: '16/9' }}>
            {/* 動画ソースはプログラムで設定されます */}
        </video>
    );
};
