import {
  Box,
  Button,
  Slider,
  Typography,
  TextField,
  Stack,
} from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import videojs from 'video.js';
import { VideoSyncData } from '../../types/VideoSync';

interface VideoControllerProps {
  setIsVideoPlaying: Dispatch<SetStateAction<boolean>>;
  isVideoPlaying: boolean;
  setVideoPlayBackRate: Dispatch<SetStateAction<number>>;
  setCurrentTime: Dispatch<SetStateAction<number>>;
  handleCurrentTime: (
    event: React.SyntheticEvent | Event,
    newValue: number | number[],
  ) => void;
  maxSec: number;
  videoList: string[];
  syncData?: VideoSyncData;
  resyncAudio?: () => void;
  resetSync?: () => void;
  adjustSyncOffset?: () => void;
}

export const VideoController = ({
  setIsVideoPlaying,
  isVideoPlaying,
  setVideoPlayBackRate,
  setCurrentTime,
  handleCurrentTime,
  maxSec,
  videoList,
  syncData,
  resyncAudio,
  resetSync,
  adjustSyncOffset,
}: VideoControllerProps) => {
  const [videoTime, setVideoTime] = useState<number>(0); // Sliderで表示される映像の再生時間を管理
  const [offsetLocal, setOffsetLocal] = useState<number>(
    syncData?.syncOffset || 0,
  );

  useEffect(() => {
    // syncDataが更新されたら表示用のローカルオフセットも更新
    if (typeof syncData?.syncOffset === 'number') {
      setOffsetLocal(syncData.syncOffset);
    }
  }, [syncData?.syncOffset]);

  // videoTimeがNaNになった場合の修正
  useEffect(() => {
    if (isNaN(videoTime)) {
      console.warn('videoTimeがNaNになっています。0にリセットします。');
      setVideoTime(0);
    }
  }, [videoTime]);

  // 既存のVideo.jsプレイヤー取得（新規作成はしない）
  type VjsPlayer = {
    isDisposed?: () => boolean;
    readyState?: () => number;
    play?: () => Promise<void> | void;
    pause?: () => void;
    on?: (event: string, handler: () => void) => void;
    off?: (event: string, handler: () => void) => void;
    muted?: (val: boolean) => void;
    ready?: (cb: () => void) => void;
    currentTime?: () => number;
    duration?: () => number;
  };
  type VjsNamespace = {
    (el: string): VjsPlayer | undefined;
    getPlayer?: (id: string) => VjsPlayer | undefined;
  };
  const getExistingPlayer = (id: string): VjsPlayer | undefined => {
    try {
      const anyVjs: VjsNamespace = videojs as unknown as VjsNamespace;

      if (typeof anyVjs.getPlayer === 'function') {
        const p = anyVjs.getPlayer?.(id);
        if (p && !p.isDisposed?.()) return p;
      }
      // ここで videojs(id) を呼ぶと新規生成される可能性があるため禁止
      return undefined;
    } catch (e) {
      console.debug('getExistingPlayer error', e);
      return undefined;
    }
  };

  // キーボードショートカットのイベントリスナー（Electron環境でのみ実行）
  useEffect(() => {
    if (window.electronAPI && typeof window.electronAPI.on === 'function') {
      const channel = 'video-shortcut-event';
      const handler = (_event: unknown, args: number) => {
        if (args > 0) {
          setVideoPlayBackRate(args);
          if (args === 1) {
            try {
              // 全プレイヤーのミュート解除を先に試行
              ['video_0', 'video_1'].forEach((id) => {
                try {
                  // anyを使わずにgetPlayerを厳密化
                  type VjsNSLocal = {
                    getPlayer?: (pid: string) => VjsPlayer | undefined;
                  };
                  const vjsLocal = videojs as unknown as VjsNSLocal;
                  const p = vjsLocal.getPlayer?.(id);
                  if (p && !p.isDisposed?.()) {
                    try {
                      p.muted?.(false);
                    } catch (e) {
                      console.debug('unmute via vjs error', e);
                    }
                    const ve = (p as unknown as { el?: () => Element | null })
                      .el?.()
                      ?.querySelector('video') as HTMLVideoElement | null;
                    if (ve) {
                      ve.muted = false;
                    }
                  }
                } catch (e) {
                  console.debug('getPlayer/unmute loop error', e);
                }
              });
            } catch (e) {
              console.debug('unmute-all try block error', e);
            }
            setIsVideoPlaying((prev) => !prev);
          }
        } else {
          setCurrentTime((prev) => prev + args);
        }
      };

      // 既存の同一ハンドラを一旦解除してから登録（重複回避）
      try {
        window.electronAPI?.off?.(
          channel,
          handler as unknown as (...args: unknown[]) => void,
        );
      } catch (e) {
        // ignore if not previously registered
        console.debug('keyboard pre-off ignored', e);
      }

      window.electronAPI.on(
        channel,
        handler as unknown as (event: Event, args: number) => void,
      );
      return () => {
        try {
          window.electronAPI?.off?.(
            channel,
            handler as unknown as (...args: unknown[]) => void,
          );
        } catch (e) {
          console.debug('keyboard off error', e);
        }
      };
    } else {
      console.log('ブラウザ環境: Electron APIは利用できません');
    }
  }, []);

  // 映像の再生位置を監視（共通シークバーとの連動）
  useEffect(() => {
    if (videoList.length === 0) return;

    let intervalId: NodeJS.Timeout | undefined;
    let animationFrameId: number | undefined;

    const updateTimeHandler = () => {
      try {
        const primaryPlayer = getExistingPlayer('video_0');
        if (primaryPlayer) {
          let duration = 0;
          try {
            const dur = primaryPlayer.duration
              ? primaryPlayer.duration()
              : undefined;
            duration = typeof dur === 'number' && !isNaN(dur) ? dur : 0;
          } catch {
            duration = 0;
          }

          if (
            typeof duration === 'number' &&
            !isNaN(duration) &&
            duration > 0
          ) {
            let newVideoTime = 0;
            try {
              newVideoTime = primaryPlayer.currentTime
                ? primaryPlayer.currentTime() || 0
                : 0;
            } catch {
              newVideoTime = 0;
            }

            if (
              typeof newVideoTime === 'number' &&
              !isNaN(newVideoTime) &&
              newVideoTime >= 0
            ) {
              if (Math.abs(newVideoTime - videoTime) > 0.05) {
                // ローカル表示用
                setVideoTime(newVideoTime);
                // グローバルcurrentTimeも更新（再生中のみ）
                if (isVideoPlaying) {
                  setCurrentTime(newVideoTime);
                }
              }
            }
          }
        }
      } catch (error) {
        console.debug('プレイヤーアクセスエラー:', error);
      }
    };

    const animationUpdateHandler = () => {
      updateTimeHandler();
      animationFrameId = requestAnimationFrame(animationUpdateHandler);
    };

    // プレイヤーの準備ができるまで待つ
    const timer = setTimeout(() => {
      try {
        const primaryPlayer = getExistingPlayer('video_0');
        if (primaryPlayer) {
          // timeupdate イベントでリアルタイム更新
          primaryPlayer.on?.('timeupdate', updateTimeHandler);

          // アニメーションフレームベースでスムーズ更新（再生中のみ）
          if (isVideoPlaying) {
            animationFrameId = requestAnimationFrame(animationUpdateHandler);
          }

          // ポーリングによるバックアップ
          intervalId = setInterval(updateTimeHandler, 200);
        }
      } catch (error) {
        console.debug('プレイヤー初期化待機中:', error);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      if (intervalId) clearInterval(intervalId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      try {
        const primaryPlayer = getExistingPlayer('video_0');
        if (primaryPlayer) {
          primaryPlayer.off?.('timeupdate', updateTimeHandler);
        }
      } catch (error) {
        console.debug('プレイヤークリーンアップエラー:', error);
      }
    };
  }, [videoList, isVideoPlaying]); // videoTimeを依存関係から除去して無限ループを防止

  // PLAY ALLを押した直後、全プレイヤーに対して再生を試行（既存のみ）
  useEffect(() => {
    if (isVideoPlaying && videoList.length > 0) {
      const tryPlayAll = () => {
        videoList.forEach((_, index) => {
          try {
            const id = `video_${index}`;
            const player = getExistingPlayer(id);
            if (player && !player.isDisposed?.()) {
              const rs = player.readyState?.() ?? 0;
              if (rs >= 1) {
                const p = player.play?.();
                if (p && typeof (p as Promise<unknown>).catch === 'function') {
                  (p as Promise<unknown>).catch(() => {
                    // Autoplay policy等は無視
                    console.debug('play promise rejected (autoplay policy)');
                  });
                }
              } else {
                // 準備完了イベントで再試行
                const onReady = () => {
                  const pp = player.play?.();
                  if (
                    pp &&
                    typeof (pp as Promise<unknown>).catch === 'function'
                  ) {
                    (pp as Promise<unknown>).catch(() => {
                      // noop
                      console.debug('delayed play promise rejected');
                    });
                  }
                  player.off?.('loadedmetadata', onReady);
                  player.off?.('canplay', onReady);
                };
                player.on?.('loadedmetadata', onReady);
                player.on?.('canplay', onReady);
              }
            }
          } catch {
            /* noop */
          }
        });
      };
      const t = setTimeout(tryPlayAll, 150);
      return () => clearTimeout(t);
    }
  }, [isVideoPlaying, videoList]);

  const handlePlayPauseClick = () => {
    const next = !isVideoPlaying;
    setIsVideoPlaying(next);

    try {
      type MinimalVjsPlayer = {
        isDisposed?: () => boolean;
        muted?: (val: boolean) => void;
        play?: () => Promise<void> | void;
      };
      type VjsNS = { getPlayer?: (id: string) => MinimalVjsPlayer | undefined };
      const vjs = videojs as unknown as VjsNS;

      const ids: string[] = ['video_0', 'video_1', 'video_2'];
      ids.forEach((vid) => {
        const p = vjs.getPlayer?.(vid);
        if (p && !p.isDisposed?.()) {
          try {
            p.muted?.(false);
          } catch (e) {
            // ignore
            console.debug('unmute error', e);
          }
          if (next) {
            const pr = p.play?.();
            if (pr && typeof (pr as Promise<unknown>).catch === 'function') {
              (pr as Promise<unknown>).catch(() => {
                // autoplay policy等は無視
                console.debug('play promise rejected (autoplay policy)');
              });
            }
          }
        }
      });
    } catch (e) {
      // ignore
      console.debug('handlePlayPauseClick error', e);
    }
  };

  const handleSliderChange = (
    _e: React.SyntheticEvent | Event,
    newValue: number | number[],
  ) => {
    // ドラッグ中はローカル表示のみ更新（実際の反映はコミット時）
    if (typeof newValue === 'number') setVideoTime(newValue);
  };

  const handleSliderChangeCommitted = (
    e: React.SyntheticEvent | Event,
    newValue: number | number[],
  ) => {
    handleCurrentTime(e, newValue);
  };

  const saveOffsetToConfig = async () => {
    if (!window.electronAPI) return;
    try {
      // パッケージフォルダを選択して .metadata/config.json に保存
      const packageDir = await window.electronAPI.openDirectory();
      if (!packageDir) return;
      const configPath = `${packageDir}/.metadata/config.json`;
      if (!syncData) return;
      const ok = await window.electronAPI.saveSyncData(configPath, {
        syncOffset: syncData.syncOffset || 0,
        isAnalyzed: !!syncData.isAnalyzed,
        confidenceScore: syncData.confidenceScore,
      });
      if (!ok) console.warn('オフセット保存に失敗しました');
    } catch (e) {
      console.warn('オフセット保存エラー', e);
    }
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Button onClick={handlePlayPauseClick} variant="contained">
          {isVideoPlaying ? 'Pause All' : 'Play All'}
        </Button>
        <Button onClick={() => setCurrentTime(videoTime - 10)}>10秒戻る</Button>
        <Button onClick={() => setCurrentTime(videoTime - 5)}>5秒戻る</Button>
        <Button onClick={() => setVideoPlayBackRate(0.5)}>0.5倍速</Button>
        <Button onClick={() => setVideoPlayBackRate(1)}>1倍速</Button>
        <Button onClick={() => setVideoPlayBackRate(2)}>2倍速</Button>
        <Button onClick={() => setVideoPlayBackRate(6)}>6倍速</Button>

        {/* 同期機能ボタン（2つ以上の映像がある場合のみ表示） */}
        {videoList.length > 1 && (
          <Stack direction="row" spacing={1} sx={{ ml: 2 }}>
            <Button
              onClick={resyncAudio}
              variant="outlined"
              size="small"
              disabled={!resyncAudio}
            >
              音声から自動同期
            </Button>
            <Button
              onClick={resetSync}
              variant="outlined"
              size="small"
              color="warning"
              disabled={!resetSync}
            >
              同期リセット
            </Button>
            <Button
              onClick={adjustSyncOffset}
              variant="outlined"
              size="small"
              disabled={!adjustSyncOffset}
            >
              手動オフセット入力
            </Button>
          </Stack>
        )}

        {/* 現在のオフセット表示と保存 */}
        {videoList.length > 1 && (
          <Stack
            direction="row"
            spacing={1}
            sx={{ ml: 2, alignItems: 'center' }}
          >
            <Typography variant="caption" sx={{ minWidth: 120 }}>
              現在のオフセット: {(syncData?.syncOffset || 0).toFixed(2)}s
            </Typography>
            <TextField
              label="オフセット(秒)"
              size="small"
              type="number"
              inputProps={{ step: 0.1 }}
              value={Number.isFinite(offsetLocal) ? offsetLocal : 0}
              onChange={(e) => setOffsetLocal(Number(e.target.value))}
              onBlur={() => {
                // 表示のみ更新（実際の適用は「手動オフセット入力」ボタンで）
              }}
              sx={{ width: 140 }}
            />
            <Button
              onClick={saveOffsetToConfig}
              size="small"
              variant="text"
              disabled={!window.electronAPI}
            >
              保存
            </Button>
          </Stack>
        )}

        <Box sx={{ paddingLeft: '30px' }} width={500}>
          <Slider
            aria-label="Time"
            valueLabelDisplay="auto"
            value={
              typeof videoTime === 'number' &&
              !isNaN(videoTime) &&
              videoTime >= 0
                ? videoTime
                : 0
            }
            onChange={handleSliderChange}
            onChangeCommitted={handleSliderChangeCommitted}
            min={0}
            max={
              typeof maxSec === 'number' && !isNaN(maxSec) && maxSec > 0
                ? maxSec
                : 100
            }
            step={0.1}
            disabled={maxSec <= 0 || isNaN(maxSec)}
            sx={{
              '& .MuiSlider-thumb': {
                transition: 'box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
              },
              '& .MuiSlider-track': { transition: 'none' },
            }}
          />
          {syncData?.isAnalyzed && (
            <Typography
              variant="caption"
              sx={{
                fontSize: '10px',
                color: 'text.secondary',
                display: 'block',
                textAlign: 'center',
              }}
            >
              同期済み: {syncData.syncOffset.toFixed(2)}秒オフセット (信頼度:{' '}
              {((syncData.confidenceScore || 0) * 100).toFixed(0)}%)
              <br />
              <span style={{ fontSize: '8px', color: 'text.disabled' }}>
                Cmd+Shift+S: 再同期 | Cmd+Shift+R: リセット | Cmd+Shift+O: 調整
              </span>
            </Typography>
          )}
          {syncData && !syncData.isAnalyzed && (
            <Typography
              variant="caption"
              sx={{
                fontSize: '10px',
                color: 'warning.main',
                display: 'block',
                textAlign: 'center',
              }}
            >
              同期未完了 -
              「音声から自動同期」または「手動オフセット入力」で設定
            </Typography>
          )}
        </Box>
      </Box>
    </>
  );
};
