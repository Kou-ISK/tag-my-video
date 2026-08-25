import type {
  ItemAnnotation,
  PlaylistItem,
  PlaylistType,
  PlaylistRow,
} from '../../../../types/playlist/core';
import type { PlaylistSyncData } from '../../../../types/playlist/window';
import { getPresentationItems } from '../../../../shared/playlist/playlistDocument';
import {
  resolveViewModeForItems,
  resolveViewModeForSources,
} from '../../utils/viewMode';

export interface PlaylistSyncSnapshot {
  items: PlaylistItem[];
  rows?: PlaylistRow[];
  playlistName: string;
  hasUnsavedChanges: boolean;
  itemAnnotations: Record<string, ItemAnnotation>;
  playlistType: PlaylistType;
  packagePath: string | null;
  videoSources: string[];
  viewMode: 'dual' | 'angle1';
}

export const extractItemAnnotations = (
  items: PlaylistItem[],
): Record<string, ItemAnnotation> => {
  const annotations: Record<string, ItemAnnotation> = {};
  for (const item of items) {
    if (item.annotation) {
      annotations[item.id] = item.annotation;
    }
  }
  return annotations;
};

export const buildPlaylistSyncSnapshot = (
  data: PlaylistSyncData,
): PlaylistSyncSnapshot | null => {
  const activePlaylist = data.state.playlists.find(
    (playlist) => playlist.id === data.state.activePlaylistId,
  );

  if (!activePlaylist) {
    return null;
  }

  const hasDocumentStructure =
    activePlaylist.rows !== undefined || activePlaylist.schemaVersion !== undefined;
  const items = hasDocumentStructure
    ? getPresentationItems(activePlaylist)
    : activePlaylist.items;
  const videoSources = data.videoSources ?? [];
  const viewMode =
    videoSources.length > 0
      ? resolveViewModeForSources(videoSources)
      : resolveViewModeForItems(items, data.state.playingItemId);

  return {
    items,
    ...(hasDocumentStructure ? { rows: activePlaylist.rows } : {}),
    playlistName: activePlaylist.name,
    hasUnsavedChanges: false,
    itemAnnotations: extractItemAnnotations(items),
    playlistType: activePlaylist.type,
    packagePath: data.packagePath ?? activePlaylist.sourcePackagePath ?? null,
    videoSources,
    viewMode,
  };
};
