import { useMemo } from 'react';
import { TimelineData } from '../../../../../../types/TimelineData';
import { CreateMomentumDataFn } from '../../../../../../types/Analysis';
import { rechartsData } from '../../../../../../types/RechartsData';
import { useAnalysis } from '../../../../analysis/hooks/useAnalysis';

interface UseStatsModalStateParams {
  timeline: TimelineData[];
  teamNames: string[];
}

export interface StatsModalDerivedState {
  possessionData: rechartsData[];
  hasTimelineData: boolean;
  resolvedTeamNames: string[];
  uniqueActionTypes: string[];
  uniqueActionResults: string[];
  countActionResultByTeamName: (
    teamName: string,
    actionName: string,
  ) => rechartsData[];
  countActionTypeByTeamName: (
    teamName: string,
    actionName: string,
  ) => rechartsData[];
  createMomentumData: CreateMomentumDataFn;
}

export const useStatsModalState = ({
  timeline,
  teamNames,
}: UseStatsModalStateParams): StatsModalDerivedState => {
  const {
    calculateActionDuration,
    countActionResultByTeamName,
    countActionTypeByTeamName,
    createMomentumData,
  } = useAnalysis(timeline);

  const possessionData = useMemo(
    () =>
      calculateActionDuration().filter((item) =>
        item.name.includes('ポゼッション'),
      ),
    [calculateActionDuration],
  );

  const hasTimelineData = timeline.length > 0;

  const resolvedTeamNames = useMemo(() => {
    const set = new Set<string>();
    teamNames.forEach((name) => set.add(name));
    timeline.forEach((item) => {
      const [team] = item.actionName.split(' ');
      if (team) {
        set.add(team);
      }
    });
    if (set.size === 0) {
      return ['チームA', 'チームB'];
    }
    return Array.from(set);
  }, [teamNames, timeline]);

  const uniqueActionTypes = useMemo(() => {
    const set = new Set<string>();
    timeline.forEach((item) => {
      const value = item.actionType || '未設定';
      set.add(value);
    });
    return Array.from(set).sort();
  }, [timeline]);

  const uniqueActionResults = useMemo(() => {
    const set = new Set<string>();
    timeline.forEach((item) => {
      const value = item.actionResult || '未設定';
      set.add(value);
    });
    return Array.from(set).sort();
  }, [timeline]);

  return {
    possessionData,
    hasTimelineData,
    resolvedTeamNames,
    uniqueActionTypes,
    uniqueActionResults,
    countActionResultByTeamName,
    countActionTypeByTeamName,
    createMomentumData,
  };
};
