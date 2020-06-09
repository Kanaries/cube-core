import { MeasuresAggregators } from "./measuresAggregators";

export abstract class MeasureAggregator<T = number> {
    public id: string;
    public state: T;
    public op: string;
    public abstract aggregate(value: number): void;
    public abstract init(): void;
    protected measuresCollection: MeasuresAggregators | null;
    public hasDeps: boolean;
    public constructor(id: string, hasDeps?: boolean) {
        this.id = id;
        this.hasDeps = Boolean(hasDeps);
        this.measuresCollection = null;
        this.init();
    }
    public abstract getState(): any;
    public syncDeps(measuersCollection: MeasuresAggregators) {
        this.measuresCollection = measuersCollection;
    }
    public serialize(): unknown {
        return this.getState();
    }
}
