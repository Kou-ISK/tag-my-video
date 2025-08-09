import { Box } from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useRef } from 'react';
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);

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
      // 空のソースの場合は初期化をスキップ
      if (!videoSrc || videoSrc.trim() === '') {
        console.warn(`${id}: 空のビデオソースのため初期化をスキップ`);
        return;
      }

      const option = {
        autoplay: false,
        aspectRatio: '16:9',
        fluid: true,
        responsive: true,
        fill: true,
        controls: true,
        preload: 'metadata',
      };

      try {
        console.log(`${id}: Video.jsプレイヤーを初期化中...`, {
          videoElement: videoRef.current,
          elementId: videoRef.current?.id,
          options: option,
        });

        // 2番目以降のプレイヤーは初期化を少し遅延させて競合を避ける
        const initDelay = id === 'video_0' ? 0 : 1000; // 遅延時間を延長

        setTimeout(() => {
          if (!videoRef.current || playerRef.current) {
            console.warn(
              `${id}: 初期化タイミングでコンポーネント状態が変更されました`,
            );
            return;
          }

          // Video.jsプレイヤーを作成
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

            playerRef.current.on('canplay', () => {
              console.log(`${id}: canplay イベント`);
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

              // DOMに実際に要素が存在するかチェック
              const domElement = document.getElementById(id);
              console.log(`${id}: DOM要素確認`, {
                foundInDOM: !!domElement,
                domElement: domElement,
                hasVideoChild: !!domElement?.querySelector('video'),
                videoSrcInDOM: domElement?.querySelector('video')?.src,
              });

              // プレイヤーが完全に準備完了してからdurationを取得
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

              // メタデータが読み込まれてからdurationを設定
              playerRef.current.on('loadedmetadata', setDuration);

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
  }, [setMaxSec, id]);

  // 映像ソースの変更
  useEffect(() => {
    console.log(`=== ${id}: ソース変更useEffect実行 ===`, {
      hasPlayer: !!playerRef.current,
      videoSrc: videoSrc,
      videoSrcLength: videoSrc?.length,
      isEmpty: !videoSrc || videoSrc.trim() === '',
    });

    if (playerRef.current && videoSrc) {
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

        // ファイルパスをfile:// URLに変換（日本語文字対応）
        const fileUrl = videoSrc.startsWith('file://')
          ? videoSrc
          : `file://${videoSrc}`;
        console.log(`${id}: ファイルパス変換:`, {
          original: videoSrc,
          converted: fileUrl,
          hasJapanese: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(
            videoSrc,
          ),
          pathLength: videoSrc.length,
          convertedLength: fileUrl.length,
        });

        // Video.jsプレイヤーにソースを設定
        try {
          playerRef.current.src({ src: fileUrl, type: 'video/mp4' });
          console.log(`${id}: Video.jsソース設定完了`);

          // ソース設定後の状態確認
          setTimeout(() => {
            const srcObj = playerRef.current.src();
            console.log(`${id}: 設定されたソース確認:`, srcObj);

            const playerError = playerRef.current.error();
            if (playerError) {
              console.error(`${id}: プレイヤーエラー検出:`, playerError);
            }
          }, 100);
        } catch (srcError) {
          console.error(`${id}: Video.jsソース設定エラー:`, srcError);
          return;
        }

        // HTMLビデオ要素にも直接設定
        const videoElement = playerRef.current.el()?.querySelector('video');
        if (videoElement) {
          videoElement.src = fileUrl;
          console.log(`${id}: HTMLビデオ要素にもソース設定完了`);

          // ファイルアクセステスト
          videoElement.addEventListener('loadstart', () => {
            console.log(`${id}: HTMLビデオ loadstart`);
          });

          videoElement.addEventListener('error', (e: Event) => {
            console.error(`${id}: HTMLビデオエラー:`, e);
            console.error(`${id}: ビデオ要素エラー詳細:`, videoElement.error);
          });

          videoElement.addEventListener('canplay', () => {
            console.log(`${id}: HTMLビデオ canplay`);
          });
        } else {
          console.warn(`${id}: HTMLビデオ要素が見つかりません`);
        }

        // ソース変更後の処理
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
      console.warn(`${id}: プレイヤーまたはソースが未設定`, {
        hasPlayer: !!playerRef.current,
        videoSrc: videoSrc,
      });
    }
  }, [videoSrc, id]);

  // 再生状態の制御 - 修正版（エラーハンドリング強化）
  useEffect(() => {
    console.log(`${id}: 再生状態制御useEffect実行`, {
      hasPlayer: !!playerRef.current,
      isVideoPlaying: isVideoPlaying,
      playerDisposed: playerRef.current?.isDisposed?.(),
    });

    if (playerRef.current && !playerRef.current.isDisposed?.()) {
      try {
        // プレイヤーの状態をより詳細にチェック
        const playerError = playerRef.current.error();
        if (playerError) {
          console.error(
            `${id}: プレイヤーエラー状態のため再生制御をスキップ:`,
            playerError,
          );
          return;
        }

        // ビデオ要素の存在確認
        const videoElement = playerRef.current.el()?.querySelector('video');
        if (!videoElement) {
          console.warn(`${id}: ビデオ要素が見つからないため再生制御をスキップ`);
          return;
        }

        // readyStateの確認（メタデータが読み込まれているかチェック）
        const readyState = playerRef.current.readyState?.() || 0;
        if (readyState < 1) {
          console.warn(
            `${id}: ビデオ未準備 (readyState: ${readyState})のため再生制御を遅延`,
          );

          // メタデータ読み込み完了まで待機
          const onLoadedMetadata = () => {
            console.log(`${id}: メタデータ読み込み完了、再生制御を再実行`);
            if (playerRef.current && !playerRef.current.isDisposed?.()) {
              performPlaybackControl();
            }
            // イベントリスナーをクリーンアップ
            if (playerRef.current) {
              playerRef.current.off('loadedmetadata', onLoadedMetadata);
            }
          };

          playerRef.current.on('loadedmetadata', onLoadedMetadata);

          // タイムアウト処理で無限待機を防ぐ
          setTimeout(() => {
            if (playerRef.current) {
              playerRef.current.off('loadedmetadata', onLoadedMetadata);
              console.warn(`${id}: メタデータ読み込みタイムアウト`);
            }
          }, 5000);

          return;
        }

        // 再生制御の実際の処理
        const performPlaybackControl = () => {
          if (!playerRef.current || playerRef.current.isDisposed?.()) {
            console.warn(`${id}: プレイヤーが利用できません`);
            return;
          }

          try {
            // DOM要素の存在確認
            const videoElement = playerRef.current.el();
            if (!videoElement || !document.contains(videoElement)) {
              console.error(`${id}: DOM要素が見つからないか、削除されています`);
              return;
            }

            // readyStateの確認
            const readyState = playerRef.current.readyState();
            if (readyState < 1) {
              console.warn(
                `${id}: メタデータが読み込まれていません (readyState=${readyState})`,
              );
              return;
            }

            if (isVideoPlaying) {
              // 再生開始
              const currentPaused = playerRef.current.paused();
              console.log(
                `${id}: 再生開始試行 (現在の状態: paused=${currentPaused})`,
              );

              if (currentPaused) {
                // DOM要素の再確認（play前）
                if (!document.contains(videoElement)) {
                  console.error(`${id}: play実行前にDOM要素が削除されました`);
                  return;
                }

                // play()メソッドはPromiseを返すので、エラーハンドリングを改善
                const playPromise = playerRef.current.play();

                if (playPromise && typeof playPromise.then === 'function') {
                  playPromise
                    .then(() => {
                      console.log(`${id}: 再生開始成功`);

                      // DOM要素の再確認（play後）
                      if (!document.contains(videoElement)) {
                        console.error(
                          `${id}: play実行後にDOM要素が削除されました`,
                        );
                      }
                    })
                    .catch((playError: unknown) => {
                      console.warn(`${id}: 再生開始エラー:`, playError);

                      // エラー後のDOM要素確認
                      if (!document.contains(videoElement)) {
                        console.error(
                          `${id}: 再生エラー後にDOM要素が削除されました`,
                        );
                      }

                      // 再生エラーの場合、プレイヤーが破損している可能性があるのでスキップ
                      // ただし、AutoplayPolicyエラーなどの場合は致命的ではない
                      if (
                        playError &&
                        typeof playError === 'object' &&
                        'name' in playError
                      ) {
                        const errorName = (playError as Error).name;
                        if (
                          errorName === 'NotAllowedError' ||
                          errorName === 'NotSupportedError'
                        ) {
                          console.warn(
                            `${id}: 自動再生ポリシーエラー、ユーザー操作が必要`,
                          );
                        }
                      }
                    });
                } else {
                  console.log(`${id}: 再生開始（同期メソッド）`);
                }
              } else {
                console.log(`${id}: 既に再生中`);
              }
            } else {
              // 再生停止
              const currentPaused = playerRef.current.paused();
              console.log(
                `${id}: 再生停止試行 (現在の状態: paused=${currentPaused})`,
              );

              if (!currentPaused) {
                // DOM要素の再確認（pause前）
                if (!document.contains(videoElement)) {
                  console.error(`${id}: pause実行前にDOM要素が削除されました`);
                  return;
                }

                playerRef.current.pause();
                console.log(`${id}: 再生停止完了`);

                // DOM要素の再確認（pause後）
                if (!document.contains(videoElement)) {
                  console.error(`${id}: pause実行後にDOM要素が削除されました`);
                }
              } else {
                console.log(`${id}: 既に停止中`);
              }
            }
          } catch (playStateError) {
            console.error(`${id}: 再生状態制御でエラー:`, playStateError);

            // エラーが発生した場合、プレイヤーの状態を再確認
            if (playerRef.current) {
              const currentPlayerError = playerRef.current.error();
              if (currentPlayerError) {
                console.error(
                  `${id}: プレイヤーエラー詳細:`,
                  currentPlayerError,
                );
              }

              const element = playerRef.current.el();
              if (!element) {
                console.error(`${id}: プレイヤー要素が破損しています`);
              } else if (!document.contains(element)) {
                console.error(`${id}: プレイヤー要素がDOMから削除されています`);
              }
            }
          }
        };

        performPlaybackControl();
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
          if (playerRef.current && !playerRef.current.error()) {
            try {
              // ビデオ要素の存在確認
              const videoElement = playerRef.current
                .el()
                ?.querySelector('video');
              if (!videoElement) {
                console.warn(`${id}: ビデオ要素が見つかりません`);
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
      width="50%"
      height="100%"
      sx={{
        border: '2px solid red', // デバッグ用：コンテナを視覚化
        margin: '5px',
        position: 'relative',
        minHeight: '300px', // 最小高度を確保してコンテナの縮小を防ぐ
        flexShrink: 0, // フレックスボックス内での縮小を防ぐ
        display: 'flex',
        flexDirection: 'column',
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
        className="video-js"
        preload="auto"
        width="640"
        height="360"
        id={id}
        controls
        style={{
          width: '100%',
          height: '100%',
          border: '1px solid blue', // デバッグ用：ビデオエレメントを視覚化
        }}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
    </Box>
  );
};
