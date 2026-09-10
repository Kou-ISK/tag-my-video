import type { Meta, StoryObj } from '@storybook/react-vite';
import { VideoPathSelectorView } from './VideoPathSelectorView';

const meta = {
  title: 'Workspace/Start',
  component: VideoPathSelectorView,
  args: {
    showWelcome: true,
    dragState: { isDragging: false, isValidDrop: false },
    dragHandlers: {},
    recentPackages: [],
    onOpenPackage: () => {},
    onOpenWizard: () => {},
    onOpenRecentPackage: () => {},
    onRemoveRecentPackage: () => {},
  },
} satisfies Meta<typeof VideoPathSelectorView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Empty: Story = {};
export const RecentMatches: Story = {
  args: {
    recentPackages: [
      {
        path: '/matches/final.stpkg',
        name: '決勝戦｜前半・後半レビュー',
        team1Name: 'ホーム',
        team2Name: 'アウェイ',
        videoCount: 2,
        lastOpened: 1788994800000,
      },
      {
        path: '/matches/round4.stpkg',
        name: '第4節｜ディフェンスから攻撃への切り替え・チーム全体レビュー',
        team1Name: '長いチーム名のホームチーム',
        team2Name: 'ビジターチーム',
        videoCount: 3,
        lastOpened: 1788908400000,
      },
    ],
  },
};
export const Light: Story = {
  ...RecentMatches,
  globals: { themeMode: 'light' },
};
export const ValidDrop: Story = {
  args: { dragState: { isDragging: true, isValidDrop: true } },
};
export const InvalidDrop: Story = {
  args: { dragState: { isDragging: true, isValidDrop: false } },
};
