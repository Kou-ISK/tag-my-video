import { TimelineData } from '../types/TimelineData';
import { rechartsData } from "../types/RechartsData";

export const useAnalysis = (timeline: TimelineData[]) => {
    // TODO　分析用にtimelineを編集するメソッドを実装する
    const sumDuration = () => {
        const duration = timeline.reduce((sum, i) => sum + i.endTime - i.startTime, 0);
    }

    const transformedData: rechartsData[] = timeline.map((item, index) => ({
        name: item.actionName,
        value: item.endTime - item.startTime
    }));
    return { transformedData }
}

export const calculateActionDuration = (timeline: TimelineData[]) => {
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
    return actionData
}

export const countActions = (timeline: TimelineData[]) => {
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
    return actionData
}