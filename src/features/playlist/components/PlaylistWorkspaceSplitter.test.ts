import { describe, expect, it } from 'vitest';
import { clampWorkspaceRatio } from './PlaylistWorkspaceSplitter';

describe('clampWorkspaceRatio', () => {
  it('keeps the review area within usable bounds', () => {
    expect(clampWorkspaceRatio(-1)).toBe(0.2);
    expect(clampWorkspaceRatio(0.5)).toBe(0.5);
    expect(clampWorkspaceRatio(2)).toBe(0.8);
  });

  it('supports custom bounds for compact windows', () => {
    expect(clampWorkspaceRatio(0.1, 0.3, 0.7)).toBe(0.3);
    expect(clampWorkspaceRatio(0.9, 0.3, 0.7)).toBe(0.7);
  });
});
