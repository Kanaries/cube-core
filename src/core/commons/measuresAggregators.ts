import { MeasureAggregator } from "./measureAggregator";
import { JsonRecord } from "../../types";

export class MeasuresAggregators {
    public measures: MeasureAggregator[];
    constructor(meas: MeasureAggregator[]) {
        this.measures = meas;
        for (let mea of this.measures) {
            if (mea.hasDeps) {
                mea.syncDeps(this);
            }
        }
    }
    public serialize(): JsonRecord {
        let ans: JsonRecord = {};
        for (let mea of this.measures) {
            ans[mea.id] = mea.serialize();
        }
        return ans;
    }
}
