import { AggFC, DataSource, Fields, CubeProps, JsonRecord } from "../types";

export class Node {
    public children: Map<string, Node>;
    public rawData: DataSource;
    public _aggData: JsonRecord;
    constructor() {
        this.children = new Map();
        this.rawData = [];
    }
    public push(...params: Array<JsonRecord>) {
        this.rawData.push(...params);
    }

    public aggData(aggFunc: AggFC, measures = []) {
        this._aggData = aggFunc(this.rawData, measures);
        return this._aggData;
    }
    public getNode(dimensions: any[]): Node | null {
        const search: (node: Node, level: number) => Node | null = (
            node,
            level
        ) => {
            if (level === dimensions.length) {
                return node;
            }
            let children = node.children.entries();
            for (let [childName, child] of children) {
                if (childName === dimensions[level]) {
                    return search(child, level + 1);
                }
            }
            return null;
        };
        return search(this, 0);
    }
}

class momentCube {
    public aggFunc: AggFC;
    private factTable: DataSource;
    private dimensions: Fields;
    private measures: Fields;
    public tree: Node;
    constructor(props: CubeProps) {
        this.aggFunc = props.aggFunc;
        this.factTable = props.factTable;
        this.dimensions = props.dimensions;
        this.measures = props.measures;
    }
    public createDataFrames() {
        this.buildTree();
    }
    public aggregateDataFrames() {
        this.aggTree();
    }
    public get(dimensions: any): JsonRecord | false {
        const { tree, aggFunc, measures } = this;
        const search: (node: Node, level: number) => JsonRecord | false = (
            node,
            level
        ) => {
            if (level === dimensions.length) {
                return node.aggData(aggFunc, measures);
            }
            let children = node.children.entries();
            for (let [childName, child] of children) {
                if (childName === dimensions[level]) {
                    return search(child, level + 1);
                }
            }
            return false;
        };
        return search(tree, 0);
    }

    public getNode(dimensions: any): Node | null {
        const { tree } = this;
        return tree.getNode(dimensions);
    }

    public setData(props: CubeProps): void {
        let {
            aggFunc = this.aggFunc,
            factTable = this.factTable,
            dimensions = this.dimensions,
            measures = this.measures
        } = props;

        if (dimensions !== this.dimensions || factTable !== this.factTable) {
            this.dimensions = dimensions;
            this.factTable = factTable;
            this.measures = measures;
            this.aggFunc = aggFunc;
            this.buildTree();
            this.aggTree();
        } else if (measures !== this.measures || aggFunc !== this.aggFunc) {
            this.measures = measures;
            this.aggFunc = aggFunc;
            this.aggTree();
        }
    }

    public buildTree(): Node {
        let tree: Node = new Node();
        let len = this.factTable.length,
            i;
        for (i = 0; i < len; i++) {
            this.insertNode(this.factTable[i], tree, 0);
        }
        this.tree = tree;
        return tree;
    }

    public insertNode(record: JsonRecord, node: Node, level: number): void {
        if (level === this.dimensions.length) {
            node.push(record);
        } else {
            let member = record[this.dimensions[level]];
            if (!node.children.has(member)) {
                node.children.set(member, new Node());
            }
            this.insertNode(record, node.children.get(member), level + 1);
        }
    }

    public aggTree(node = this.tree): Node {
        if (node.children.size > 0) {
            node.rawData = [];
            let children = node.children.values();
            for (let child of children) {
                let i: number;
                let data: DataSource = this.aggTree(child).rawData;
                let len: number = data.length;
                for (i = 0; i < len; i++) {
                    node.rawData.push(data[i]);
                }
            }
        }
        node.aggData(this.aggFunc, this.measures);
        return node;
    }
}

export default momentCube;
