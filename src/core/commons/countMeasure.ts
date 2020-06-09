import { MeasureAggregator } from "./measureAggregator";
import { DefaultMeasureTypes } from "./measureFactory";

export class CountMeasure extends MeasureAggregator<number> {
    public constructor (props) {
        super(props);
        this.op = DefaultMeasureTypes.count;
    }
    public init() {
        this.state = 0;
    }
    public aggregate(value: number) {
        this.state++;
    }
    public getState(): number {
        return this.state;
    }
}
