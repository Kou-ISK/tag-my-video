import { describe, expect, it, vi } from 'vitest';
import { createExternalOpenQueue } from './packageOpenQueue';

describe('external open queue', () => {
  it('keeps requests in order while routing is asynchronous', async () => {
    const routed: string[] = [];
    let releaseFirst: (() => void) | undefined;
    const firstComplete = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    const queue = createExternalOpenQueue({
      route: async (filePath) => {
        if (filePath === 'a.stpkg') await firstComplete;
        routed.push(filePath);
      },
    });

    queue.enqueue('a.stpkg');
    queue.enqueue('b.stpkg');
    const draining = queue.drain();
    await Promise.resolve();
    expect(routed).toEqual([]);

    releaseFirst?.();
    await draining;
    expect(routed).toEqual(['a.stpkg', 'b.stpkg']);
  });

  it('continues after one route failure and reports it', async () => {
    const errors: string[] = [];
    const route = vi
      .fn<(filePath: string) => Promise<void>>()
      .mockRejectedValueOnce(new Error('invalid package'))
      .mockResolvedValueOnce(undefined);
    const queue = createExternalOpenQueue({
      route,
      onError: (filePath) => errors.push(filePath),
    });

    queue.enqueue('broken.stpkg');
    queue.enqueue('valid.stpkg');
    await queue.drain();

    expect(route).toHaveBeenNthCalledWith(1, 'broken.stpkg');
    expect(route).toHaveBeenNthCalledWith(2, 'valid.stpkg');
    expect(errors).toEqual(['broken.stpkg']);
  });
});
