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
        // タイムスパンの定義
        const timeSpans = [
            { start: 0, end: 600 },   // 0-10分
            { start: 600, end: 1200 }, // 10-20分
            { start: 1200, end: 1800 }, // 20-30分
            { start: 1800, end: 2400 }, // 30-40分
            { start: 2400, end: 3000 }, // 40-50分
            { start: 3000, end: 3600 }, // 50-60分
            { start: 3600, end: 4200 }, // 60-70分
            { start: 4200, end: 4800 }, // 70-80分
        ];

        // 各時間帯ごとにループ
        const momentumData = timeSpans.map((timeSpan, index) => {
            // 各時間帯内での計算結果を初期化
            let value = 0;

            // timelineをループして時間帯内のアクションを計算
            timeline.forEach((item) => {
                const { startTime, endTime, actionName } = item;

                // アクションの開始時間と終了時間を時間帯内に制限
                const adjustedStartTime = Math.max(startTime, timeSpan.start);
                const adjustedEndTime = Math.min(endTime, timeSpan.end);

                // 時間帯内でのアクションの時間を計算
                const actionDuration = adjustedEndTime - adjustedStartTime;

                if (actionDuration > 0) {
                    // team1Nameまたはteam2Nameに応じてvalueを計算
                    if (actionName.includes(team1Name)) {
                        value += actionDuration;
                    } else if (actionName.includes(team2Name)) {
                        value -= actionDuration;
                    }
                }
            });

            // 計算結果を返す
            return {
                timespan: `${timeSpan.start / 60}-${timeSpan.end / 60}min`,
                value: value,
            };
        });
        return momentumData
    }
    return { calculateActionDuration, countActions, countActionByTeamName, createMomentumData }
}
