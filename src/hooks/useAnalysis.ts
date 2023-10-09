import { TimelineData } from '../types/TimelineData';
import { rechartsData } from '../types/RechartsData';

export const useAnalysis = (timeline: TimelineData[]) => {
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
        return actionData.sort((a, b) => b.value - a.value)
    }

    const countActionByTeamName = (teamName: string, actionName: string) => {
        const actionData: rechartsData[] = [];
        timeline.filter((value) => value.actionName === `${teamName} ${actionName}`).forEach((item) => {
            // qualifierに対応するアクション名がすでに存在するかチェック
            const existingQualifier = actionData.find((data) => data.name === item.qualifier);
            if (existingQualifier) {
                existingQualifier.value += 1;
            } else {
                actionData.push({ name: item.qualifier, value: 1 });
            }
        });
        return actionData.sort((a, b) => b.value - a.value)
    }

    const createMomentumData = (team1Name: string, team2Name: string) => {
        const momentumData: any[] = []
        timeline.filter((value) => value.actionName.includes("ポゼッション")).forEach((item) => {
            const duration = item.endTime - item.startTime
            const teamName = item.actionName.includes(team1Name) ? team1Name : team2Name
            const isTryScored = timeline.filter((it) => it.actionName === teamName + ' トライ').some((tryItem) => {
                return (Math.max(item.startTime, tryItem.startTime) < Math.min(item.endTime, tryItem.endTime)) ? true : false
            }
            )
            const momentumItem = {
                teamName: teamName,
                value: `${teamName === team1Name ? -duration : duration}`, //チーム1の場合、負の数を返す
                isTryScored: isTryScored
            }
            momentumData.push(momentumItem)
        })
        return momentumData
    }
    return { calculateActionDuration, countActions, countActionByTeamName, createMomentumData }
}
