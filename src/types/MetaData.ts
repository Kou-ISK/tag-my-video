import { VideoSyncData } from './VideoSync';

export type MetaData = {
  tightViewPath: string;
  wideViewPath: string | null;
  team1Name: string;
  team2Name: string;
  actionList: string[];
  syncData?: VideoSyncData; // 映像同期データ
};
