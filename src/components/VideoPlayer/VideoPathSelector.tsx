import { Box, Button, Input } from "@mui/material"
import { useState } from "react";
import { PackageDatas } from "../../renderer";
import { MetaData } from "../../types/MetaData";

interface VideoPathSelectorProps {
    setVideoList: any,
    setIsFileSelected: any,
    isFileSelected: boolean,
    setTimelineFilePath: any,
    setPackagePath: any,
    setMetaDataConfigFilePath: any
}

export const VideoPathSelector = ({ setVideoList, setIsFileSelected, isFileSelected, setTimelineFilePath, setPackagePath, setMetaDataConfigFilePath }: VideoPathSelectorProps) => {
    const [hasOpenModal, setHasOpenModal] = useState<boolean>(false);
    const [packageName, setPackageName] = useState<string>('');
    const [team1Name, setTeam1Name] = useState<string>('');
    const [team2Name, setTeam2Name] = useState<string>('');

    const handleHasOpenModal = () => {
        setHasOpenModal(true);
    }

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

    // ファイル選択後にチーム名を選択し、.metadata/config.jsonに書き込む
    const createPackage = async (packageName: string) => {
        const directoryName = await window.electronAPI.openDirectory();
        const tightViewPath: string = await window.electronAPI.openFile();
        const wideViewPath: string = await window.electronAPI.openFile();
        const metaDataConfig: MetaData = {
            team1Name: team1Name,
            team2Name: team2Name,
            actionList: ["ポゼッション", "スクラム", "ラインアウト", "キック", "タックル", "PK", "FK", "Check", "キックオフ", "トライ", "ショット"]
        }
        const packageDatas: PackageDatas = await window.electronAPI.createPackage(directoryName, packageName, tightViewPath, wideViewPath, metaDataConfig);
        setVideoList([packageDatas.tightViewPath, packageDatas.wideViewPath]);
        setTimelineFilePath(packageDatas.timelinePath);
        setHasOpenModal(!hasOpenModal)
        setIsFileSelected(!isFileSelected)
        setMetaDataConfigFilePath(packageDatas.metaDataConfigFilePath)
    }

    return (
        <div style={{ marginLeft: "20vw", marginRight: "20vw" }}>
            <Box display={"flex"} flexDirection={"column"}>
                <Button sx={{ height: "200px", fontsize: "200px", margin: "20px" }} onClick={setVideoPathByPackagePath} variant="contained">ビデオパッケージを選択</Button>
                <Button sx={{ height: "200px", fontsize: "200px", margin: "20px" }} onClick={handleHasOpenModal} variant="outlined">新規パッケージ</Button>
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
        </div>
    )
}