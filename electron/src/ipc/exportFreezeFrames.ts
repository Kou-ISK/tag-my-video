export interface ExportFreezeFrame {
  time: number;
  duration: number;
  primary?: string | null;
  secondary?: string | null;
}

// Each insertion uses output time, including freezes inserted earlier.
export const insertFreeze = (
  filters: string[],
  label: string,
  time: number,
  duration: number,
  prefix: string,
  audio = false,
): string => {
  const output = `[${prefix}freeze]`;
  if (time === 0) {
    filters.push(
      audio
        ? `${label}adelay=delays=${duration * 1000}:all=1${output}`
        : `${label}tpad=start_mode=clone:start_duration=${duration}${output}`,
    );
    return output;
  }
  const trim = audio ? 'atrim' : 'trim';
  const pts = audio ? 'asetpts' : 'setpts';
  filters.push(
    `${label}${audio ? 'asplit' : 'split'}[${prefix}pre][${prefix}post]`,
  );
  filters.push(
    `[${prefix}pre]${trim}=end=${time},${pts}=PTS-STARTPTS,${audio ? `apad=pad_dur=${duration}` : `tpad=stop_mode=clone:stop_duration=${duration}`}[${prefix}pad]`,
  );
  filters.push(
    `[${prefix}post]${trim}=start=${time},${pts}=PTS-STARTPTS[${prefix}shift]`,
  );
  filters.push(
    `[${prefix}pad][${prefix}shift]concat=n=2:v=${audio ? 0 : 1}:a=${audio ? 1 : 0}${output}`,
  );
  return output;
};

export const overlayFreeze = (
  filters: string[],
  inputs: string[],
  label: string,
  image: string | null | undefined,
  inputIndex: number,
  time: number,
  duration: number,
  prefix: string,
): { label: string; inputIndex: number } => {
  if (!image) return { label, inputIndex };
  inputs.push('-i', image);
  filters.push(`[${inputIndex}:v]format=rgba[${prefix}raw]`);
  filters.push(
    `[${prefix}raw]${label}scale2ref[${prefix}scaled][${prefix}base]`,
  );
  filters.push(
    `[${prefix}base][${prefix}scaled]overlay=0:0:enable='between(t,${time},${time + duration})'[${prefix}out]`,
  );
  return { label: `[${prefix}out]`, inputIndex: inputIndex + 1 };
};
