import { VideoPlayerView } from "./VideoPlayerView";
import { Box } from "@mui/material";

export const VideoPlayerApp = () => {
    const videoList = [
        '/Users/isakakou/Desktop/MAH00240.MP4',
        '/Users/isakakou/Desktop/MAH00122.MP4'
    ];

    return (
        <>
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                {videoList.map((filePath, index) => (
                    <VideoPlayerView id={'video' + index.toString()} filePath={filePath} />
                ))}
            </Box>
        </>
    );
};
