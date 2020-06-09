import { MeasureAggregator } from "./measureAggregator";
import { DefaultMeasureTypes } from "./measureFactory";

export class SumMeasure extends MeasureAggregator<number> {
    public constructor (props) {
        super(props);
        this.op = DefaultMeasureTypes.sum
    }
    public init() {
        this.state = 0;
    }
    public aggregate(value: number) {
        if (typeof value === 'number') {
            this.state += value;
        }
    }
    public getState (): number {
        return this.state
    }
}
