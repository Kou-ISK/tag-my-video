import { Box } from '@mui/material';
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
}

export const SingleVideoPlayer: React.FC<SingleVideoPlayerProps> = ({
  videoSrc,
  id,
  isVideoPlaying,
  videoPlayBackRate,
  currentTime,
  setMaxSec,
  forceUpdate,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  // PLAY ALL中に遅延初期化でも再生できるよう、最新の再生フラグを保持
  const isPlayingRef = useRef<boolean>(isVideoPlaying);
  const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);

  // isVideoPlayingの最新値をrefに反映
  useEffect(() => {
    isPlayingRef.current = isVideoPlaying;
  }, [isVideoPlaying]);

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

            // 再生可能になったタイミングでも自動再生を試行
            playerRef.current.on('canplay', () => {
              console.log(`${id}: canplay イベント`);
              if (isPlayingRef.current) {
                try {
                  // Autoplay対策：ミュートしてから再生
                  playerRef.current.muted?.(true);
                  const p = playerRef.current.play?.();
                  if (
                    p &&
                    typeof (p as Promise<unknown>).catch === 'function'
                  ) {
                    (p as Promise<unknown>)
                      .catch(async (e) => {
                        console.warn(`${id}: playエラー (Video.js)`, e);
                        // HTMLVideoElementにフォールバック
                        try {
                          const ve = playerRef.current
                            .el()
                            ?.querySelector('video') as HTMLVideoElement | null;
                          if (ve) {
                            ve.muted = true;
                            await ve.play();
                          }
                        } catch (ee) {
                          console.warn(`${id}: フォールバックplayエラー`, ee);
                        }
                      })
                      .then(() => {
                        // フォールバック後の整合
                        try {
                          playerRef.current.muted?.(true);
                        } catch {
                          /* noop */
                        }
                      });
                  }
                } catch (e) {
                  console.warn(`${id}: play例外`, e);
                }
              }
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
                    } else {
                      console.warn(`${id}: duration取得に失敗しました`);
                      setMaxSec(100); // フォールバック値
                    }
                  }, 3000); // 再試行時間を延長
                }
              };

              playerRef.current.on('loadedmetadata', () => {
                setDuration();
                // PLAY ALL中に遅延初期化でも自動再生されるようにする
                if (isPlayingRef.current) {
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
                }
              });

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

  // 再生状態の制御 - 修正版（エラーハンドリング強化）
  useEffect(() => {
    console.log(`${id}: 再生状態制御useEffect実行`, {
      hasPlayer: !!playerRef.current,
      isVideoPlaying: isVideoPlaying,
      playerDisposed: playerRef.current?.isDisposed?.(),
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

            if (isVideoPlaying) {
              const paused = playerRef.current.paused();
              if (paused) {
                try {
                  // Autoplay対策：ミュートしてから再生
                  playerRef.current.muted?.(true);
                  const p = playerRef.current.play?.();
                  if (
                    p &&
                    typeof (p as Promise<unknown>).catch === 'function'
                  ) {
                    (p as Promise<unknown>)
                      .catch(async (e) => {
                        console.warn(`${id}: playエラー (Video.js)`, e);
                        // HTMLVideoElementにフォールバック
                        try {
                          const ve = playerRef.current
                            .el()
                            ?.querySelector('video') as HTMLVideoElement | null;
                          if (ve) {
                            ve.muted = true;
                            await ve.play();
                          }
                        } catch (ee) {
                          console.warn(`${id}: フォールバックplayエラー`, ee);
                        }
                      })
                      .then(() => {
                        // フォールバック後の整合
                        try {
                          playerRef.current.muted?.(true);
                        } catch {
                          /* noop */
                        }
                      });
                  }
                } catch (e) {
                  console.warn(`${id}: play例外`, e);
                }
              }
            } else {
              if (!playerRef.current.paused?.()) {
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
  }, [isVideoPlaying, id]);

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
                  playerRef.current.currentTime(currentTime);
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
      width="50%"
      height="100%"
      sx={{
        border: '2px solid red',
        margin: '5px',
        position: 'relative',
        minHeight: '360px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#000',
        '& .video-js': { height: '100%', width: '100%' },
        '& .vjs-tech': { objectFit: 'contain' },
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '2px 5px',
          fontSize: '12px',
          zIndex: 1000,
        }}
      >
        {id}
      </div>
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered"
        id={id}
        controls
        preload="auto"
        playsInline
      >
        {/* Video.jsがソースを管理するため<source>は置かない */}
      </video>
    </Box>
  );
};
