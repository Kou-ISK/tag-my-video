import type { SCLabel } from '../timeline/sportscode';

export type PlaylistType = 'reference' | 'embedded';
export type DrawingToolType =
  | 'beam'
  | 'disc'
  | 'linkedDiscs'
  | 'curvedArrow'
  | 'ring'
  | 'spotlight'
  | 'polygon'
  | 'pen'
  | 'line'
  | 'arrow'
  | 'rectangle'
  | 'circle'
  | 'text'
  | 'select';
export type AnnotationTarget = 'primary' | 'secondary';
export type PlaylistLoopMode = 'none' | 'single' | 'all';

/** Current version of the on-disk Playlist Document contract. */
export const PLAYLIST_DOCUMENT_SCHEMA_VERSION = 2;

export interface PlaylistRow {
  id: string;
  name: string;
  color?: string;
  enabled: boolean;
  order: number;
}

export interface DrawingObject {
  id: string;
  type: DrawingToolType;
  color: string;
  strokeWidth: number;
  opacity?: number;
  dashed?: boolean;
  fill?: boolean;
  /** 曲線矢印の曲がり。始終点間距離に対する比率。 */
  curvature?: number;
  /** 選手リンクのディスク半径。保存時のキャンバス座標。 */
  discRadius?: number;
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
  path?: Array<{ x: number; y: number }>;
  text?: string;
  fontSize?: number;
  timestamp: number;
  target?: AnnotationTarget;
  baseWidth?: number;
  baseHeight?: number;
}

export interface ItemAnnotation {
  objects: DrawingObject[];
  freezeDuration: number;
  freezeAt: number;
}

export interface PlaylistAiMeta {
  reason?: string;
  centerId?: string;
  centerIds?: string[];
  evidenceIds?: string[];
  source?: 'ai-review';
}

export interface PlaylistItem {
  id: string;
  timelineItemId: string | null;
  actionName: string;
  startTime: number;
  endTime: number;
  labels?: SCLabel[];
  memo?: string;
  note?: string;
  addedAt: number;
  videoSource?: string;
  videoSource2?: string;
  annotation?: ItemAnnotation;
  aiMeta?: PlaylistAiMeta;
  /** Organizer row membership. Optional for source compatibility with v1 files. */
  rowId?: string;
  /** Zero-based order within the Organizer row. */
  rowOrder?: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  type: PlaylistType;
  items: PlaylistItem[];
  sourcePackagePath?: string;
  createdAt: number;
  updatedAt: number;
  /** Organizer rows. Missing on legacy flat documents and filled during load. */
  rows?: PlaylistRow[];
  /** Missing on legacy flat documents and filled during load. */
  schemaVersion?: number;
}

export interface PlaylistState {
  playlists: Playlist[];
  activePlaylistId: string | null;
  playingItemId: string | null;
  loopMode: PlaylistLoopMode;
}

export interface PlaylistSaveProgressPayload {
  current: number;
  total: number;
}

export interface PlaylistFileLoadResult {
  playlist: Playlist;
  filePath: string;
}
