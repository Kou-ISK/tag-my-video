import { Box, Button, Input } from "@mui/material"
import { useState } from "react";

export const VideoPathSelector = ({ videoList, setVideoList, setIsFileSelected, isFileSelected }: { videoList: string[], setVideoList: any, setIsFileSelected: any, isFileSelected: boolean }) => {
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
                <Button onClick={handleVideoList}>設定する</Button>
            </Box>
        </>
    )
}