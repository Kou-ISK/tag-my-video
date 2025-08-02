import { useState } from 'react';
import { TimelineData } from '../types/TimelineData';
import { VideoSyncData } from '../types/VideoSync';
import { ulid } from 'ulid';

export const useVideoPlayerApp = () => {
  const [timeline, setTimeline] = useState<TimelineData[]>([]);
  const [selectedTimelineIdList, setSelectedTimelineIdList] = useState<
    string[]
  >([]);
  const [videoList, setVideoList] = useState<string[]>(['']);
  const [currentTime, setCurrentTime] = useState(0);
  const [timelineFilePath, setTimelineFilePath] = useState<string>('');
  const [metaDataConfigFilePath, setMetaDataConfigFilePath] =
    useState<string>('');

  const [teamNames, setTeamNames] = useState<string[]>([]);

  const [isFileSelected, setIsFileSelected] = useState(false);

  const [maxSec, setMaxSec] = useState(0);

  const [isVideoPlaying, setisVideoPlaying] = useState<boolean>(false);
  const [videoPlayBackRate, setVideoPlayBackRate] = useState(1);
  const [syncData, setSyncData] = useState<VideoSyncData | undefined>(
    undefined,
  );

  const handleCurrentTime = (event: Event, newValue: number | number[]) => {
    setCurrentTime(newValue as number);
  };
  const [packagePath, setPackagePath] = useState<string>('');

  const addTimelineData = (
    actionName: string,
    startTime: number,
    endTime: number,
    qualifier: string,
  ) => {
    const newTimelineInstance: TimelineData = {
      id: ulid(),
      actionName,
      startTime,
      endTime,
      actionResult: '',
      actionType: '',
      qualifier,
    };
    setTimeline([...timeline, newTimelineInstance]);
  };

  const deleteTimelineDatas = (idList: string[]) => {
    const newTimeline = timeline.filter((item) => !idList.includes(item.id));
    setTimeline(newTimeline);
  };

  const updateQualifier = (id: string, qualifier: string) => {
    const updatedTimeline = timeline.map((item) =>
      item.id === id ? { ...item, qualifier } : item,
    );
    setTimeline(updatedTimeline);
  };

  const updateActionResult = (id: string, actionResult: string) => {
    const updatedTimeline = timeline.map((item) =>
      item.id === id ? { ...item, actionResult } : item,
    );
    setTimeline(updatedTimeline);
  };

  const updateActionType = (id: string, actionType: string) => {
    const updatedTimeline = timeline.map((item) =>
      item.id === id ? { ...item, actionType } : item,
    );
    setTimeline(updatedTimeline);
  };

  const getSelectedTimelineId = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string,
  ) => {
    if (event.target.checked) {
      setSelectedTimelineIdList([...selectedTimelineIdList, id]);
    } else {
      const newSelectedTimelineIdList = selectedTimelineIdList.filter(
        (item) => item !== id,
      );
      setSelectedTimelineIdList(newSelectedTimelineIdList);
    }
  };

  const sortTimelineDatas = (column: string, sortDesc: boolean) => {
    if (sortDesc) {
      if (column === 'startTime') {
        setTimeline(
          timeline.sort((a, b) => (a.startTime > b.startTime ? -1 : 1)),
        );
      } else if (column === 'endTime') {
        setTimeline(timeline.sort((a, b) => (a.endTime > b.endTime ? -1 : 1)));
      } else if (column === 'actionName') {
        setTimeline(
          timeline.sort((a, b) => (a.actionName > b.actionName ? -1 : 1)),
        );
      }
    } else if (sortDesc === false) {
      console.log('asc');
      if (column === 'startTime') {
        setTimeline(
          timeline.sort((a, b) => (a.startTime < b.startTime ? -1 : 1)),
        );
      } else if (column === 'endTime') {
        setTimeline(timeline.sort((a, b) => (a.endTime < b.endTime ? -1 : 1)));
      } else if (column === 'actionName') {
        setTimeline(
          timeline.sort((a, b) => (a.actionName < b.actionName ? -1 : 1)),
        );
      }
    }
  };

  // 音声同期機能
  const resyncAudio = async () => {
    if (videoList.length < 2) {
      console.warn('2つの映像が必要です');
      return;
    }

    try {
      const { AudioSyncAnalyzer } = await import('../utils/AudioSyncAnalyzer');
      const analyzer = new AudioSyncAnalyzer();

      console.log('音声同期を再実行中...');
      const result = await analyzer.quickSyncAnalysis(
        videoList[0],
        videoList[1],
      );

      const newSyncData: VideoSyncData = {
        syncOffset: result.offsetSeconds,
        isAnalyzed: true,
        confidenceScore: result.confidence,
      };

      setSyncData(newSyncData);
      console.log('音声同期完了:', result);

      // 同期後に映像プレイヤーを強制更新
      await forceUpdateVideoPlayers(newSyncData);
    } catch (error) {
      console.error('音声同期エラー:', error);
    }
  };

  const resetSync = () => {
    const resetSyncData = {
      syncOffset: 0,
      isAnalyzed: false,
      confidenceScore: 0,
    };
    setSyncData(resetSyncData);
    console.log('同期をリセットしました');

    // 同期リセット後に映像プレイヤーを強制更新
    forceUpdateVideoPlayers(resetSyncData);
  };

  const adjustSyncOffset = async () => {
    if (!syncData) return;

    const newOffset = prompt(
      '同期オフセットを入力してください（秒）:',
      syncData.syncOffset.toString(),
    );
    if (newOffset !== null && !isNaN(Number(newOffset))) {
      const adjustedSyncData = {
        ...syncData,
        syncOffset: Number(newOffset),
        isAnalyzed: true,
      };
      setSyncData(adjustedSyncData);
      console.log('同期オフセットを調整しました:', Number(newOffset));

      // オフセット調整後に映像プレイヤーを強制更新
      await forceUpdateVideoPlayers(adjustedSyncData);
    }
  };

  // 映像プレイヤーを強制更新する関数
  const forceUpdateVideoPlayers = async (
    newSyncData: VideoSyncData,
  ): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        videoList.forEach((_, index) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const player = (window as any).videojs(`video_${index}`);
          if (player && index > 0 && newSyncData.isAnalyzed) {
            const adjustedTime = Math.max(
              0,
              currentTime - newSyncData.syncOffset,
            );
            console.log(
              `強制更新: Video ${index}の時刻を${adjustedTime}秒に設定`,
            );
            player.currentTime(adjustedTime);
          }
        });
        resolve();
      }, 200); // プレイヤーの更新を待つ
    });
  };

  return {
    timeline,
    setTimeline,
    selectedTimelineIdList,
    setSelectedTimelineIdList,
    videoList,
    setVideoList,
    currentTime,
    setCurrentTime,
    timelineFilePath,
    setTimelineFilePath,
    metaDataConfigFilePath,
    setMetaDataConfigFilePath,
    teamNames,
    setTeamNames,
    isFileSelected,
    setIsFileSelected,
    maxSec,
    setMaxSec,
    isVideoPlaying,
    setisVideoPlaying,
    videoPlayBackRate,
    setVideoPlayBackRate,
    syncData,
    setSyncData,
    handleCurrentTime,
    packagePath,
    setPackagePath,
    addTimelineData,
    deleteTimelineDatas,
    updateQualifier,
    updateActionResult,
    updateActionType,
    getSelectedTimelineId,
    sortTimelineDatas,
    resyncAudio,
    resetSync,
    adjustSyncOffset,
  };
};
