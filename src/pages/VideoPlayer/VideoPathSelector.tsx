import { Box, Button, Input } from "@mui/material"
import { useState } from "react";

export const VideoPathSelector = ({ setVideoList, setIsFileSelected, isFileSelected, timelineFilePath, setTimelineFilePath }: { setVideoList: any, setIsFileSelected: any, isFileSelected: boolean, timelineFilePath: string, setTimelineFilePath: any }) => {
    // TODO パス選択用コンポーネントを作成

    const [tightViewVideoPath, setTightViewVideoPath] = useState<string>();
    const [wideViewVideoPath, setWideViewVideoPath] = useState<string>();

    const handleVideoList = () => {
        setVideoList([tightViewVideoPath, wideViewVideoPath]);
        setIsFileSelected(!isFileSelected)
    }

    return (
        <>
            <Box display={"flex"} flexDirection={"column"}>
                <h1>ビデオファイルパスを指定してください</h1>
                <label htmlFor="tight-view">Tight View</label><Input value={tightViewVideoPath} onChange={(e) => setTightViewVideoPath(e.currentTarget.value)} id='tight-view' />
                <label htmlFor="wide-view">Wide View</label><Input value={wideViewVideoPath} onChange={(e) => setWideViewVideoPath(e.currentTarget.value)} id='wide-view' />
                <label htmlFor="timeline">Timeline</label><Input value={timelineFilePath} onChange={(e) => setTimelineFilePath(e.currentTarget.value)} id='timeline' />
                <Button onClick={handleVideoList}>設定する</Button>
            </Box>
        </>
    )
}