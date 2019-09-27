import { AggFC, DataSource, Fields, CubeProps, JsonRecord } from "../types";

class Node {
    public children: Map<string, Node>;
    public _rawData: DataSource;
    public aggFunc: AggFC;
    public _aggData: JsonRecord;
    public cache: boolean;
    constructor(aggFunc: AggFC) {
        this.children = new Map();
        this._rawData = [];
        this.aggFunc = aggFunc;
        this.cache = false;
    }
    push(...params: Array<JsonRecord>): void {
        this._rawData.push(...params);
    }
    aggData(measures: Fields = []): JsonRecord {
        if (!this.cache) {
            this._aggData = this.aggFunc(this.rawData, measures);
            this.cache = true;
        }
        return this._aggData;
    }
    clearCache(): void {
        this.cache = false;
    }
    get rawData(): DataSource {
        if (!this.cache) {
            if (this.children.size !== 0) {
                let children = this.children.values();
                let rawData: DataSource = [];
                for (let child of children) {
                    let i: number;
                    let data: DataSource = child.rawData;
                    let len: number = data.length;
                    for (i = 0; i < len; i++) {
                        rawData.push(data[i]);
                    }
                }
                this._rawData = rawData;
            }
            this.cache = true;
        }
        return this._rawData;
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

class periodCube {
    private aggFunc: AggFC;
    private factTable: DataSource;
    private dimensions: string[];
    private measures: string[];
    public tree: Node;
    constructor(props: CubeProps) {
        this.aggFunc = props.aggFunc;
        this.factTable = props.factTable;
        this.dimensions = props.dimensions;
        this.measures = props.measures;
    }
    public get(dimensions: any[]): JsonRecord | false {
        const { tree, aggFunc, measures } = this;
        const search: (node: Node, level: number) => JsonRecord | false = (
            node,
            level
        ) => {
            if (level === dimensions.length) {
                return node.aggData(measures);
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
    public getNode(dimensions: any[]): Node | null {
        const { tree } = this;
        return tree.getNode(dimensions);
    }

    public buildTree(): Node {
        let tree: Node = new Node(this.aggFunc);
        let len = this.factTable.length,
            i;
        for (i = 0; i < len; i++) {
            this.insertNode(this.factTable[i], tree, 0);
        }
        this.tree = tree;
        return tree;
    }

    public insertNode(record, node, level): void {
        node.push(record);
        node.cache = false;
        if (level < this.dimensions.length) {
            let member = record[this.dimensions[level]];
            if (!node.children.has(member)) {
                node.children.set(member, new Node(this.aggFunc));
            }
            this.insertNode(record, node.children.get(member), level + 1);
        }
    }

    public aggTree(node: Node = this.tree): Node {
        let children = node.children.values();
        for (let child of children) {
            this.aggTree(child);
        }
        node.aggData(this.measures);
        return node;
    }

    public aggNode(node = this.tree): Node {
        let children = node.children.values();
        for (let child of children) {
            this.aggTree(child);
        }
        node.aggData(this.measures);
        return node;
    }
}

export default periodCube;
