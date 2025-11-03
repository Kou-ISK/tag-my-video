import { useState, useEffect, useRef } from 'react';
import { TimelineData } from '../types/TimelineData';
import { VideoSyncData } from '../types/VideoSync';
import { ulid } from 'ulid';
import videojs from 'video.js';

export const useVideoPlayerApp = () => {
  const isDev = process.env.NODE_ENV === 'development';
  const [timeline, setTimeline] = useState<TimelineData[]>([]);
  const [selectedTimelineIdList, setSelectedTimelineIdList] = useState<
    string[]
  >([]);
  const [videoList, setVideoList] = useState<string[]>([]); // 空の配列に修正
  const [currentTime, setCurrentTime] = useState(0);
  const [timelineFilePath, setTimelineFilePath] = useState<string>('');
  const [metaDataConfigFilePath, setMetaDataConfigFilePath] =
    useState<string>('');

  const [teamNames, setTeamNames] = useState<string[]>([]);

  const [isFileSelected, setIsFileSelected] = useState(false);

  const [maxSec, setMaxSec] = useState(0);

  const [isVideoPlaying, setisVideoPlayingInternal] = useState<boolean>(false);

  // エラーハンドリング用ステート
  const [error, setError] = useState<{
    type: 'file' | 'network' | 'sync' | 'playback' | 'general';
    message: string;
  } | null>(null);

  // デバッグ用: setisVideoPlayingの呼び出しを追跡
  const setisVideoPlaying = (value: boolean | ((prev: boolean) => boolean)) => {
    const newValue =
      typeof value === 'function' ? value(isVideoPlaying) : value;
    if (isDev) {
      console.log(`[DEBUG] setisVideoPlaying called:`, {
        from: isVideoPlaying,
        to: newValue,
        timestamp: new Date().toISOString(),
      });
    }
    setisVideoPlayingInternal(newValue);
  };
  const [videoPlayBackRate, setVideoPlayBackRate] = useState(1);
  const [syncData, setSyncData] = useState<VideoSyncData | undefined>(
    undefined,
  );
  const [syncMode, setSyncMode] = useState<'auto' | 'manual'>('auto');
  const [playerForceUpdateKey, setPlayerForceUpdateKey] = useState(0);
  const timelineLoadedRef = useRef(false);
  const timelinePersistedSnapshotRef = useRef<string>('[]');

  // 音声同期分析中の状態管理
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStage, setSyncStage] = useState('');

  // 異常なcurrentTime値の監視(警告のみ、リセットしない)
  const prevCurrentTimeRef = useRef<number>(0);
  useEffect(() => {
    if (currentTime > 7200 && prevCurrentTimeRef.current !== currentTime) {
      // 2時間を超える場合は警告のみ
      console.warn(
        `[WARNING] currentTimeが異常に高い値 (${currentTime}秒、上限=7200秒) です。`,
      );
      // リセット処理は削除 - ユーザーの操作を尊重
    }
    prevCurrentTimeRef.current = currentTime; // 値を記憶
  }, [currentTime]);

  useEffect(() => {
    timelineLoadedRef.current = false;
    timelinePersistedSnapshotRef.current = '[]';

    if (!timelineFilePath) {
      setTimeline([]);
      timelineLoadedRef.current = true;
      return;
    }

    let cancelled = false;
    const loadTimeline = async () => {
      try {
        const response = await fetch(timelineFilePath);
        if (!response.ok) {
          throw new Error(
            `Failed to load timeline file: ${response.status} ${response.statusText}`,
          );
        }
        const raw = await response.json();
        if (cancelled) return;
        const normalized = Array.isArray(raw) ? raw : [];
        timelinePersistedSnapshotRef.current = JSON.stringify(normalized);
        timelineLoadedRef.current = true;
        setTimeline(normalized);
      } catch (error) {
        if (cancelled) return;
        console.error('タイムラインの読み込みに失敗しました:', error);
        timelinePersistedSnapshotRef.current = '[]';
        timelineLoadedRef.current = true;
        setTimeline([]);
      }
    };

    void loadTimeline();

    return () => {
      cancelled = true;
    };
  }, [timelineFilePath]);

  const handleCurrentTime = (
    event: React.SyntheticEvent | Event,
    newValue: number | number[],
  ) => {
    const time = newValue as number;

    // シーク開始を通知（SyncedVideoPlayerがtimeupdateを一時無視）
    const seekStartEvent = new CustomEvent('video-seek-start', {
      detail: { time },
    });
    window.dispatchEvent(seekStartEvent);

    // 负のオフセット時はグローバル時間の下限を拡張
    const minAllowed =
      syncData &&
      syncData.isAnalyzed &&
      typeof syncData.syncOffset === 'number' &&
      syncData.syncOffset < 0
        ? syncData.syncOffset
        : 0;

    if (!isNaN(time) && time >= minAllowed) {
      const timeClamped = Math.max(time, minAllowed);
      setCurrentTime(timeClamped);

      // シーク操作時に全ての動画を即座に同期
      setTimeout(() => {
        videoList.forEach((_, index) => {
          try {
            type VjsNamespace = {
              getPlayer?: (id: string) =>
                | {
                    el?: () => Element | null;
                    isDisposed?: () => boolean;
                    error?: () => unknown;
                    duration?: () => number | undefined;
                    currentTime?: (time?: number) => number | undefined;
                  }
                | undefined;
            };
            const ns = videojs as unknown as VjsNamespace;
            const player = ns.getPlayer?.(`video_${index}`);
            if (
              player &&
              player.el?.() &&
              player.isDisposed?.() !== true &&
              !player.error?.()
            ) {
              // プレイヤーの状態をチェック
              let duration = 0;
              try {
                const dur = player.duration?.();
                duration = typeof dur === 'number' && !isNaN(dur) ? dur : 0;
              } catch (durationError) {
                duration = 0;
              }

              if (
                typeof duration === 'number' &&
                !isNaN(duration) &&
                duration > 0
              ) {
                let targetTime = timeClamped;

                // 0番プレイヤーは負の時間にシークしない
                if (index === 0) {
                  targetTime = Math.max(0, timeClamped);
                }

                // 2番目以降の動画には同期オフセットを適用
                if (index > 0 && syncData?.isAnalyzed) {
                  const offset = syncData.syncOffset || 0;
                  targetTime = Math.max(0, timeClamped - offset);
                }

                if (isDev) {
                  console.log(
                    `シーク: Video ${index}の時刻を${targetTime}秒に設定 (global=${timeClamped}, offset=${
                      syncData?.syncOffset ?? 0
                    })`,
                  );
                }

                // より安全なシーク処理
                try {
                  player.currentTime?.(targetTime);
                } catch (seekError) {
                  console.debug(
                    `プレイヤー${index}のシークでエラー:`,
                    seekError,
                  );
                }
              }
            }
          } catch (error) {
            console.debug(`プレイヤー${index}のシークでエラー:`, error);
          }
        });

        // シーク完了を通知（500ms後にSyncedVideoPlayerがtimeupdateを再開）
        // Video.jsのtimeupdateイベントが落ち着くまで待つ
        setTimeout(() => {
          const seekEndEvent = new CustomEvent('video-seek-end');
          window.dispatchEvent(seekEndEvent);
        }, 500);
      }, 50); // 短いディレイで即座に反映
    } else {
      console.warn('無効な時間値が設定されようとしました:', time);
      setCurrentTime(minAllowed);
    }
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
    setTimeline((prev) => [...prev, newTimelineInstance]);
  };

  const deleteTimelineDatas = (idList: string[]) => {
    setTimeline((prev) => prev.filter((item) => !idList.includes(item.id)));
  };

  const updateQualifier = (id: string, qualifier: string) => {
    setTimeline((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qualifier } : item)),
    );
  };

  const updateActionResult = (id: string, actionResult: string) => {
    setTimeline((prev) =>
      prev.map((item) => (item.id === id ? { ...item, actionResult } : item)),
    );
  };

  const updateActionType = (id: string, actionType: string) => {
    setTimeline((prev) =>
      prev.map((item) => (item.id === id ? { ...item, actionType } : item)),
    );
  };

  const updateTimelineRange = (
    id: string,
    startTime: number,
    endTime: number,
  ) => {
    const normalizedStart = Number.isFinite(startTime)
      ? Math.max(0, startTime)
      : 0;
    const normalizedEnd = Number.isFinite(endTime)
      ? Math.max(normalizedStart, endTime)
      : normalizedStart;

    setTimeline((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              startTime: normalizedStart,
              endTime: Math.max(normalizedStart, normalizedEnd),
            }
          : item,
      ),
    );
  };

  const getSelectedTimelineId = (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string,
  ) => {
    setSelectedTimelineIdList((prev) => {
      if (event.target.checked) {
        return prev.includes(id) ? prev : [...prev, id];
      }
      return prev.filter((item) => item !== id);
    });
  };

  const sortTimelineDatas = (column: string, sortDesc: boolean) => {
    setTimeline((prev) => {
      const direction = sortDesc ? -1 : 1;
      const sorted = [...prev].sort((a, b) => {
        if (column === 'startTime') {
          return a.startTime === b.startTime
            ? 0
            : a.startTime > b.startTime
            ? direction
            : -direction;
        }
        if (column === 'endTime') {
          return a.endTime === b.endTime
            ? 0
            : a.endTime > b.endTime
            ? direction
            : -direction;
        }
        if (column === 'actionName') {
          return (
            a.actionName.localeCompare(b.actionName, undefined, {
              sensitivity: 'base',
            }) * direction
          );
        }
        return 0;
      });
      return sorted;
    });
  };

  const saveTimerRef = useRef<number | null>(null);
  useEffect(() => {
    if (
      !timelineFilePath ||
      !window?.electronAPI?.exportTimeline ||
      typeof window.electronAPI.exportTimeline !== 'function' ||
      !timelineLoadedRef.current
    ) {
      return;
    }

    const nextSnapshot = JSON.stringify(timeline);
    if (nextSnapshot === timelinePersistedSnapshotRef.current) {
      return;
    }

    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
    }

    const payload = timeline.map((item) => ({ ...item }));

    saveTimerRef.current = window.setTimeout(() => {
      window.electronAPI
        ?.exportTimeline(timelineFilePath, payload)
        .then(() => {
          timelinePersistedSnapshotRef.current = nextSnapshot;
        })
        .catch((error: unknown) => {
          console.error('Failed to export timeline:', error);
        })
        .finally(() => {
          saveTimerRef.current = null;
        });
    }, 300);

    return () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
    };
  }, [timeline, timelineFilePath]);

  // 音声同期機能
  const resyncAudio = async () => {
    if (videoList.length < 2) {
      console.warn('2つの映像が必要です');
      return;
    }

    setIsAnalyzing(true);
    setSyncProgress(0);
    setSyncStage('');

    try {
      const { AudioSyncAnalyzer } = await import('../utils/AudioSyncAnalyzer');
      const analyzer = new AudioSyncAnalyzer();

      console.log('音声同期を再実行中...');
      const result = await analyzer.quickSyncAnalysis(
        videoList[0],
        videoList[1],
        (stage: string, progress: number) => {
          setSyncStage(stage);
          setSyncProgress(progress);
        },
      );

      const newSyncData: VideoSyncData = {
        syncOffset: result.offsetSeconds,
        isAnalyzed: true,
        confidenceScore: result.confidence,
      };

      console.log('[resyncAudio] Setting new syncData:', newSyncData);
      setSyncData(newSyncData);
      setSyncProgress(100);
      console.log('音声同期完了:', result);

      // 同期後に映像プレイヤーを強制更新
      console.log('[resyncAudio] Calling forceUpdateVideoPlayers...');
      await forceUpdateVideoPlayers(newSyncData);
      console.log('[resyncAudio] forceUpdateVideoPlayers completed');
    } catch (error) {
      console.error('音声同期エラー:', error);
      setError({
        type: 'sync',
        message:
          '音声同期に失敗しました。映像ファイルに音声が含まれているか確認してください。',
      });
    } finally {
      setIsAnalyzing(false);
      setSyncProgress(0);
      setSyncStage('');
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

  // 手動同期: 現在の各プレイヤーの時刻からオフセットを計算して適用
  const manualSyncFromPlayers = async () => {
    try {
      type VjsLite = {
        getPlayer?: (id: string) => { currentTime?: () => number } | undefined;
      };
      const vjs = videojs as unknown as VjsLite;
      const p0 = vjs.getPlayer?.('video_0');
      const p1 = vjs.getPlayer?.('video_1');

      let t0 = 0;
      let t1 = 0;
      try {
        t0 = p0?.currentTime?.() ?? 0;
      } catch {
        t0 = 0;
      }
      try {
        t1 = p1?.currentTime?.() ?? 0;
      } catch {
        t1 = 0;
      }

      if (typeof t0 !== 'number' || typeof t1 !== 'number') {
        console.warn('manualSync: invalid current times', { t0, t1 });
        return;
      }

      const newOffset = t0 - t1;
      const newSyncData: VideoSyncData = {
        syncOffset: newOffset,
        isAnalyzed: true,
        confidenceScore: undefined,
      };

      setSyncData(newSyncData);
      console.log('manualSync: オフセット更新', { t0, t1, newOffset });

      if (metaDataConfigFilePath && window.electronAPI?.saveSyncData) {
        try {
          await window.electronAPI.saveSyncData(
            metaDataConfigFilePath,
            newSyncData,
          );
        } catch (e) {
          console.debug('manualSync saveSyncData error', e);
        }
      }

      // プレイヤーへ即時反映
      await forceUpdateVideoPlayers(newSyncData);

      // 手動同期が完了したら個別シークを無効化（自動モードへ戻す）
      try {
        setSyncMode('auto');
        if (window.electronAPI?.setManualModeChecked) {
          await window.electronAPI.setManualModeChecked(false);
        }
      } catch {
        /* ignore */
      }
    } catch (e) {
      console.error('manualSyncFromPlayers error', e);
    }
  };

  // 映像プレイヤーを強制更新する関数
  const forceUpdateVideoPlayers = async (
    newSyncData: VideoSyncData,
  ): Promise<void> => {
    return new Promise((resolve) => {
      // プレイヤーを一時停止（RAFを停止）
      setisVideoPlaying(false);

      // RAF停止後に処理を実行
      requestAnimationFrame(() => {
        // Video.jsプレイヤーをリセット
        try {
          const vjsGlobal = videojs as unknown as {
            getPlayer?: (id: string) => {
              currentTime?: (time?: number) => number | void;
              pause?: () => void;
            };
          };

          // video_0から現在の再生位置を取得
          const primaryPlayer = vjsGlobal.getPlayer?.('video_0');
          const currentGlobalTime =
            (primaryPlayer?.currentTime?.() as number) || 0;

          console.log(
            `[forceUpdate] 現在のグローバル時刻: ${currentGlobalTime}秒`,
          );

          videoList.forEach((_, index) => {
            try {
              const player = vjsGlobal.getPlayer?.(`video_${index}`);
              if (player) {
                const offset =
                  index > 0 && newSyncData?.isAnalyzed
                    ? newSyncData.syncOffset || 0
                    : 0;
                const targetTime = Math.max(
                  0,
                  currentGlobalTime - (index > 0 ? offset : 0),
                );

                player.pause?.();
                player.currentTime?.(targetTime);
                console.log(
                  `[forceUpdate] video_${index} synced to ${targetTime}秒 (global=${currentGlobalTime}, offset=${offset})`,
                );
              }
            } catch (e) {
              console.debug(`プレイヤー${index}の更新エラー:`, e);
            }
          });
        } catch (e) {
          console.debug('forceUpdateVideoPlayers エラー:', e);
        }

        // forceUpdateKeyを更新して、SyncedVideoPlayerのprimaryClockをリセット
        setPlayerForceUpdateKey((prev) => {
          const newKey = prev + 1;
          console.log(
            `[forceUpdate] playerForceUpdateKey updated to ${newKey}`,
          );
          return newKey;
        });

        // Video.jsのcurrentTime()更新が完了するまで待機してから再生を再開
        // Video.jsは内部的に非同期でシーク処理を行うため、十分な時間を確保
        setTimeout(() => {
          console.log('[forceUpdate] resuming playback');
          setisVideoPlaying(true);
          resolve();
        }, 300);
      });
    });
  };

  // syncDataが更新されたら永続化(config.json に保存)
  useEffect(() => {
    (async () => {
      try {
        if (
          metaDataConfigFilePath &&
          window.electronAPI &&
          typeof window.electronAPI.saveSyncData === 'function' &&
          syncData
        ) {
          console.log('[useVideoPlayerApp] Saving syncData to metadata.json:', {
            path: metaDataConfigFilePath,
            syncData,
          });
          await window.electronAPI.saveSyncData(
            metaDataConfigFilePath,
            syncData,
          );
          console.log('[useVideoPlayerApp] syncData saved successfully');
        }
      } catch (e) {
        console.error('[useVideoPlayerApp] saveSyncData failed', e);
      }
    })();
  }, [syncData, metaDataConfigFilePath]);

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
    syncMode,
    setSyncMode,
    handleCurrentTime,
    packagePath,
    setPackagePath,
    addTimelineData,
    deleteTimelineDatas,
    updateQualifier,
    updateActionResult,
    updateActionType,
    updateTimelineRange,
    getSelectedTimelineId,
    sortTimelineDatas,
    resyncAudio,
    resetSync,
    adjustSyncOffset,
    manualSyncFromPlayers,
    playerForceUpdateKey,
    error,
    setError,
    isAnalyzing,
    syncProgress,
    syncStage,
  };
};
