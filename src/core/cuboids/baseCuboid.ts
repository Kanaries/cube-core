import { JsonRecord } from "../../types";
import { CuboidTreeNode } from "./base/cuboidTreeNode";
import { ROOT_ID } from "../../constants";
import { DefaultMeasureTypes } from "../commons/measureFactory";

export class BaseCuboid<M extends DefaultMeasureTypes> {
    public dimensions: string[];
    public measures: string[];
    public ops: M[];
    public dataSource: JsonRecord[];
    public nestTree: CuboidTreeNode<M>;
    constructor(
        dataSource: JsonRecord[],
        dimensions: string[],
        measures: string[],
        ops: M[]
    ) {
        this.dataSource = dataSource;
        this.measures = measures;
        this.ops = ops;
        this.dimensions = dimensions;
        this.nestTree = new CuboidTreeNode(ROOT_ID, measures, ops);
    }
    public build() {
        let i = 0;
        let len = this.dataSource.length;
        for (i = 0; i < len; i++) {
            this.insert(this.dataSource[i]);
        }
    }
    public aggregateLayers(node: CuboidTreeNode<M>, depth: number) {
        const { dimensions } = this;
        const measures = node.measureSet.measures;
        if (depth < dimensions.length - 1) {
            for (let child of node.children.values()) {
                this.aggregateLayers(child, depth + 1)
                for (let i = 0; i < measures.length; i++) {
                    const childAggResult = child.measureSet.measures[i].getState();
                    measures[i].aggregate(childAggResult);
                }
            }
        }
    }
    public insert(record: JsonRecord) {
        this.insertNode(this.nestTree, record, 0);
    }
    public insertNode(
        tree: CuboidTreeNode<M>,
        record: JsonRecord,
        depth: number
    ) {
        const { dimensions, measures, ops } = this;
        if (depth === dimensions.length) {
            for (let mea of tree.measureSet.measures) {
                mea.aggregate(record[mea.id]);
            }
        } else {
            const dim = dimensions[depth];
            if (!tree.children.has(record[dim])) {
                const node = new CuboidTreeNode(record[dim], measures, ops);
                tree.children.set(record[dim], node);
            }
            this.insertNode(tree.children.get(record[dim]), record, depth + 1);
        }
    }
}
