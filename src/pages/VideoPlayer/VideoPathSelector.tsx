import { Box, Button, Input } from "@mui/material"
import { useState } from "react";

export const VideoPathSelector = ({ setVideoList, setIsFileSelected, isFileSelected, timelineFilePath, setTimelineFilePath, setPackagePath }: { setVideoList: any, setIsFileSelected: any, isFileSelected: boolean, timelineFilePath: string | undefined, setTimelineFilePath: any, setPackagePath: any }) => {
    // TODO パス選択用コンポーネントを作成
    const [hasOpenModal, setHasOpenModal] = useState<boolean>(false);
    const [packageName, setPackageName] = useState<string>('');

    // パッケージを選択した場合
    const setVideoPathByPackagePath = async () => {
        try {
            const packagePath = await window.electronAPI.openDirectory();
            if (packagePath) {
                setTimelineFilePath(packagePath + '/timeline.json')
                const fileName = packagePath.substring(packagePath.lastIndexOf('/') + 1);
                setVideoList([packagePath + '/videos/' + fileName + ' 寄り.mp4', packagePath + '/videos/' + fileName + ' 引き.mp4']);
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

    // TODO ファイル選択完了後に映像再生画面に遷移するようにする
    // ファイル選択後にチーム名を選択し、.metadata/config.jsonに書き込む
    const createPackage = async (packageName: string) => {
        const directoryName = await window.electronAPI.openDirectory();
        const tightViewPath = await window.electronAPI.openFile();
        const wideViewPath = await window.electronAPI.openFile();
        const packageDatas = window.electronAPI.createPackage(directoryName, packageName, tightViewPath, wideViewPath)
        setVideoList([(await packageDatas).tightViewPath, (await packageDatas).wideViewPath]);
        setTimelineFilePath((await packageDatas).timelinePath);
        setHasOpenModal(!hasOpenModal)
        setIsFileSelected(!isFileSelected)
    }

    return (
        <>
            <Box display={"flex"} flexDirection={"column"}>
                <Button onClick={setVideoPathByPackagePath} variant="contained">ビデオパッケージを選択</Button>
                <Button onClick={() => setHasOpenModal(!hasOpenModal)}>新規パッケージ</Button>
            </Box>
            {hasOpenModal && <Box>
                <Input value={packageName} onChange={(e) => setPackageName(e.currentTarget.value)} />
                <Button variant='contained' onClick={() => createPackage(packageName)}>作成</Button>
            </Box>}
        </>
    )
}