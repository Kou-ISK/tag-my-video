import { useEffect } from 'react';
import { getPresentationItems, normalizePlaylistDocument } from '../../../../shared/playlist/playlistDocument';
import type {
  ItemAnnotation,
  PlaylistItem,
  PlaylistRow,
  PlaylistType,
} from '../../../../types/playlist/core';
import { registerPlaylistIpcHandlers } from './playlistIpcGateway';
import { buildPlaylistSyncSnapshot } from './playlistSyncSnapshot';

interface UsePlaylistIpcSyncParams {
  setItemsWithHistory: React.Dispatch<React.SetStateAction<PlaylistItem[]>>;
  setPlaylistName: React.Dispatch<React.SetStateAction<string>>;
  setHasUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>;
  setItemAnnotations: React.Dispatch<
    React.SetStateAction<Record<string, ItemAnnotation>>
  >;
  setPlaylistType: React.Dispatch<React.SetStateAction<PlaylistType>>;
  setPlaylistRows: React.Dispatch<React.SetStateAction<PlaylistRow[]>>;
  playlistRows: PlaylistRow[];
  setPackagePath: React.Dispatch<React.SetStateAction<string | null>>;
  setVideoSources: React.Dispatch<React.SetStateAction<string[]>>;
  setViewMode: React.Dispatch<
    React.SetStateAction<'dual' | 'angle1' | 'angle2'>
  >;
  setSaveProgress: React.Dispatch<
    React.SetStateAction<{ current: number; total: number } | null>
  >;
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
}

export const usePlaylistIpcSync = ({
  setItemsWithHistory,
  setPlaylistName,
  setHasUnsavedChanges,
  setItemAnnotations,
  setPlaylistType,
  setPlaylistRows,
  playlistRows,
  setPackagePath,
  setVideoSources,
  setViewMode,
  setSaveProgress,
  setIsDirty,
}: UsePlaylistIpcSyncParams): void => {
  useEffect(() => {
    const handlePlaylistSync = (
      data: Parameters<typeof buildPlaylistSyncSnapshot>[0],
    ): void => {
      const snapshot = buildPlaylistSyncSnapshot(data);
      if (!snapshot) {
        return;
      }

      setItemsWithHistory(snapshot.items);
      setPlaylistName(snapshot.playlistName);
      setHasUnsavedChanges(snapshot.hasUnsavedChanges);
      setItemAnnotations(snapshot.itemAnnotations);
      setPlaylistType(snapshot.playlistType);
      setPlaylistRows(snapshot.rows ?? []);
      setPackagePath(snapshot.packagePath);
      setVideoSources(snapshot.videoSources);
      setViewMode(snapshot.viewMode);
    };

    const handleSaveProgress = (data: {
      current: number;
      total: number;
    }): void => {
      setSaveProgress(data);
    };

    const handleAddItem = (item: PlaylistItem): void => {
      setItemsWithHistory((prev: PlaylistItem[]) => {
        const normalized = normalizePlaylistDocument({
          id: 'playlist-window',
          name: 'Playlist Window',
          type: 'embedded',
          rows: playlistRows,
          items: [...prev, item],
          createdAt: 0,
          updatedAt: 0,
        });
        return getPresentationItems(normalized);
      });
      setHasUnsavedChanges(true);
      setIsDirty(true);
    };

    let cleanup = (): void => {};
    try {
      cleanup = registerPlaylistIpcHandlers({
        onSync: handlePlaylistSync,
        onSaveProgress: handleSaveProgress,
        onAddItem: handleAddItem,
      });
    } catch (error: unknown) {
      console.debug(
        '[PlaylistWindow] Failed to register playlist IPC handlers',
        error,
      );
    }

    return () => {
      try {
        cleanup();
      } catch (error: unknown) {
        console.debug(
          '[PlaylistWindow] Failed to cleanup playlist IPC handlers',
          error,
        );
      }
    };
  }, [
    setHasUnsavedChanges,
    setIsDirty,
    setItemAnnotations,
    setItemsWithHistory,
    setPackagePath,
    setPlaylistName,
    setPlaylistType,
    setPlaylistRows,
    playlistRows,
    setSaveProgress,
    setVideoSources,
    setViewMode,
  ]);
};
