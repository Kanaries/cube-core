import { SumMeasure } from "./sumMeasure";

export enum DefaultMeasureTypes {
    sum = "sum",
    mean = "mean",
    count = "count"
}
export function MeasureFactory(meaName: string, aggType: DefaultMeasureTypes) {
    switch (aggType) {
        case DefaultMeasureTypes.sum:
            return new SumMeasure(meaName);
        default:
            return new SumMeasure(meaName);
    }
}
