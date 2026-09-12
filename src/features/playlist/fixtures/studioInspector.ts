import type { StudioSidebarViewProps } from '../studio/StudioSidebarView';
import { studioObjects } from './studio';

/** 外部保存や解析を呼ばず、狭いパネル内の長い操作ラベルを確認する。 */
export const studioInspectorFixture: Pick<
  StudioSidebarViewProps,
  'tracking' | 'presets'
> = {
  tracking: {
    available: true,
    running: false,
    progress: 0,
    hasResult: true,
    message: '追尾できた範囲を適用してから、位置を修正できます。',
    onStart: () => {},
    onCancel: () => {},
    onApply: () => {},
    onDiscard: () => {},
  },
  presets: {
    preferences: {
      presets: [
        {
          id: 'long-name',
          name: 'ゴール前の守備ラインとサポート選手の位置を確認するプリセット',
          object: studioObjects[0],
        },
      ],
      coachTools: ['disc', 'linkedDiscs'],
      coachColors: ['#FFD60A', '#FFFFFF', '#64A9FF', '#FF453A'],
    },
    name: '',
    error: '',
    canSave: false,
    enabled: true,
    onNameChange: () => {},
    onSave: () => {},
    onInsert: () => {},
    onDelete: () => {},
    onCoachToolToggle: () => {},
    onCoachColorChange: () => {},
  },
};
