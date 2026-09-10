import {
  prepareChromaForeground,
  restoreChromaForeground,
} from './exportChroma';
import type { ChromaKey } from '../../../src/shared/tactics/chromaKey';
import { overlayMotion } from './exportMotionOverlays';
import type { ExportMotionOverlay } from './exportMotionOverlays';
import { insertFreeze, overlayFreeze } from './exportFreezeFrames';
import type { ExportFreezeFrame } from './exportFreezeFrames';
import { buildOverlayFilters } from './exportFfmpegOverlay';
import {
  concatFfmpegFiles,
  runFfmpegProcess,
  type FfmpegProcessProgressOptions,
} from './exportFfmpegProcess';
import { H264_ENCODER_ARGS } from '../mediaTools';

export interface ExportClipForFfmpeg {
  chromaKey?: Partial<Record<'primary' | 'secondary', ChromaKey>>;
  hasAudio?: boolean;
  motionOverlays?: ExportMotionOverlay[];
  freezeFrames?: ExportFreezeFrame[];
  startTime: number;
  endTime: number;
  freezeAt?: number | null;
  freezeDuration?: number;
  sourceOverride?: string;
  secondarySourceOverride?: string;
}

export interface OverlayLine {
  text: string;
  isBold: boolean;
}

interface RunSingleParams {
  getFfmpegPath: () => string;
  sourcePath: string;
  clip: ExportClipForFfmpeg;
  outputPath: string;
  overlayEnabled: boolean;
  overlayLines: OverlayLine[];
  annotationPath?: string | null;
  getJapaneseFontPath: (isBold?: boolean) => string;
  escapeDrawtext: (text: string) => string;
  onProgress?: (progress: number) => void;
}

interface RunDualParams {
  getFfmpegPath: () => string;
  mainSource: string;
  secondarySource?: string | null;
  clip: ExportClipForFfmpeg;
  outputPath: string;
  overlayEnabled: boolean;
  overlayLines: OverlayLine[];
  annotationPrimary?: string | null;
  annotationSecondary?: string | null;
  getJapaneseFontPath: (isBold?: boolean) => string;
  escapeDrawtext: (text: string) => string;
  onProgress?: (progress: number) => void;
}

const runWithOptionalProgress = (
  getFfmpegPath: () => string,
  args: string[],
  durationSeconds: number,
  onProgress?: (progress: number) => void,
): Promise<void> =>
  onProgress
    ? runFfmpegProcess(getFfmpegPath, args, {
        durationSeconds,
        onProgress,
      })
    : runFfmpegProcess(getFfmpegPath, args);

const canUseStreamCopyForSingle = ({
  overlayEnabled,
  annotationPath,
  clip,
}: Pick<
  RunSingleParams,
  'overlayEnabled' | 'annotationPath' | 'clip'
>): boolean => {
  const hasFreeze =
    clip.freezeAt !== null &&
    clip.freezeAt !== undefined &&
    (clip.freezeDuration ?? 0) > 0;
  return (
    !overlayEnabled &&
    !annotationPath &&
    !hasFreeze &&
    !clip.freezeFrames?.length &&
    !clip.motionOverlays?.length
  );
};

export const runFfmpegSingle = ({
  getFfmpegPath,
  sourcePath,
  clip,
  outputPath,
  overlayEnabled,
  overlayLines,
  annotationPath,
  getJapaneseFontPath,
  escapeDrawtext,
  onProgress,
}: RunSingleParams): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const actualSource = clip.sourceOverride || sourcePath;
    const clipDuration = Math.max(0.5, clip.endTime - clip.startTime);

    if (canUseStreamCopyForSingle({ overlayEnabled, annotationPath, clip })) {
      runWithOptionalProgress(
        getFfmpegPath,
        [
          '-y',
          '-ss',
          String(clip.startTime),
          '-i',
          actualSource,
          '-t',
          String(clipDuration),
          '-map',
          '0:v',
          '-map',
          '0:a?',
          '-c',
          'copy',
          '-avoid_negative_ts',
          'make_zero',
          outputPath,
        ],
        clipDuration,
        onProgress,
      )
        .then(resolve)
        .catch(reject);
      return;
    }

    const vfTexts = overlayEnabled
      ? buildOverlayFilters({
          overlayLines,
          getJapaneseFontPath,
          escapeDrawtext,
          variant: 'single',
        })
      : [];

    const filterSteps: string[] = [];
    let baseLabel = '[0:v]';
    let mapLabel = '0:v';
    let audioMap = '0:a?';
    const inputArgs = ['-y', '-i', actualSource];

    filterSteps.push(
      `[0:v]trim=start=${clip.startTime}:end=${clip.endTime},setpts=PTS-STARTPTS[vtrim]`,
    );
    filterSteps.push(
      clip.hasAudio === false
        ? `anullsrc=r=48000:cl=stereo,atrim=duration=${clipDuration}[atrim]`
        : `[0:a]atrim=start=${clip.startTime}:end=${clip.endTime},asetpts=PTS-STARTPTS[atrim]`,
    );
    baseLabel = '[vtrim]';
    mapLabel = '[vtrim]';
    audioMap = '[atrim]';
    baseLabel = prepareChromaForeground(
      filterSteps,
      baseLabel,
      clip.chromaKey?.primary,
      'chroma',
    );
    const motion = overlayMotion(
      filterSteps,
      inputArgs,
      baseLabel,
      clip.motionOverlays ?? [],
      'primary',
      1,
    );
    baseLabel = restoreChromaForeground(
      filterSteps,
      motion.label,
      clip.chromaKey?.primary,
      'chroma',
    );

    const frames =
      clip.freezeFrames ??
      (clip.freezeAt != null
        ? [
            {
              time: clip.freezeAt,
              duration: clip.freezeDuration ?? 0,
              primary: annotationPath,
            },
          ]
        : []);
    const ordered = [...frames].sort((a, b) => a.time - b.time);
    let insertedDuration = 0;
    for (const [index, frame] of ordered.entries()) {
      if (frame.duration <= 0) continue;
      const time =
        Math.max(0, Math.min(frame.time, clipDuration)) + insertedDuration;
      baseLabel = insertFreeze(
        filterSteps,
        baseLabel,
        time,
        frame.duration,
        `f${index}v`,
      );
      audioMap = insertFreeze(
        filterSteps,
        audioMap,
        time,
        frame.duration,
        `f${index}a`,
        true,
      );
      insertedDuration += frame.duration;
    }
    let imageIndex = motion.inputIndex;
    insertedDuration = 0;
    for (const [index, frame] of ordered.entries()) {
      const time =
        Math.max(0, Math.min(frame.time, clipDuration)) + insertedDuration;
      const result = overlayFreeze(
        filterSteps,
        inputArgs,
        baseLabel,
        frame.primary,
        imageIndex,
        time,
        frame.duration,
        `ann${index}`,
      );
      baseLabel = result.label;
      imageIndex = result.inputIndex;
      insertedDuration += Math.max(0, frame.duration);
    }
    // Legacy annotations without a freeze retain their full-clip overlay.
    if (!frames.length && annotationPath) {
      baseLabel = overlayFreeze(
        filterSteps,
        inputArgs,
        baseLabel,
        annotationPath,
        imageIndex,
        0,
        clipDuration,
        'ann',
      ).label;
    }
    mapLabel = baseLabel;

    if (vfTexts.length) {
      filterSteps.push(`${baseLabel}${vfTexts.join(',')}[vout]`);
      mapLabel = '[vout]';
    }

    const args = [...inputArgs];
    if (filterSteps.length) {
      args.push('-filter_complex', filterSteps.join(';'), '-map', mapLabel);
    } else {
      args.push('-map', '0:v');
    }

    args.push(
      ...H264_ENCODER_ARGS,
      '-c:a',
      'aac',
      '-map',
      audioMap,
      outputPath,
    );

    const durationSeconds = clipDuration + insertedDuration;
    runWithOptionalProgress(getFfmpegPath, args, durationSeconds, onProgress)
      .then(resolve)
      .catch(reject);
  });
};

export const runFfmpegDual = ({
  getFfmpegPath,
  mainSource,
  secondarySource,
  clip,
  outputPath,
  overlayEnabled,
  overlayLines,
  annotationPrimary,
  annotationSecondary,
  getJapaneseFontPath,
  escapeDrawtext,
  onProgress,
}: RunDualParams): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const actualMainSource = clip.sourceOverride || mainSource;
    const actualSecondarySource =
      clip.secondarySourceOverride || secondarySource;
    if (!actualSecondarySource) {
      reject(new Error('2画面結合に必要な第2ソースがありません'));
      return;
    }

    const filterSteps: string[] = [];
    let mainLabel = '[0:v]';
    let subLabel = '[1:v]';
    let audioMap = '0:a?';
    const clipDuration = Math.max(0.5, clip.endTime - clip.startTime);
    const inputs = ['-y', '-i', actualMainSource, '-i', actualSecondarySource];
    let currentInputIndex = 2;

    filterSteps.push(
      `[0:v]trim=start=${clip.startTime}:end=${clip.endTime},setpts=PTS-STARTPTS[mtrim]`,
    );
    filterSteps.push(
      clip.hasAudio === false
        ? `anullsrc=r=48000:cl=stereo,atrim=duration=${clipDuration}[atrim]`
        : `[0:a]atrim=start=${clip.startTime}:end=${clip.endTime},asetpts=PTS-STARTPTS[atrim]`,
    );
    filterSteps.push(
      `[1:v]trim=start=${clip.startTime}:end=${clip.endTime},setpts=PTS-STARTPTS[strim]`,
    );

    mainLabel = '[mtrim]';
    subLabel = '[strim]';
    audioMap = '[atrim]';
    mainLabel = prepareChromaForeground(
      filterSteps,
      mainLabel,
      clip.chromaKey?.primary,
      'chromaP',
    );
    subLabel = prepareChromaForeground(
      filterSteps,
      subLabel,
      clip.chromaKey?.secondary,
      'chromaS',
    );
    const mainMotion = overlayMotion(
      filterSteps,
      inputs,
      mainLabel,
      clip.motionOverlays ?? [],
      'primary',
      currentInputIndex,
    );
    mainLabel = restoreChromaForeground(
      filterSteps,
      mainMotion.label,
      clip.chromaKey?.primary,
      'chromaP',
    );
    const subMotion = overlayMotion(
      filterSteps,
      inputs,
      subLabel,
      clip.motionOverlays ?? [],
      'secondary',
      mainMotion.inputIndex,
    );
    subLabel = restoreChromaForeground(
      filterSteps,
      subMotion.label,
      clip.chromaKey?.secondary,
      'chromaS',
    );
    currentInputIndex = subMotion.inputIndex;

    const frames =
      clip.freezeFrames ??
      (clip.freezeAt != null
        ? [
            {
              time: clip.freezeAt,
              duration: clip.freezeDuration ?? 0,
              primary: annotationPrimary,
              secondary: annotationSecondary,
            },
          ]
        : []);
    const ordered = [...frames].sort((a, b) => a.time - b.time);
    let insertedDuration = 0;
    for (const [index, frame] of ordered.entries()) {
      if (frame.duration <= 0) continue;
      const time =
        Math.max(0, Math.min(frame.time, clipDuration)) + insertedDuration;
      mainLabel = insertFreeze(
        filterSteps,
        mainLabel,
        time,
        frame.duration,
        `f${index}m`,
      );
      subLabel = insertFreeze(
        filterSteps,
        subLabel,
        time,
        frame.duration,
        `f${index}s`,
      );
      audioMap = insertFreeze(
        filterSteps,
        audioMap,
        time,
        frame.duration,
        `f${index}a`,
        true,
      );
      insertedDuration += frame.duration;
    }
    insertedDuration = 0;
    for (const [index, frame] of ordered.entries()) {
      const time =
        Math.max(0, Math.min(frame.time, clipDuration)) + insertedDuration;
      const primary = overlayFreeze(
        filterSteps,
        inputs,
        mainLabel,
        frame.primary,
        currentInputIndex,
        time,
        frame.duration,
        `p${index}`,
      );
      mainLabel = primary.label;
      currentInputIndex = primary.inputIndex;
      const secondary = overlayFreeze(
        filterSteps,
        inputs,
        subLabel,
        frame.secondary,
        currentInputIndex,
        time,
        frame.duration,
        `s${index}`,
      );
      subLabel = secondary.label;
      currentInputIndex = secondary.inputIndex;
      insertedDuration += Math.max(0, frame.duration);
    }
    if (!frames.length) {
      const primary = overlayFreeze(
        filterSteps,
        inputs,
        mainLabel,
        annotationPrimary,
        currentInputIndex,
        0,
        clipDuration,
        'p',
      );
      mainLabel = primary.label;
      currentInputIndex = primary.inputIndex;
      subLabel = overlayFreeze(
        filterSteps,
        inputs,
        subLabel,
        annotationSecondary,
        currentInputIndex,
        0,
        clipDuration,
        's',
      ).label;
    }

    filterSteps.push(`${mainLabel}${subLabel}hstack=inputs=2[vbase]`);

    if (overlayEnabled) {
      const overlayFilters = buildOverlayFilters({
        overlayLines,
        getJapaneseFontPath,
        escapeDrawtext,
        variant: 'dual',
      });
      filterSteps.push(`[vbase]${overlayFilters.join(',')}[vout]`);
    } else {
      filterSteps.push('[vbase]null[vout]');
    }

    const args = [
      ...inputs,
      '-filter_complex',
      filterSteps.join(';'),
      '-map',
      '[vout]',
      '-map',
      audioMap,
      ...H264_ENCODER_ARGS,
      '-c:a',
      'aac',
      outputPath,
    ];

    const durationSeconds = clipDuration + insertedDuration;
    runWithOptionalProgress(getFfmpegPath, args, durationSeconds, onProgress)
      .then(resolve)
      .catch(reject);
  });
};

export const concatFiles = async (
  getFfmpegPath: () => string,
  files: string[],
  outputPath: string,
  progressOptions?: FfmpegProcessProgressOptions,
): Promise<void> => {
  await concatFfmpegFiles(getFfmpegPath, files, outputPath, progressOptions);
};
