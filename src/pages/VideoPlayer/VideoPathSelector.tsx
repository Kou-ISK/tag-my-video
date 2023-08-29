import { Box, Button, Input } from "@mui/material"
import { useState } from "react";

export const VideoPathSelector = ({ setVideoList, setIsFileSelected, isFileSelected, timelineFilePath, setTimelineFilePath, setPackagePath }: { setVideoList: any, setIsFileSelected: any, isFileSelected: boolean, timelineFilePath: string | undefined, setTimelineFilePath: any, setPackagePath: any }) => {
    // TODO パス選択用コンポーネントを作成

    const [tightViewVideoPath, setTightViewVideoPath] = useState<string>();
    const [wideViewVideoPath, setWideViewVideoPath] = useState<string>();

    // パッケージを選択した場合
    const setVideoPathByPackagePath = async () => {
        try {
            const packagePath = await window.electronAPI.openDirectory();
            if (packagePath) {
                setTimelineFilePath(packagePath + '/timeline.json')
                const fileName = packagePath.substring(packagePath.lastIndexOf('/') + 1);
                setVideoList([packagePath + '/' + fileName + ' 寄り.mp4', packagePath + '/' + fileName + ' 引き.mp4']);
                setPackagePath(packagePath);
                setIsFileSelected(!isFileSelected)
                console.log('Selected file:', packagePath);
            } else {
                console.log('No file selected.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const createPackage = () => {
        // TODO パッケージを作成する処理を追加する。
    }

    return (
        <>
            <Box display={"flex"} flexDirection={"column"}>
                <Button onClick={setVideoPathByPackagePath} variant="contained">ビデオパッケージを選択</Button>
                <Button>新規パッケージ</Button>
            </Box>
        </>
    )
}