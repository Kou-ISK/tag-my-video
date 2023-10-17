import { TimelineData } from '../types/TimelineData';
import { rechartsData } from '../types/RechartsData';

export const useAnalysis = (timeline: TimelineData[]) => {
    const rechartsDataComparator = (x: rechartsData, y: rechartsData) => {
        return - x.name.localeCompare(y.name)
    }

    const calculateActionDuration = () => {
        const actionData: rechartsData[] = [];
        timeline.forEach((item) => {
            const { actionName, startTime, endTime } = item;
            const duration = endTime - startTime;

            // actionDataに対応するアクション名がすでに存在するかチェック
            const existingAction = actionData.find((action) => action.name === actionName);

            if (existingAction) {
                // すでに存在する場合、durationを加算
                existingAction.value += duration;
            } else {
                // 存在しない場合、新しいアクションを追加
                actionData.push({ name: actionName, value: duration });
            }
        });
        return actionData.sort((a, b) => b.value - a.value)
    }

    const countActions = () => {
        const actionData: rechartsData[] = [];
        timeline.forEach((item) => {
            // actionDataに対応するアクション名がすでに存在するかチェック
            const existingAction = actionData.find((action) => action.name === item.actionName);

            if (existingAction) {
                // すでに存在する場合、durationを加算
                existingAction.value += 1;
            } else {
                // 存在しない場合、新しいアクションを追加
                actionData.push({ name: item.actionName, value: 1 });
            }
        });
        return actionData.sort()
    }

    const countActionResultByTeamName = (teamName: string, actionName: string) => {
        const actionData: rechartsData[] = [];
        timeline.filter((value) => value.actionName === `${teamName} ${actionName}`).forEach((item) => {
            // qualifierに対応するアクション名がすでに存在するかチェック
            const existingResult = actionData.find((data) => data.name === item.actionResult);
            if (existingResult) {
                existingResult.value += 1;
            } else {
                actionData.push({ name: item.actionResult, value: 1 });
            }
        });
        return actionData.sort(rechartsDataComparator)
    }

    const countActionTypeByTeamName = (teamName: string, actionName: string) => {
        const actionData: rechartsData[] = [];
        timeline.filter((value) => value.actionName === `${teamName} ${actionName}`).forEach((item) => {
            // qualifierに対応するアクション名がすでに存在するかチェック
            const existingType = actionData.find((data) => data.name === item.actionType);
            if (existingType) {
                existingType.value += 1;
            } else {
                actionData.push({ name: item.actionType, value: 1 });
            }
        });
        return actionData.sort(rechartsDataComparator)
    }

    const createMomentumData = (team1Name: string, team2Name: string) => {
        const momentumData: any[] = []
        timeline.filter((value) => value.actionName.includes("ポゼッション")).forEach((item) => {
            const duration = item.endTime - item.startTime
            const teamName = item.actionName.includes(team1Name) ? team1Name : team2Name
            const isTryScored = item.actionResult === "Try" ? true : false
            const isNegativeResult = ["Kick Error", "Pen Con", "Turnover", "Turnover (Scrum)",].includes(item.actionResult) ? true : false
            const isPositiveResult = ["Try", "Drop Goal", "Pen Won", "Scrum", "Own Lineout",].includes(item.actionResult) ? true : false
            const momentumItem = {
                teamName: teamName,
                value: `${teamName === team1Name ? -duration : duration}`, //チーム1の場合、負の数を返す
                isTryScored: isTryScored,
                isPositiveResult: isPositiveResult,
                isNegativeResult: isNegativeResult
            }
            momentumData.push(momentumItem)
        })
        return momentumData
    }
    return { calculateActionDuration, countActions, countActionResultByTeamName, countActionTypeByTeamName, createMomentumData }
}
