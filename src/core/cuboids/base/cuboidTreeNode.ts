import { MeasuresAggregators } from "../../commons/measuresAggregators";
import { MeasureFactory, DefaultMeasureTypes } from '../../commons/measureFactory';

export class CuboidTreeNode<M extends DefaultMeasureTypes> {
    public readonly id: string;
    public measureSet: MeasuresAggregators;
    public children: Map<string, CuboidTreeNode<M>>;
    public constructor(id: string, measures: string[], ops: M[]) {
        this.id = id;
        const measureAggregatorList = measures.map((meaName, i) => {
            return MeasureFactory(meaName, ops[i])
        })
        this.measureSet = new MeasuresAggregators(measureAggregatorList);
        this.children = new Map();
    }
}
