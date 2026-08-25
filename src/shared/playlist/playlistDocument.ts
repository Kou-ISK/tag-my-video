import type {
  Playlist,
  PlaylistItem,
  PlaylistRow,
} from '../../types/playlist/core';
import { PLAYLIST_DOCUMENT_SCHEMA_VERSION } from '../../types/playlist/core';

export const DEFAULT_PLAYLIST_ROW_NAME = 'クリップ';

const defaultRowId = (playlistId: string): string =>
  `${playlistId}:default-row`;

const isFiniteOrder = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const compareByOrder = <T extends { order?: number }>(a: T, b: T): number =>
  (isFiniteOrder(a.order) ? a.order : Number.MAX_SAFE_INTEGER) -
  (isFiniteOrder(b.order) ? b.order : Number.MAX_SAFE_INTEGER);

const createDefaultRow = (playlistId: string): PlaylistRow => ({
  id: defaultRowId(playlistId),
  name: DEFAULT_PLAYLIST_ROW_NAME,
  enabled: true,
  order: 0,
});

const normalizeRows = (
  playlistId: string,
  rows: PlaylistRow[] | undefined,
): PlaylistRow[] => {
  const sourceRows = (Array.isArray(rows) ? rows : []).filter(
    (row) => row && typeof row.id === 'string',
  );
  const uniqueRows: PlaylistRow[] = [];
  const ids = new Set<string>();

  for (const row of [...sourceRows].sort(compareByOrder)) {
    if (ids.has(row.id)) continue;
    ids.add(row.id);
    uniqueRows.push({
      id: row.id,
      name: row.name || DEFAULT_PLAYLIST_ROW_NAME,
      ...(row.color ? { color: row.color } : {}),
      enabled: row.enabled !== false,
      order: uniqueRows.length,
    });
  }

  if (uniqueRows.length > 0) return uniqueRows;
  return [createDefaultRow(playlistId)];
};

const normalizeItems = (
  items: PlaylistItem[],
  rows: PlaylistRow[],
): PlaylistItem[] => {
  const validRowIds = new Set(rows.map((row) => row.id));
  const fallbackRowId = rows[0].id;
  const counters = new Map<string, number>();
  const grouped = new Map<string, Array<{ item: PlaylistItem; index: number }>>();

  items.forEach((item, index) => {
    const rowId = item.rowId && validRowIds.has(item.rowId)
      ? item.rowId
      : fallbackRowId;
    const group = grouped.get(rowId) ?? [];
    group.push({ item, index });
    grouped.set(rowId, group);
  });

  for (const group of grouped.values()) {
    group.sort((a, b) => {
      const aOrder = isFiniteOrder(a.item.rowOrder)
        ? a.item.rowOrder
        : Number.MAX_SAFE_INTEGER;
      const bOrder = isFiniteOrder(b.item.rowOrder)
        ? b.item.rowOrder
        : Number.MAX_SAFE_INTEGER;
      return aOrder - bOrder || a.index - b.index;
    });
  }

  const orderById = new Map<string, number>();
  for (const [rowId, group] of grouped) {
    group.forEach(({ item }, order) => {
      orderById.set(item.id, order);
    });
    counters.set(rowId, group.length);
  }

  return items.map((item) => {
    const rowId = item.rowId && validRowIds.has(item.rowId)
      ? item.rowId
      : fallbackRowId;
    const itemOrder = orderById.get(item.id) ?? counters.get(rowId) ?? 0;
    return { ...item, rowId, rowOrder: itemOrder };
  });
};

/**
 * Converts legacy and current playlist payloads into one canonical document.
 * The function never mutates the input and is idempotent.
 */
export const normalizePlaylistDocument = (playlist: Playlist): Playlist => {
  const rows = normalizeRows(playlist.id, playlist.rows);
  const items = normalizeItems(playlist.items, rows);
  return {
    ...playlist,
    rows,
    items,
    schemaVersion: PLAYLIST_DOCUMENT_SCHEMA_VERSION,
  };
};

/** Explicit name for callers handling a v1 `.stpl` payload. */
export const migratePlaylistDocument = normalizePlaylistDocument;

/** Returns the only order used by playback, Organizer and export. */
export const getPresentationItems = (playlist: Playlist): PlaylistItem[] => {
  const normalized = normalizePlaylistDocument(playlist);
  const rowOrder = new Map(
    normalized.rows?.map((row) => [row.id, row.order]) ?? [],
  );
  return normalized.items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const rowDelta =
        (rowOrder.get(a.item.rowId ?? '') ?? Number.MAX_SAFE_INTEGER) -
        (rowOrder.get(b.item.rowId ?? '') ?? Number.MAX_SAFE_INTEGER);
      return rowDelta ||
        (a.item.rowOrder ?? Number.MAX_SAFE_INTEGER) -
          (b.item.rowOrder ?? Number.MAX_SAFE_INTEGER) ||
        a.index - b.index;
    })
    .map(({ item }) => item);
};

export const getPresentationItemIds = (playlist: Playlist): string[] =>
  getPresentationItems(playlist).map((item) => item.id);

export const createPlaylistRow = (
  playlist: Playlist,
  name: string,
  options: Pick<PlaylistRow, 'enabled' | 'color'> = { enabled: true },
): PlaylistRow => {
  const rows = normalizePlaylistDocument(playlist).rows ?? [];
  return {
    id: crypto.randomUUID(),
    name,
    enabled: options.enabled,
    ...(options.color ? { color: options.color } : {}),
    order: rows.length,
  };
};

export const renamePlaylistRow = (
  playlist: Playlist,
  rowId: string,
  name: string,
): Playlist => {
  const normalized = normalizePlaylistDocument(playlist);
  return {
    ...normalized,
    rows: normalized.rows?.map((row) =>
      row.id === rowId ? { ...row, name } : row,
    ),
  };
};

export const removePlaylistRow = (
  playlist: Playlist,
  rowId: string,
): Playlist => {
  const normalized = normalizePlaylistDocument(playlist);
  const rows = normalized.rows ?? [];
  if (rows.length <= 1 || !rows.some((row) => row.id === rowId)) {
    return normalized;
  }
  const remainingRows = rows
    .filter((row) => row.id !== rowId)
    .map((row, order) => ({ ...row, order }));
  const fallbackRowId = remainingRows[0].id;
  let fallbackOrder = normalized.items.filter(
    (item) => item.rowId === fallbackRowId,
  ).length;
  return {
    ...normalized,
    rows: remainingRows,
    items: normalized.items.map((item) =>
      item.rowId === rowId
        ? { ...item, rowId: fallbackRowId, rowOrder: fallbackOrder++ }
        : item,
    ),
  };
};

export const reorderPlaylistRows = (
  playlist: Playlist,
  fromIndex: number,
  toIndex: number,
): Playlist => {
  const normalized = normalizePlaylistDocument(playlist);
  const rows = [...(normalized.rows ?? [])];
  if (
    fromIndex < 0 ||
    fromIndex >= rows.length ||
    toIndex < 0 ||
    toIndex >= rows.length ||
    fromIndex === toIndex
  ) return normalized;
  const [row] = rows.splice(fromIndex, 1);
  rows.splice(toIndex, 0, row);
  return { ...normalized, rows: rows.map((entry, order) => ({ ...entry, order })) };
};

export const moveItemsToRow = (
  playlist: Playlist,
  itemIds: string[],
  rowId: string,
): Playlist => {
  const normalized = normalizePlaylistDocument(playlist);
  if (!normalized.rows?.some((row) => row.id === rowId)) return normalized;
  const moved = new Set(itemIds);
  const nextOrder = normalized.items.filter((item) => item.rowId === rowId).length;
  let order = nextOrder;
  return {
    ...normalized,
    items: normalized.items.map((item) =>
      moved.has(item.id)
        ? { ...item, rowId, rowOrder: order++ }
        : item,
    ),
  };
};

export const reorderItemsWithinRow = (
  playlist: Playlist,
  rowId: string,
  fromIndex: number,
  toIndex: number,
): Playlist => {
  const normalized = normalizePlaylistDocument(playlist);
  const rowItems = normalized.items
    .filter((item) => item.rowId === rowId)
    .sort((a, b) => (a.rowOrder ?? 0) - (b.rowOrder ?? 0));
  if (
    fromIndex < 0 ||
    fromIndex >= rowItems.length ||
    toIndex < 0 ||
    toIndex >= rowItems.length ||
    fromIndex === toIndex
  ) return normalized;
  const [item] = rowItems.splice(fromIndex, 1);
  rowItems.splice(toIndex, 0, item);
  const orderById = new Map(rowItems.map((entry, order) => [entry.id, order]));
  return {
    ...normalized,
    items: normalized.items.map((entry) =>
      orderById.has(entry.id)
        ? { ...entry, rowOrder: orderById.get(entry.id) }
        : entry,
    ),
  };
};
