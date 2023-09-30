import { TimelineData } from "../types/TimelineData";
import { TransformedData } from "../types/TransformedData";

export const useAnalysis = (timeline: TimelineData[]) => {
    // TODO　分析用にtimelineを編集するメソッドを実装する
    const sumDuration = () => {
        const duration = timeline.reduce((sum, i) => sum + i.endTime - i.startTime, 0);
    }

    const transformedData: TransformedData[] = timeline.map((item, index) => ({
        id: index,
        label: item.actionName,
        value: item.endTime - item.startTime
    }));
    return { transformedData }
}