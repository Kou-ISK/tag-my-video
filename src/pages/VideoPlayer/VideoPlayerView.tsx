export const VideoPlayerView = ({ id, filePath }: { id: string, filePath: string }) => {

    return (
        <div>
            <video
                id={id}
                className="video-js"
                controls
                preload="auto"
                width="800"
                height="450"
                data-setup="{}"
                autoPlay={true}
            >
                <source src={filePath} type="video/mp4" />
            </video>
        </div>
    );
};
