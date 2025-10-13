import { Box, Typography } from '@mui/material';
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface SingleVideoPlayerProps {
  videoSrc: string;
  id: string;
  isVideoPlaying: boolean;
  videoPlayBackRate: number;
  currentTime: number;
  setMaxSec: Dispatch<SetStateAction<number>>;
  forceUpdate?: number;
  blockPlay?: boolean; // オフセットによる遅延再生ブロック
  allowSeek?: boolean; // シーク操作許可（手動モードのみ有効）
}

export const SingleVideoPlayer: React.FC<SingleVideoPlayerProps> = ({
  videoSrc,
  id,
  isVideoPlaying,
  videoPlayBackRate,
  currentTime,
  setMaxSec,
  forceUpdate,
  blockPlay = false,
  allowSeek = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  // PLAY ALL中に遅延初期化でも再生できるよう、最新の再生フラグを保持
  const isPlayingRef = useRef<boolean>(isVideoPlaying);
  const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);
  // 各プレイヤーの実durationを保持（終端マスク判定用）
  const [durationSec, setDurationSec] = useState<number>(0);
  const [showEndMask, setShowEndMask] = useState<boolean>(false);

  // isVideoPlayingの最新値をrefに反映
  useEffect(() => {
    isPlayingRef.current = isVideoPlaying;
  }, [isVideoPlaying]);

  // 異常なcurrentTimeの検出と警告(durationベース)
  useEffect(() => {
    // durationが判明している場合のみチェック
    if (durationSec > 0 && currentTime > durationSec + 10) {
      // 動画の長さ+10秒を超える場合は明らかに異常
      console.error(
        `[${id}] currentTime (${currentTime}秒) が動画の長さ (${durationSec}秒) を大幅に超えています。`,
      );
    } else if (durationSec === 0 && currentTime > 7200) {
      // durationが不明で2時間を超える場合は警告
      console.warn(
        `[${id}] currentTime (${currentTime}秒) が2時間を超えていますが、動画の長さが未確定です。`,
      );
    }
  }, [currentTime, durationSec, id]);

  // allowSeekに応じてProgressControlを操作不能にする
  useEffect(() => {
    try {
      const p = playerRef.current;
      if (!p || p.isDisposed?.()) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pcEl = (p as any)?.controlBar?.progressControl?.el?.();
      if (pcEl && pcEl.style) {
        pcEl.style.pointerEvents = allowSeek ? 'auto' : 'none';
        pcEl.style.opacity = allowSeek ? '1' : '0.6';
      }
    } catch {
      /* noop */
    }
  }, [allowSeek]);

  // Video.jsプレイヤーの初期化（一度だけ）
  useEffect(() => {
    console.log(`=== ${id}: 初期化開始 ===`, {
      hasVideoRef: !!videoRef.current,
      hasPlayer: !!playerRef.current,
      videoSrc: videoSrc,
      videoSrcLength: videoSrc?.length,
      isEmpty: !videoSrc || videoSrc.trim() === '',
      videoRefId: videoRef.current?.id,
      domElement: videoRef.current,
    });

    // 致命的な問題の早期検出
    if (!videoRef.current) {
      console.error(`${id}: videoRef.currentがnullです`);
      return;
    }

    if (playerRef.current) {
      console.warn(`${id}: プレイヤーが既に存在します`, playerRef.current);
      return;
    }

    if (videoRef.current && !playerRef.current) {
      // 空のソースでも初期化はスキップしない
      // ソースは後段のuseEffectで設定する

      const option = {
        autoplay: false,
        controls: true,
        // aspectRatio: '16:9', // fill使用時は不要
        fluid: false,
        fill: true, // コンテナにフィットさせる
        preload: 'auto', // src設定後すぐ再生可能に
        playsinline: true,
        bigPlayButton: true,
      };

      try {
        console.log(`${id}: Video.jsプレイヤーを初期化中...`, {
          videoElement: videoRef.current,
          elementId: videoRef.current?.id,
          options: option,
        });

        // 2番目以降のプレイヤーは初期化を少し遅延させて競合を避ける
        const initDelay = id === 'video_0' ? 0 : 250; // 遅延を短縮しすぎない

        setTimeout(() => {
          if (!videoRef.current || playerRef.current) {
            console.warn(
              `${id}: 初期化タイミングでコンポーネント状態が変更されました`,
            );
            return;
          }

          console.log(`${id}: Video.jsプレイヤー作成開始...`);

          try {
            playerRef.current = videojs(videoRef.current, option);
            console.log(`${id}: Video.jsプレイヤー作成成功`, {
              player: playerRef.current,
              playerType: typeof playerRef.current,
              hasElement: !!playerRef.current?.el(),
              playerId: playerRef.current?.id_,
              isReady: playerRef.current?.isReady_,
            });

            // グローバル登録確認
            try {
              type VjsNS = {
                getPlayer?: (id: string) => typeof playerRef.current;
              };
              const vjsGlobal = videojs as unknown as VjsNS;
              const retrieved = vjsGlobal.getPlayer?.(id);
              console.log(`${id}: グローバル登録確認`, {
                canGetPlayer: !!retrieved,
                isSameInstance: retrieved === playerRef.current,
                retrievedPlayerId: retrieved?.id_,
              });
            } catch (e) {
              console.warn(`${id}: グローバル登録確認エラー`, e);
            }

            // エラーイベントの処理
            playerRef.current.on('error', (error: unknown) => {
              console.error(`${id}: プレイヤーエラー:`, error);
              const errorDetails = playerRef.current.error();
              console.error(`${id}: エラー詳細:`, errorDetails);
            });

            // プレイヤーの状態監視
            playerRef.current.on('loadstart', () => {
              console.log(`${id}: loadstart イベント`);
            });

            // Video.jsの再生・停止イベントを監視
            playerRef.current.on('play', () => {
              console.log(`${id}: Video.js play イベント - 実際に再生開始`);
            });

            playerRef.current.on('pause', () => {
              console.log(`${id}: Video.js pause イベント - 実際に一時停止`);
            });

            playerRef.current.on('ended', () => {
              console.log(`${id}: Video.js ended イベント - 再生終了`);
            });

            playerRef.current.on('waiting', () => {
              console.log(
                `${id}: Video.js waiting イベント - バッファリング中`,
              );
            });

            playerRef.current.on('playing', () => {
              console.log(
                `${id}: Video.js playing イベント - バッファリング後再開`,
              );
            });

            // canplayイベント - 再生準備完了の通知のみ(再生制御はuseEffectに一任)
            playerRef.current.on('canplay', () => {
              console.log(`${id}: ビデオ再生準備完了`);
            });

            playerRef.current.on('canplaythrough', () => {
              console.log(`${id}: canplaythrough イベント`);
            });

            playerRef.current.ready(() => {
              console.log(`${id}: プレイヤー準備完了`, {
                playerId: id,
                element: playerRef.current?.el(),
                isDisposed: playerRef.current?.isDisposed?.(),
                videoElement: playerRef.current?.el()?.querySelector('video'),
                videoElementSrc: playerRef.current?.el()?.querySelector('video')
                  ?.src,
              });

              setIsPlayerReady(true);

              // allowSeek反映（初期化直後にも適用）
              try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const pcEl = (
                  playerRef.current as any
                )?.controlBar?.progressControl?.el?.();
                if (pcEl && pcEl.style) {
                  pcEl.style.pointerEvents = allowSeek ? 'auto' : 'none';
                  pcEl.style.opacity = allowSeek ? '1' : '0.6';
                }
              } catch {
                /* noop */
              }

              // DOMに実際に要素が存在するかチェック
              const domElement = document.getElementById(id);
              console.log(`${id}: DOM要素確認`, {
                foundInDOM: !!domElement,
                domElement: domElement,
                hasVideoChild: !!domElement?.querySelector('video'),
                videoSrcInDOM: domElement?.querySelector('video')?.src,
              });

              // メタデータが読み込まれてからdurationを設定
              const setDuration = () => {
                if (!playerRef.current) return;

                const duration = playerRef.current?.duration();
                if (
                  typeof duration === 'number' &&
                  !isNaN(duration) &&
                  duration > 0
                ) {
                  setMaxSec(duration);
                  setDurationSec(duration); // 自分自身のdurationも保持
                  console.log(`${id}: duration設定: ${duration}秒`);
                } else {
                  console.debug(`${id}: duration取得失敗, 再試行します`);
                  // durationが取得できない場合は少し待ってから再試行
                  setTimeout(() => {
                    if (!playerRef.current) return;

                    const retryDuration = playerRef.current?.duration();
                    if (
                      typeof retryDuration === 'number' &&
                      !isNaN(retryDuration) &&
                      retryDuration > 0
                    ) {
                      setMaxSec(retryDuration);
                      console.log(
                        `${id}: duration再試行で設定: ${retryDuration}秒`,
                      );
                      // 自身のdurationも保持
                      setDurationSec(retryDuration);
                    } else {
                      console.warn(`${id}: duration取得に失敗しました`);
                      setMaxSec(100); // フォールバック値
                    }
                  }, 3000); // 再試行時間を延長
                }
              };

              playerRef.current.on('loadedmetadata', () => {
                setDuration();
                // PLAY ALL中に遅延初期化でも自動再生されるようにする（ただしブロック時は抑止）
                if (isPlayingRef.current && !blockPlay) {
                  try {
                    const p = playerRef.current?.play();
                    if (p && typeof p.catch === 'function') {
                      p.catch((e: unknown) =>
                        console.warn(`${id}: loadedmetadata時の再生エラー:`, e),
                      );
                    }
                  } catch (e) {
                    console.warn(`${id}: loadedmetadata時の再生例外:`, e);
                  }
                } else if (blockPlay) {
                  try {
                    playerRef.current.pause?.();
                  } catch (e) {
                    console.debug(
                      `${id}: loadedmetadata ブロック中pause例外`,
                      e,
                    );
                  }
                }
              });

              // durationの変化にも追従
              try {
                playerRef.current.on('durationchange', () => {
                  try {
                    const d = playerRef.current?.duration?.();
                    if (typeof d === 'number' && isFinite(d) && d > 0) {
                      setDurationSec(d);
                    }
                  } catch {
                    /* noop */
                  }
                });
              } catch {
                /* noop */
              }

              // すでにメタデータが読み込まれている場合は即座に実行
              setTimeout(setDuration, 200);
            });
          } catch (videojsError) {
            console.error(`${id}: Video.js作成でエラー発生:`, videojsError);
            return;
          }
        }, initDelay);
      } catch (initError) {
        console.error(`${id}: プレイヤー初期化エラー:`, initError);
      }
    }

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed?.()) {
        try {
          playerRef.current.dispose();
          console.log(`${id}: プレイヤー破棄完了`);
        } catch (disposeError) {
          console.warn(`${id}: プレイヤー破棄エラー:`, disposeError);
        }
        playerRef.current = null;
      }
    };
  }, [id]);

  // 映像ソースの変更（プレイヤー準備完了後に必ず設定）
  useEffect(() => {
    console.log(`=== ${id}: ソース変更useEffect実行 ===`, {
      hasPlayer: !!playerRef.current,
      isPlayerReady,
      videoSrc: videoSrc,
      videoSrcLength: videoSrc?.length,
      isEmpty: !videoSrc || videoSrc.trim() === '',
    });

    if (playerRef.current && isPlayerReady && videoSrc) {
      try {
        // プレイヤーの状態確認
        if (playerRef.current.isDisposed?.()) {
          console.warn(
            `${id}: プレイヤーが破棄されているため、ソース変更をスキップ`,
          );
          return;
        }

        console.log(`${id}: ビデオソース変更: ${videoSrc}`);
        console.log(`${id}: プレイヤー状態:`, {
          hasPlayer: !!playerRef.current,
          hasElement: !!playerRef.current.el(),
          error: playerRef.current.error(),
          readyState: playerRef.current.readyState?.(),
        });

        // ファイルパスの妥当性チェック
        if (!videoSrc.startsWith('/') && !videoSrc.startsWith('file://')) {
          console.error(`${id}: 無効なファイルパス形式: ${videoSrc}`);
          return;
        }

        // ファイルパスをfile:// URLに変換（日本語/スペース対応）
        const toFileUrl = (p: string) => {
          if (p.startsWith('file://')) {
            const raw = p.replace(/^file:\/\//, '');
            return `file://${encodeURI(raw)}`;
          }
          return `file://${encodeURI(p)}`;
        };
        const fileUrl = toFileUrl(videoSrc);
        console.log(`${id}: ファイルパス変換:`, {
          original: videoSrc,
          converted: fileUrl,
          hasJapanese: /[\u3040-\u30FF\u4E00-\u9FAF]/.test(videoSrc),
          pathLength: videoSrc.length,
          convertedLength: fileUrl.length,
        });

        // Video.jsプレイヤーにソースを設定
        try {
          playerRef.current.src({ src: fileUrl, type: 'video/mp4' });
          console.log(`${id}: Video.jsソース設定完了 (ready後)`);

          // ソース設定後、再生要求が出ている場合は再生を試行
          if (isPlayingRef.current) {
            const p = playerRef.current.play?.();
            if (p && typeof (p as Promise<unknown>).catch === 'function') {
              (p as Promise<unknown>).catch((e: unknown) =>
                console.warn(`${id}: ソース設定後の再生エラー:`, e),
              );
            }
          }
        } catch (srcError) {
          console.error(`${id}: Video.jsソース設定エラー:`, srcError);
          return;
        }

        // HTMLビデオ要素へ直接srcを設定するのは中止（競合の原因）
        // 以後のロードイベント監視はVideo.jsのイベントで実施
        playerRef.current.on('loadstart', () => {
          console.log(`${id}: ビデオ読み込み開始`);
        });

        playerRef.current.on('canplay', () => {
          console.log(`${id}: ビデオ再生準備完了`);
        });

        playerRef.current.on('error', () => {
          console.error(`${id}: ビデオエラー:`, playerRef.current.error());
        });

        playerRef.current.on('loadeddata', () => {
          console.log(`${id}: ビデオデータ読み込み完了`);
        });
      } catch (srcError) {
        console.error(`${id}: ソース変更エラー:`, srcError);
      }
    } else {
      if (!isPlayerReady) {
        console.warn(`${id}: プレイヤー未準備のためソース設定を保留`);
      } else if (!videoSrc) {
        console.warn(`${id}: 空のソースのため設定せず`);
      }
    }
  }, [videoSrc, id, isPlayerReady]);

  // 現在時刻/動画長さに応じて終端マスクを制御
  useEffect(() => {
    try {
      if (
        typeof currentTime === 'number' &&
        typeof durationSec === 'number' &&
        durationSec > 0
      ) {
        // 少し余裕を見て終端判定
        const nearEnd = currentTime >= durationSec - 0.01;
        setShowEndMask(!!nearEnd);
      } else {
        setShowEndMask(false);
      }
    } catch {
      setShowEndMask(false);
    }
  }, [currentTime, durationSec]);

  // 再生状態の制御 - 修正版（エラーハンドリング強化）
  useEffect(() => {
    console.log(`${id}: 再生状態制御useEffect実行`, {
      hasPlayer: !!playerRef.current,
      isVideoPlaying: isVideoPlaying,
      playerDisposed: playerRef.current?.isDisposed?.(),
      blockPlay,
    });

    if (playerRef.current && !playerRef.current.isDisposed?.()) {
      try {
        // 再生制御の実処理を先に定義（早期returnでも参照可能に）
        const runPlayback = () => {
          if (!playerRef.current || playerRef.current.isDisposed?.()) {
            console.warn(`${id}: プレイヤーが利用できません`);
            return;
          }
          try {
            const rootEl = playerRef.current.el();
            if (!rootEl || !document.contains(rootEl)) {
              console.error(`${id}: DOM要素が見つからない/削除されています`);
              return;
            }
            const rs = playerRef.current.readyState?.() ?? 0;
            if (rs < 1) {
              console.warn(`${id}: メタデータ未読込 (readyState=${rs})`);
              return;
            }

            // オフセットによるブロック: 再生中でも強制一時停止
            if (blockPlay) {
              try {
                if (!playerRef.current.paused?.()) {
                  playerRef.current.pause?.();
                  console.log(
                    `${id}: オフセットブロックのため一時停止 - blockPlay=${blockPlay}`,
                  );
                }
              } catch (e) {
                console.debug(`${id}: ブロックpauseエラー`, e);
              }
              return;
            }

            // 再生・停止制御の詳細ログ
            const currentPlayerPaused = playerRef.current.paused?.();
            console.log(`${id}: 再生制御詳細`, {
              isVideoPlaying,
              currentPlayerPaused,
              blockPlay,
              shouldPlay: isVideoPlaying && !blockPlay,
              action: isVideoPlaying
                ? currentPlayerPaused
                  ? 'play'
                  : 'already-playing'
                : currentPlayerPaused
                ? 'already-paused'
                : 'pause',
            });

            if (isVideoPlaying) {
              const paused = playerRef.current.paused();
              if (paused) {
                try {
                  // まずミュート解除で試行
                  playerRef.current.muted?.(false);
                  const p = playerRef.current.play?.();
                  if (
                    p &&
                    typeof (p as Promise<unknown>).catch === 'function'
                  ) {
                    (p as Promise<unknown>)
                      .catch(async (e) => {
                        console.warn(`${id}: playエラー (unmuted)`, e);
                        // 失敗時のみ一時的にミュートして再試行
                        try {
                          playerRef.current.muted?.(true);
                          const p2 = playerRef.current.play?.();
                          if (
                            p2 &&
                            typeof (p2 as Promise<unknown>).catch === 'function'
                          ) {
                            await (p2 as Promise<unknown>).catch(() => {
                              /* no-op */
                            });
                          }
                          // 再生開始後にミュート解除
                          try {
                            playerRef.current.muted?.(false);
                          } catch (ee) {
                            console.debug(`${id}: ミュート解除エラー`, ee);
                          }
                        } catch (ee) {
                          console.warn(`${id}: 再試行playエラー`, ee);
                        }
                      })
                      .then(() => {
                        try {
                          playerRef.current.muted?.(false);
                        } catch (ee) {
                          console.debug(`${id}: ミュート解除エラー`, ee);
                        }
                      });
                  }
                } catch (e) {
                  console.warn(`${id}: play例外`, e);
                }
              }
            } else {
              if (!playerRef.current.paused?.()) {
                console.log(
                  `${id}: 一時停止実行 - isVideoPlaying=${isVideoPlaying}`,
                );
                try {
                  playerRef.current.pause?.();
                } catch (e) {
                  console.warn(`${id}: pause例外`, e);
                }
              }
            }
          } catch (e) {
            console.error(`${id}: 再生制御中エラー`, e);
          }
        };

        // プレイヤーの状態をより詳細にチェック
        const playerError = playerRef.current.error();
        if (playerError) {
          console.error(
            `${id}: プレイヤーエラー状態のため再生制御をスキップ:`,
            playerError,
          );
          return;
        }

        // readyStateの確認（メタデータが読み込まれているか）
        const readyState = playerRef.current.readyState?.() || 0;
        if (readyState < 1) {
          console.warn(
            `${id}: ビデオ未準備 (readyState: ${readyState})のため再生制御を遅延`,
          );

          const onLoadedMetadata = () => {
            console.log(`${id}: メタデータ読み込み完了、再生制御を再実行`);
            if (playerRef.current && !playerRef.current.isDisposed?.()) {
              runPlayback();
            }
            playerRef.current?.off('loadedmetadata', onLoadedMetadata);
          };

          playerRef.current.on('loadedmetadata', onLoadedMetadata);

          setTimeout(() => {
            if (playerRef.current) {
              playerRef.current.off('loadedmetadata', onLoadedMetadata);
              console.warn(`${id}: メタデータ読み込みタイムアウト`);
            }
          }, 5000);

          return;
        }

        // すぐに実行
        runPlayback();
      } catch (error) {
        console.error(`${id}: 再生状態制御useEffectでエラー:`, error);
      }
    } else {
      console.warn(`${id}: プレイヤーが利用できません`, {
        hasPlayer: !!playerRef.current,
        isDisposed: playerRef.current?.isDisposed?.(),
      });
    }
  }, [isVideoPlaying, id, blockPlay]);

  // 再生速度の制御
  useEffect(() => {
    if (playerRef.current && !playerRef.current.isDisposed?.()) {
      try {
        const currentRate = playerRef.current.playbackRate();
        if (currentRate !== videoPlayBackRate) {
          playerRef.current.playbackRate(videoPlayBackRate);
          console.log(`${id}: 再生速度変更: ${videoPlayBackRate}倍`);
        }
      } catch (rateError) {
        console.debug(`${id}: 再生速度変更エラー:`, rateError);
      }
    }
  }, [videoPlayBackRate, id]);

  // 現在時刻の制御
  useEffect(() => {
    if (
      playerRef.current &&
      !playerRef.current.isDisposed?.() &&
      typeof currentTime === 'number' &&
      !isNaN(currentTime) &&
      currentTime >= 0
    ) {
      try {
        // プレイヤーの状態確認
        if (playerRef.current.error()) {
          console.warn(`${id}: プレイヤーエラー状態のためシークをスキップ`);
          return;
        }

        const currentPlayerTime = playerRef.current.currentTime();
        console.log(
          `[DEBUG] ${id}: Time setting check - currentTime prop=${currentTime}, playerCurrentTime=${currentPlayerTime}, duration=${durationSec}, blockPlay=${blockPlay}`,
        );

        // フリッカリング防止：より大きな閾値を使用し、シーク処理を最適化
        if (
          typeof currentPlayerTime === 'number' &&
          !isNaN(currentPlayerTime) &&
          Math.abs(currentPlayerTime - currentTime) > 1.5
        ) {
          console.log(
            `${id}: 時刻を${currentTime}秒に設定 (現在: ${currentPlayerTime}秒)`,
          );

          // プレイヤーの状態を確認してからシーク実行
          const readyState = playerRef.current.readyState?.() || 0;
          if (readyState >= 1 && !playerRef.current.error()) {
            // シーク実行をキューに入れて安全に処理
            requestAnimationFrame(() => {
              if (
                playerRef.current &&
                !playerRef.current.isDisposed?.() &&
                !playerRef.current.error()
              ) {
                try {
                  // 動画の長さを超える場合は調整
                  let seekTime = currentTime;

                  // 異常値判定: durationが分かっている場合はduration+5秒を基準に
                  // durationが不明な場合は7200秒(2時間)を上限とする
                  const maxAllowedTime =
                    durationSec > 0 ? durationSec + 5 : 7200;

                  if (currentTime > maxAllowedTime) {
                    // 明らかに異常な値の場合は警告のみ(リセットしない)
                    console.warn(
                      `[WARNING] ${id}: 異常に高いシーク時間 (${currentTime}秒、上限=${maxAllowedTime}秒) です。`,
                    );
                    seekTime = currentTime; // そのまま使用
                  } else if (durationSec > 0 && currentTime > durationSec) {
                    // 動画の長さを少し超える程度なら末尾に調整
                    seekTime = Math.max(0, durationSec - 0.5);
                    console.warn(
                      `[WARN] ${id}: シーク時間 (${currentTime}秒) を動画の長さ内 (${seekTime}秒) に調整しました。`,
                    );
                  }

                  console.log(`[DEBUG] ${id}: Executing seek to ${seekTime}`);
                  playerRef.current.currentTime(seekTime);
                } catch (seekError) {
                  console.debug(`${id}: シーク実行エラー:`, seekError);
                }
              }
            });
          } else {
            console.debug(
              `${id}: プレイヤー未準備 (readyState: ${readyState})`,
            );
          }
        }
      } catch (error) {
        console.debug(`${id}: 時刻設定エラー:`, error);
      }
    }
  }, [currentTime, id]);

  // 強制更新処理を別のuseEffectに分離
  useEffect(() => {
    if (forceUpdate && forceUpdate > 0) {
      console.log(`${id}: 強制更新実行 (key: ${forceUpdate})`);

      // 強制更新時のみ即座にシークを実行
      if (
        playerRef.current &&
        !playerRef.current.isDisposed?.() &&
        typeof currentTime === 'number' &&
        !isNaN(currentTime) &&
        currentTime >= 0
      ) {
        // プレイヤーが準備完了してからシーク実行
        const performSeek = () => {
          if (
            playerRef.current &&
            !playerRef.current.isDisposed?.() &&
            !playerRef.current.error()
          ) {
            try {
              const el = playerRef.current.el()?.querySelector('video');
              if (!el) {
                console.warn(`${id}: 強制更新: ビデオ要素が見つかりません`);
                return;
              }
              playerRef.current.currentTime(currentTime);
              console.log(`${id}: 強制更新でシーク完了: ${currentTime}秒`);
            } catch (seekError) {
              console.debug(`${id}: 強制更新シークエラー:`, seekError);
            }
          }
        };

        const readyState = playerRef.current.readyState?.() || 0;
        if (readyState >= 1) {
          performSeek();
        } else {
          // メタデータが読み込まれるまで待機
          const onLoadedMetadata = () => {
            performSeek();
            if (playerRef.current) {
              playerRef.current.off('loadedmetadata', onLoadedMetadata);
            }
          };
          playerRef.current.on('loadedmetadata', onLoadedMetadata);

          // タイムアウト処理で無限待機を防ぐ
          setTimeout(() => {
            if (playerRef.current) {
              playerRef.current.off('loadedmetadata', onLoadedMetadata);
            }
          }, 5000);
        }
      }
    }
  }, [forceUpdate, currentTime, id]);

  // コンテナサイズ変化に追従して Video.js をリサイズ
  useEffect(() => {
    if (!containerRef.current) return;

    let ro: ResizeObserver | undefined;
    try {
      ro = new ResizeObserver(() => {
        try {
          if (playerRef.current && !playerRef.current.isDisposed?.()) {
            // Video.js にリサイズを通知
            if (typeof playerRef.current.resize === 'function') {
              playerRef.current.resize();
            }
          }
        } catch (e) {
          console.debug(`${id}: ResizeObserver resizeエラー`, e);
        }
      });
      ro.observe(containerRef.current);
    } catch (e) {
      console.debug(`${id}: ResizeObserver未対応/初期化エラー`, e);
    }

    return () => {
      try {
        ro?.disconnect();
      } catch (e) {
        console.debug(`${id}: ResizeObserver disconnectエラー`, e);
      }
    };
  }, [id]);

  console.log(`SingleVideoPlayer ${id} props:`, {
    videoSrc,
    id,
    isVideoPlaying,
    videoPlayBackRate,
    currentTime,
    forceUpdate,
  });

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'absolute',
        inset: 0,
        // 親の16:9ボックスにピッタリ合わせる
        '& .video-js': { height: '100%', width: '100%' },
        '& .vjs-tech': { objectFit: 'contain' },
        '& .vjs-progress-control': {
          pointerEvents: allowSeek ? 'auto' : 'none',
          opacity: allowSeek ? 1 : 0.6,
        },
      }}
    >
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered"
        id={id}
        controls
        preload="auto"
        playsInline
      />
      {blockPlay && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#000',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ddd',
          }}
        >
          <Typography variant="caption">音声同期待機中…</Typography>
        </Box>
      )}
      {showEndMask && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#000',
            zIndex: 2,
          }}
        />
      )}
    </Box>
  );
};

// React.memoでコンポーネントをメモ化し、不要な再レンダリングを防ぐ
export const MemoizedSingleVideoPlayer = React.memo(
  SingleVideoPlayer,
  (prevProps, nextProps) => {
    // 意味のある変更の場合のみ再レンダリング（閾値を0.1秒に統一）
    const significantTimeChange =
      Math.abs(prevProps.currentTime - nextProps.currentTime) > 0.1;
    const otherPropsChanged =
      prevProps.videoSrc !== nextProps.videoSrc ||
      prevProps.id !== nextProps.id ||
      prevProps.isVideoPlaying !== nextProps.isVideoPlaying ||
      prevProps.videoPlayBackRate !== nextProps.videoPlayBackRate ||
      prevProps.forceUpdate !== nextProps.forceUpdate ||
      prevProps.blockPlay !== nextProps.blockPlay ||
      prevProps.allowSeek !== nextProps.allowSeek;

    // currentTimeが0.1秒以下の変化の場合は再レンダリングを防ぐ
    const shouldUpdate = significantTimeChange || otherPropsChanged;

    if (!shouldUpdate) {
      console.log(
        `${nextProps.id}: 再レンダリングをスキップ (時間変化: ${Math.abs(
          prevProps.currentTime - nextProps.currentTime,
        ).toFixed(6)}秒)`,
      );
    }

    return !shouldUpdate;
  },
);
