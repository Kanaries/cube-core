import { MeasureAggregator } from "./measureAggregator";
import { DefaultMeasureTypes } from "./measureFactory";
interface MeanState {
    sum: number;
    count: number;
}
export class MeanMeasure extends MeasureAggregator<MeanState> {
    public constructor (props) {
        super(props);
        this.op = DefaultMeasureTypes.mean;
    }
    public init() {
        this.state = {
            sum: 0,
            count: 0
        };
    }
    public aggregate(value: number) {
        if (typeof value === "number") {
            this.state.sum += value;
        }
        this.state.count++;
    }
    public getState() {
        return this.state;
    }
    public serialize (): number {
        return this.state.sum / this.state.count;
    }
}
