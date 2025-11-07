import { useState, useCallback, DragEvent } from 'react';

export interface DragAndDropState {
  isDragging: boolean;
  isValidDrop: boolean;
}

export const useDragAndDrop = (
  onPackageDrop: (packagePath: string) => void,
) => {
  const [dragState, setDragState] = useState<DragAndDropState>({
    isDragging: false,
    isValidDrop: false,
  });

  const validateDrop = useCallback((path: string): boolean => {
    // パッケージディレクトリかどうかを簡易チェック
    // 実際の検証はonPackageDrop内で行う
    return path.length > 0 && !path.includes('.mp4') && !path.includes('.mov');
  }, []);

  const handleDragEnter = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const item = e.dataTransfer.items[0];
      // ディレクトリの場合のみ有効化
      const isValid = item.kind === 'file';

      setDragState({
        isDragging: true,
        isValidDrop: isValid,
      });
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // ドロップを許可
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // 子要素へのドラッグ移動を無視
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (
      x <= rect.left ||
      x >= rect.right ||
      y <= rect.top ||
      y >= rect.bottom
    ) {
      setDragState({
        isDragging: false,
        isValidDrop: false,
      });
    }
  }, []);

  const handleDrop = useCallback(
    async (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();

      setDragState({
        isDragging: false,
        isValidDrop: false,
      });

      // ドロップされたファイル/フォルダを取得
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        // @ts-expect-error - Electron環境では path プロパティが存在する
        const filePath = file.path as string | undefined;

        if (filePath && validateDrop(filePath)) {
          onPackageDrop(filePath);
        }
      }
    },
    [onPackageDrop, validateDrop],
  );

  return {
    dragState,
    handlers: {
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
};
