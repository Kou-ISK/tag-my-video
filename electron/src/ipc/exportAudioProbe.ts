import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { getFfprobePath } from '../mediaTools';
const execute = promisify(execFile);
export const hasExportAudio = async (source: string): Promise<boolean> => {
  const { stdout } = await execute(
    getFfprobePath(),
    [
      '-v',
      'error',
      '-select_streams',
      'a:0',
      '-show_entries',
      'stream=index',
      '-of',
      'csv=p=0',
      source,
    ],
    { timeout: 15000, maxBuffer: 65536 },
  );
  return stdout.trim().length > 0;
};
