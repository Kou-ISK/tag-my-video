import { Box, Typography } from '@mui/material';
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type Player from 'video.js/dist/types/player';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface SingleVideoPlayerProps {
  videoSrc: string;
  id: string;
  isVideoPlaying: boolean;
  videoPlayBackRate: number;
  setMaxSec: Dispatch<SetStateAction<number>>;
  forceUpdate?: number;
  blockPlay?: boolean;
  allowSeek?: boolean;
  offsetSeconds?: number;
  onAspectRatioChange?: (ratio: number) => void;
}

const formatSource = (src: string) => {
  const trimmed = src.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('file://')) return trimmed;

  // UNCパス (例: \\server\share\video.mp4)
  if (/^\\\\/.test(trimmed)) {
    const replaced = trimmed.replace(/\\/g, '/').replace(/^\/+/, '');
    return `file://${encodeURI(replaced)}`;
  }

  // Windows ドライブレター (例: C:\video.mp4)
  if (/^[a-zA-Z]:[\\/]/.test(trimmed)) {
    const replaced = trimmed.replace(/\\/g, '/');
    return `file:///${encodeURI(replaced)}`;
  }

  const normalised = trimmed.replace(/\\/g, '/').replace(/^\/+/, '');
  return `file:///${encodeURI(normalised)}`;
};

export const SingleVideoPlayer: React.FC<SingleVideoPlayerProps> = ({
  videoSrc,
  id,
  isVideoPlaying,
  videoPlayBackRate,
  setMaxSec,
  forceUpdate = 0,
  blockPlay = false,
  allowSeek = true,
  offsetSeconds = 0,
  onAspectRatioChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Player | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [durationSec, setDurationSec] = useState<number>(0);
  const [showEndMask, setShowEndMask] = useState(false);
  const initialMuteApplied = useRef(false);
  const techErrorHandlerRef = useRef<((event?: Event) => void) | null>(null);
  const metadataHandlerRef = useRef<(() => void) | null>(null);
  const resizeHandlerRef = useRef<(() => void) | null>(null);
  const aspectRatioCallbackRef = useRef<
    ((ratio: number) => void) | undefined
  >(onAspectRatioChange);
  const lastReportedAspectRatioRef = useRef<number | null>(null);
  void forceUpdate;

  useEffect(() => {
    aspectRatioCallbackRef.current = onAspectRatioChange;
  }, [onAspectRatioChange]);

  const reportAspectRatio = useCallback(
    (playerInstance: Player) => {
      const withDimensions = playerInstance as Player & {
        videoWidth?: () => number;
        videoHeight?: () => number;
      };
      const width = withDimensions.videoWidth?.() ?? 0;
      const height = withDimensions.videoHeight?.() ?? 0;
      if (width <= 0 || height <= 0) {
        return;
      }
      const ratio = width / height;
      if (!Number.isFinite(ratio) || ratio <= 0) {
        return;
      }
      const rounded = Math.round(ratio * 1000) / 1000;
      if (
        lastReportedAspectRatioRef.current !== null &&
        Math.abs(lastReportedAspectRatioRef.current - rounded) < 0.001
      ) {
        return;
      }
      lastReportedAspectRatioRef.current = rounded;
      aspectRatioCallbackRef.current?.(rounded);
    },
    [],
  );

  // プレイヤー初期化
  useEffect(() => {
    console.log(`[${id}] render/useEffect init`, {
      hasPlayer: !!playerRef.current,
      videoSrc,
    });
    if (playerRef.current) {
      console.debug(`[${id}] player already initialised`);
      return;
    }

    let cancelled = false;
    let rafId: number | undefined;
    const resolveVideoElement = (): HTMLVideoElement | null => {
      let el = videoRef.current;
      if (el && el.isConnected) return el;

      if (typeof document !== 'undefined') {
        el = document.getElementById(id) as HTMLVideoElement | null;
        if (el && el.isConnected) {
          videoRef.current = el;
          return el;
        }
      }

      const container = containerRef.current;
      if (container) {
        const found = container.querySelector('video');
        if (found instanceof HTMLVideoElement && found.isConnected) {
          videoRef.current = found;
          return found;
        }

        if (typeof document !== 'undefined') {
          const created = document.createElement('video');
          created.id = id;
          created.className = 'video-js vjs-big-play-centered';
          created.setAttribute('playsinline', 'playsinline');
          created.setAttribute('preload', 'auto');
          if (allowSeek) {
            created.setAttribute('controls', '');
          }
          container.appendChild(created);
          videoRef.current = created;
          return created;
        }
      }

      return null;
    };
    const initializePlayer = () => {
      const videoEl = resolveVideoElement();
      console.log(
        `[${id}] initialise tick`,
        videoEl ? { isConnected: videoEl.isConnected } : 'no video element',
      );
      if (cancelled || playerRef.current) {
        return;
      }
      if (!videoEl || !videoEl.isConnected) {
        if (!cancelled) {
          rafId = requestAnimationFrame(initializePlayer);
        }
        return;
      }

      console.log(`[${id}] create video.js`, videoEl);
      const playerInstance = videojs(videoEl, {
        controls: allowSeek,
        preload: 'auto',
        autoplay: false,
        playsinline: true,
        fill: true,
        fluid: true,
        responsive: true,
        inactivityTimeout: 0,
        html5: {
          vhs: { enableLowInitialPlaylist: true },
          nativeVideoTracks: false,
          nativeAudioTracks: false,
        },
      });

      playerRef.current = playerInstance;
      try {
        playerInstance.controls(allowSeek);
      } catch {
        /* noop */
      }

      const handleReady = () => {
        console.log(`[${id}] ready event`, {
          duration: playerInstance.duration?.(),
        });
        if (!initialMuteApplied.current && id !== 'video_0') {
          playerInstance.muted(true);
          initialMuteApplied.current = true;
        }
      };

      const handleTechError = () => {
        const tech = playerInstance.el()?.querySelector('video');
        console.log(`[${id}] tech error`, {
          error: tech?.error,
          readyState: tech?.readyState,
          networkState: tech?.networkState,
          src: tech?.currentSrc,
        });
      };
      techErrorHandlerRef.current = handleTechError;

      const techEl = videoEl;
      techEl?.addEventListener('error', handleTechError);

      const handleMetadata = () => {
        const mediaDuration = playerInstance.duration() ?? 0;
        console.log(`[${id}] loadedmetadata`, { mediaDuration });
        if (mediaDuration > 0) {
          setDurationSec(mediaDuration);
          setMaxSec(mediaDuration);
        }
        setIsReady(true);
        reportAspectRatio(playerInstance);
      };
      metadataHandlerRef.current = handleMetadata;

      const handleResize = () => {
        reportAspectRatio(playerInstance);
      };
      resizeHandlerRef.current = handleResize;

      playerInstance.ready(handleReady);
      playerInstance.on('loadedmetadata', handleMetadata);
      playerInstance.on('durationchange', handleMetadata);
      playerInstance.on('loadeddata', handleMetadata);
      playerInstance.on('error', handleTechError);
      playerInstance.on('resize', handleResize);
    };

    initializePlayer();

    return () => {
      cancelled = true;
      if (rafId !== undefined) {
        cancelAnimationFrame(rafId);
      }
      const handleTechError = techErrorHandlerRef.current;
      const playerInstance = playerRef.current;
      if (playerInstance && !playerInstance.isDisposed()) {
        if (handleTechError) {
          playerInstance.off('error', handleTechError);
          const tech = playerInstance.el()?.querySelector('video');
          tech?.removeEventListener('error', handleTechError);
        }
        const handleMetadata = metadataHandlerRef.current;
        if (handleMetadata) {
          playerInstance.off('loadedmetadata', handleMetadata);
          playerInstance.off('durationchange', handleMetadata);
          playerInstance.off('loadeddata', handleMetadata);
        }
        const handleResize = resizeHandlerRef.current;
        if (handleResize) {
          playerInstance.off('resize', handleResize);
        }
        playerInstance.dispose();
      } else {
        const tech = videoRef.current;
        if (handleTechError) {
          tech?.removeEventListener('error', handleTechError);
        }
      }
      playerRef.current = null;
      videoRef.current = null;
      techErrorHandlerRef.current = null;
      metadataHandlerRef.current = null;
      resizeHandlerRef.current = null;
    };
  }, [id, setMaxSec, reportAspectRatio]);

  // ソース設定
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !videoSrc) {
      return;
    }

    const source = formatSource(videoSrc);
    const currentSource = (() => {
      try {
        const source = player.currentSource?.();
        if (source && typeof source === 'object' && 'src' in source) {
          return (source as { src?: string }).src ?? '';
        }
        return '';
      } catch {
        return '';
      }
    })();

    if (currentSource === source) {
      return;
    }

    lastReportedAspectRatioRef.current = null;

    setShowEndMask(false);

    setIsReady(false);

    player.pause();
    player.src({ src: source, type: 'video/mp4' });
    console.log(`[${id}] source set`, { source });
    // Video.jsは自動的にcurrentTimeを0にリセット
  }, [videoSrc, id]);

  // 進捗バーの操作可否
  useEffect(() => {
    const player = playerRef.current;
    if (!player) {
      return;
    }
    const progressControl = (
      player as Player & {
        controlBar?: { progressControl?: { el?: () => Element | null } };
      }
    ).controlBar?.progressControl?.el?.();
    if (progressControl instanceof HTMLElement) {
      progressControl.style.pointerEvents = allowSeek ? 'auto' : 'none';
      progressControl.style.opacity = allowSeek ? '1' : '0.6';
    }
  }, [allowSeek]);

  useEffect(() => {
    const player = playerRef.current;
    const videoEl = videoRef.current;
    try {
      player?.controls?.(allowSeek);
    } catch {
      /* noop */
    }
    if (videoEl) {
      if (allowSeek) {
        videoEl.setAttribute('controls', '');
      } else {
        videoEl.removeAttribute('controls');
      }
    }
  }, [allowSeek]);

  // 再生・停止制御
  useEffect(() => {
    const player = playerRef.current;

    console.log(`[${id}] playback effect`, {
      hasPlayer: !!player,
      isReady,
      blockPlay,
      isVideoPlaying,
      offsetSeconds,
    });
    if (!player || !isReady) {
      console.log(`[${id}] playback effect exit - player not ready`);
      return;
    }

    if (blockPlay) {
      console.log(`[${id}] playback effect exit - blockPlay still true`);
      player.pause();
      return;
    }

    if (!isVideoPlaying) {
      console.log(`[${id}] playback effect exit - global play false`);
      player.pause();
      return;
    }

    const getVideoElement = (): HTMLVideoElement | null => {
      const root = player.el?.();
      if (!root) return null;
      return root.querySelector('video');
    };

    const tryPlay = () => {
      if (!player || player.paused() === false) {
        return;
      }

      const techEl = getVideoElement();
      console.log(`[${id}] tryPlay invoked`, {
        hasTech: !!techEl,
        readyState: techEl?.readyState,
        blockPlay,
      });
      if (!techEl || techEl.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        const handleCanPlay = () => {
          techEl?.removeEventListener('canplay', handleCanPlay);
          tryPlay();
        };

        if (techEl) {
          techEl.addEventListener('canplay', handleCanPlay, { once: true });
        } else {
          (
            player as Player & {
              one?: (event: string, cb: () => void) => void;
            }
          ).one?.('canplay', () => tryPlay());
        }
        return;
      }

      const playAttempt = player.play();
      console.log(`[${id}] play attempt issued`, {
        playAttempt,
      });
      if (
        playAttempt &&
        typeof (playAttempt as Promise<unknown>).then === 'function' &&
        typeof (playAttempt as Promise<unknown>).catch === 'function'
      ) {
        (playAttempt as Promise<unknown>)
          .then(() => {
            console.log(`[${id}] play resolved`);
            if (id !== 'video_0') {
              player.muted(false);
            }
          })
          .catch(() => {
            const retryTech = getVideoElement();
            console.log(`[${id}] play rejected`, {
              hasRetryTech: !!retryTech,
              readyState: retryTech?.readyState,
            });
            if (
              !retryTech ||
              retryTech.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
            ) {
              const handleCanPlayRetry = () => {
                retryTech?.removeEventListener('canplay', handleCanPlayRetry);
                tryPlay();
              };

              if (retryTech) {
                retryTech.addEventListener('canplay', handleCanPlayRetry, {
                  once: true,
                });
              } else {
                (
                  player as Player & {
                    one?: (event: string, cb: () => void) => void;
                  }
                ).one?.('canplay', () => tryPlay());
              }
              return;
            }
            player.muted(true);
            const retry = player.play();
            console.log(`[${id}] retry play`, { retry });
            if (
              retry &&
              typeof (retry as Promise<unknown>).then === 'function' &&
              typeof (retry as Promise<unknown>).catch === 'function'
            ) {
              (retry as Promise<unknown>)
                .then(() => {
                  console.log(`[${id}] retry resolved`);
                  if (id !== 'video_0') {
                    player.muted(false);
                  }
                })
                .catch(() => undefined);
            }
          });
      }
    };

    tryPlay();
  }, [isVideoPlaying, blockPlay, isReady, id]);

  // 再生速度制御
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !isReady) {
      return;
    }
    if (player.playbackRate() !== videoPlayBackRate) {
      player.playbackRate(videoPlayBackRate);
    }
  }, [videoPlayBackRate, isReady]);

  // 終端マスクの切り替え (Video.jsのtimeupdateイベントを使用)
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !isReady || durationSec <= 0) {
      setShowEndMask(false);
      return;
    }

    const handleTimeUpdate = () => {
      const t = player.currentTime?.() ?? 0;
      setShowEndMask(t >= durationSec - 0.08);
    };

    player.on?.('timeupdate', handleTimeUpdate);

    return () => {
      player.off?.('timeupdate', handleTimeUpdate);
    };
  }, [isReady, durationSec]);

  const overlayMessage = useMemo(() => {
    // blockPlayはoffsetSeconds基準で計算（SyncedVideoPlayerから渡される）
    if (blockPlay) {
      return '同期オフセットを待機中…';
    }
    if (showEndMask) {
      return '再生終了';
    }
    return null;
  }, [blockPlay, showEndMask]);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'absolute',
        inset: 0,
        '& .video-js': {
          height: '100%',
          width: '100%',
          backgroundColor: '#000',
        },
        '& .vjs-tech': {
          objectFit: 'contain', // 縦横比を保持、映像全体を表示
        },
      }}
    >
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered"
        id={id}
        controls={allowSeek}
        preload="auto"
        playsInline
      />
      {overlayMessage && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(12,12,15,0.72)',
            backdropFilter: 'blur(6px)',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" color="common.white">
            {overlayMessage}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export const MemoizedSingleVideoPlayer = React.memo(
  SingleVideoPlayer,
  (prev, next) => {
    // 基本的なプロパティの変更チェック
    if (prev.videoSrc !== next.videoSrc) {
      console.log(`[Memo ${next.id}] videoSrc changed`);
      return false;
    }
    if (prev.id !== next.id) {
      console.log(`[Memo ${next.id}] id changed`);
      return false;
    }
    if (prev.isVideoPlaying !== next.isVideoPlaying) {
      console.log(
        `[Memo ${next.id}] isVideoPlaying changed: ${prev.isVideoPlaying} -> ${next.isVideoPlaying}`,
      );
      return false;
    }
    if (prev.videoPlayBackRate !== next.videoPlayBackRate) {
      console.log(`[Memo ${next.id}] videoPlayBackRate changed`);
      return false;
    }
    if (prev.blockPlay !== next.blockPlay) {
      console.log(
        `[Memo ${next.id}] blockPlay changed: ${prev.blockPlay} -> ${next.blockPlay}`,
      );
      return false;
    }
    if (prev.allowSeek !== next.allowSeek) {
      console.log(`[Memo ${next.id}] allowSeek changed`);
      return false;
    }
    if (
      Math.abs((prev.offsetSeconds ?? 0) - (next.offsetSeconds ?? 0)) > 0.001
    ) {
      console.log(
        `[Memo ${next.id}] offsetSeconds changed: ${prev.offsetSeconds} -> ${next.offsetSeconds}`,
      );
      return false;
    }
    if (prev.setMaxSec !== next.setMaxSec) {
      console.log(`[Memo ${next.id}] setMaxSec changed`);
      return false;
    }

    // forceUpdateが変更された場合は必ず再レンダリング
    if (prev.forceUpdate !== next.forceUpdate) {
      console.log(
        `[Memo ${next.id}] forceUpdate changed: ${prev.forceUpdate} -> ${next.forceUpdate}`,
      );
      return false;
    }

    // currentTimeによる再レンダリングを削除 - Video.js自身が時刻管理
    // 変更なし - 再レンダリングをスキップ
    return true;
  },
);
