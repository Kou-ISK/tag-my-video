import { TimelineData } from '../types/TimelineData';
import { rechartsData } from '../types/RechartsData';
import {
  CreateMomentumDataFn,
  MomentumOutcome,
  MomentumSegment,
} from '../types/Analysis';

export const useAnalysis = (timeline: TimelineData[]) => {
  const rechartsDataComparator = (x: rechartsData, y: rechartsData) => {
    return -x.name.localeCompare(y.name);
  };

  const calculateActionDuration = () => {
    const actionData: rechartsData[] = [];
    timeline.forEach((item) => {
      const { actionName, startTime, endTime } = item;
      const duration = endTime - startTime;

      // actionDataに対応するアクション名がすでに存在するかチェック
      const existingAction = actionData.find(
        (action) => action.name === actionName,
      );

      if (existingAction) {
        // すでに存在する場合、durationを加算
        existingAction.value += duration;
      } else {
        // 存在しない場合、新しいアクションを追加
        actionData.push({ name: actionName, value: duration });
      }
    });
    return actionData.sort((a, b) => b.value - a.value);
  };

  const countActions = (): rechartsData[] => {
    const actionData: rechartsData[] = [];
    timeline.forEach((item) => {
      // actionDataに対応するアクション名がすでに存在するかチェック
      const existingAction = actionData.find(
        (action) => action.name === item.actionName,
      );

      if (existingAction) {
        // すでに存在する場合、durationを加算
        existingAction.value += 1;
      } else {
        // 存在しない場合、新しいアクションを追加
        actionData.push({ name: item.actionName, value: 1 });
      }
    });
    return actionData.sort();
  };

  const countActionResultByTeamName = (
    teamName: string,
    actionName: string,
  ) => {
    const actionData: rechartsData[] = [];
    timeline
      .filter((value) => value.actionName === `${teamName} ${actionName}`)
      .forEach((item) => {
        if (item.actionResult == 'Reset') {
          return;
        } else {
          // qualifierに対応するアクション名がすでに存在するかチェック
          const existingResult = actionData.find(
            (data) => data.name === item.actionResult,
          );
          if (existingResult) {
            existingResult.value += 1;
          } else {
            actionData.push({ name: item.actionResult, value: 1 });
          }
        }
      });
    return actionData.sort(rechartsDataComparator);
  };

  const countActionTypeByTeamName = (teamName: string, actionName: string) => {
    const actionData: rechartsData[] = [];
    timeline
      .filter((value) => value.actionName === `${teamName} ${actionName}`)
      .forEach((item) => {
        // qualifierに対応するアクション名がすでに存在するかチェック
        const existingType = actionData.find(
          (data) => data.name === item.actionType,
        );
        if (existingType) {
          existingType.value += 1;
        } else {
          actionData.push({ name: item.actionType, value: 1 });
        }
      });
    return actionData.sort(rechartsDataComparator);
  };

  // TODO: possessionStartを追加する
  const createMomentumData: CreateMomentumDataFn = (
    team1Name: string,
    team2Name: string,
  ) => {
    const teamA = team1Name;
    const teamB = team2Name;

    return timeline
      .filter((value) => value.actionName.includes('ポゼッション'))
      .map((item): MomentumSegment => {
        const duration = Math.max(0, item.endTime - item.startTime);
        const teamName = item.actionName.includes(teamA) ? teamA : teamB;
        const possessionStart = item.actionType || '開始情報なし';
        const possessionResult = item.actionResult || '結果なし';

        let outcome: MomentumOutcome;
        if (item.actionResult === 'Try') {
          outcome = 'Try';
        } else if (
          ['Kick Error', 'Pen Con', 'Turnover', 'Turnover (Scrum)'].includes(
            item.actionResult,
          )
        ) {
          outcome = 'Negative';
        } else if (
          ['Try', 'Drop Goal', 'Pen Won', 'Scrum', 'Own Lineout'].includes(
            item.actionResult,
          )
        ) {
          outcome = 'Positive';
        } else {
          outcome = 'Neutral';
        }

        const signedDuration = teamName === teamA ? -duration : duration;

        return {
          teamName,
          value: signedDuration,
          absoluteValue: duration,
          possessionStart,
          possessionResult,
          outcome,
        };
      });
  };
  return {
    calculateActionDuration,
    countActions,
    countActionResultByTeamName,
    countActionTypeByTeamName,
    createMomentumData,
  };
};
