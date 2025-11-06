import { TimelineData } from '../../../../types/TimelineData';
import {
  CreateMomentumDataFn,
  MomentumOutcome,
  MomentumSegment,
} from '../../../../types/Analysis';

const POSSESSION_KEYWORD = 'ポゼッション';

const NEGATIVE_RESULTS: readonly string[] = [
  'Kick Error',
  'Pen Con',
  'Turnover',
  'Turnover (Scrum)',
];

const POSITIVE_RESULTS: readonly string[] = [
  'Try',
  'Drop Goal',
  'Pen Won',
  'Scrum',
  'Own Lineout',
];

const resolveOutcome = (result?: string | null): MomentumOutcome => {
  if (result === 'Try') {
    return 'Try';
  }
  if (result && NEGATIVE_RESULTS.includes(result)) {
    return 'Negative';
  }
  if (result && POSITIVE_RESULTS.includes(result)) {
    return 'Positive';
  }
  return 'Neutral';
};

const resolveTeamName = (actionName: string, team1: string, team2: string) => {
  if (actionName.includes(team1)) return team1;
  if (actionName.includes(team2)) return team2;
  return team1;
};

const buildSegment = (
  entry: TimelineData,
  teamName: string,
  team1: string,
): MomentumSegment => {
  const duration = Math.max(0, entry.endTime - entry.startTime);
  const value = teamName === team1 ? -duration : duration;
  return {
    teamName,
    value,
    absoluteValue: duration,
    possessionStart: entry.actionType || '開始情報なし',
    possessionResult: entry.actionResult || '結果なし',
    outcome: resolveOutcome(entry.actionResult),
  };
};

export const createMomentumDataFactory = (
  timeline: TimelineData[],
): CreateMomentumDataFn => {
  return (team1Name, team2Name) => {
    const segments = timeline
      .filter((item) => item.actionName.includes(POSSESSION_KEYWORD))
      .map((item) => {
        const teamName = resolveTeamName(item.actionName, team1Name, team2Name);
        return buildSegment(item, teamName, team1Name);
      });
    return segments;
  };
};
