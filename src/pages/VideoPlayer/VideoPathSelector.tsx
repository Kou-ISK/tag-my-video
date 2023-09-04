import { Box, Button, Input } from "@mui/material"
import { useState } from "react";
import { PackageDatas } from "../../renderer";
import { MetaData } from "../../types/MetaData";

export const VideoPathSelector = ({ setVideoList, setIsFileSelected, isFileSelected, timelineFilePath, setTimelineFilePath, setPackagePath, setMetaDataConfigFilePath }: { setVideoList: any, setIsFileSelected: any, isFileSelected: boolean, timelineFilePath: string | undefined, setTimelineFilePath: any, setPackagePath: any, setMetaDataConfigFilePath: any }) => {
    // TODO パス選択用コンポーネントを作成
    const [hasOpenModal, setHasOpenModal] = useState<boolean>(false);
    const [packageName, setPackageName] = useState<string>('');
    const [team1Name, setTeam1Name] = useState<string>('');
    const [team2Name, setTeam2Name] = useState<string>('');

    // パッケージを選択した場合
    const setVideoPathByPackagePath = async () => {
        try {
            const packagePath = await window.electronAPI.openDirectory();
            if (packagePath) {
                setTimelineFilePath(packagePath + '/timeline.json')
                const fileName = packagePath.substring(packagePath.lastIndexOf('/') + 1);
                setVideoList([packagePath + '/videos/' + fileName + ' 寄り.mp4', packagePath + '/videos/' + fileName + ' 引き.mp4']);
                setPackagePath(packagePath);
                setIsFileSelected(!isFileSelected);
                setMetaDataConfigFilePath(packagePath + '/.metadata/config.json');
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
        const tightViewPath: string = await window.electronAPI.openFile();
        const wideViewPath: string = await window.electronAPI.openFile();
        const metaDataConfig: MetaData = {
            team1Name: team1Name,
            team2Name: team2Name
        }
        const packageDatas: PackageDatas = await window.electronAPI.createPackage(directoryName, packageName, tightViewPath, wideViewPath, metaDataConfig);
        setVideoList([packageDatas.tightViewPath, packageDatas.wideViewPath]);
        setTimelineFilePath(packageDatas.timelinePath);
        setHasOpenModal(!hasOpenModal)
        setIsFileSelected(!isFileSelected)
        setMetaDataConfigFilePath(packageDatas.metaDataConfigFilePath)
    }

    return (
        <>
            <Box display={"flex"} flexDirection={"column"}>
                <Button onClick={setVideoPathByPackagePath} variant="contained">ビデオパッケージを選択</Button>
                <Button onClick={() => setHasOpenModal(!hasOpenModal)}>新規パッケージ</Button>
            </Box>
            {hasOpenModal && <Box>
                <div>
                    <label htmlFor="packageName">パッケージ名</label>
                    <Input id='packageName' value={packageName} onChange={(e) => setPackageName(e.currentTarget.value)} />
                </div>
                <div>
                    <label htmlFor="team1Name">チーム名(1)</label>
                    <Input id='team1Name' value={team1Name} onChange={(e) => setTeam1Name(e.currentTarget.value)}></Input>
                </div>
                <div>
                    <label htmlFor="team2Name">チーム名(2)</label>
                    <Input id='team2Name' value={team2Name} onChange={(e) => setTeam2Name(e.currentTarget.value)}></Input>
                </div>
                <Button variant='contained' onClick={() => createPackage(packageName)}>作成</Button>
            </Box>}
        </>
    )
}