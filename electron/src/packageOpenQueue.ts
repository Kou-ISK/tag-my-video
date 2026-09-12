export interface ExternalOpenQueue {
  enqueue: (filePath: string) => void;
  drain: () => Promise<void>;
}

export interface ExternalOpenQueueOptions {
  route: (filePath: string) => Promise<void>;
  onError?: (filePath: string, error: unknown) => void;
}

/**
 * Serialize OS document-open requests so a slow package load cannot reorder
 * or drop a subsequent Finder/Explorer request.
 */
export const createExternalOpenQueue = ({
  route,
  onError = () => undefined,
}: ExternalOpenQueueOptions): ExternalOpenQueue => {
  const pending: string[] = [];
  let activeDrain: Promise<void> | null = null;

  const drain = async (): Promise<void> => {
    if (activeDrain) return activeDrain;

    activeDrain = (async () => {
      while (pending.length > 0) {
        const filePath = pending.shift();
        if (!filePath) continue;
        try {
          await route(filePath);
        } catch (error) {
          onError(filePath, error);
        }
      }
    })().finally(() => {
      activeDrain = null;
      if (pending.length > 0) void drain();
    });

    return activeDrain;
  };

  return {
    enqueue: (filePath: string): void => {
      pending.push(filePath);
    },
    drain,
  };
};
