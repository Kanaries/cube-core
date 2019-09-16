import { AggFC, DataSource, Fields, CubeProps } from "../types";

class Node<Row> {
    public children: Map<string, Node<Row>>;
    public _rawData: DataSource<Row>;
    public aggFunc: AggFC<Row>;
    public _aggData: Row;
    public cache: boolean;
    constructor(aggFunc: AggFC<Row>) {
        this.children = new Map();
        this._rawData = [];
        this.aggFunc = aggFunc;
        this.cache = false;
    }
    push(...params: Array<Row>): void {
        this._rawData.push(...params);
    }
    aggData(measures: Fields = []): Row {
        if (!this.cache) {
            this._aggData = this.aggFunc(this.rawData, measures);
            this.cache = true;
        }
        return this._aggData;
    }
    clearCache(): void {
        this.cache = false;
    }
    get rawData(): DataSource<Row> {
        if (!this.cache) {
            if (this.children.size !== 0) {
                let children = this.children.values();
                let rawData: DataSource<Row> = [];
                for (let child of children) {
                    let i: number;
                    let data: DataSource<Row> = child.rawData;
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
}

class periodCube<Row> {
    private aggFunc: AggFC<Row>;
    private factTable: DataSource<Row>;
    private dimensions: string[];
    private measures: string[];
    public tree: Node<Row>;
    constructor(props: CubeProps<Row>) {
        this.aggFunc = props.aggFunc;
        this.factTable = props.factTable;
        this.dimensions = props.dimensions;
        this.measures = props.measures;
    }

    buildTree(): Node<Row> {
        let tree: Node<Row> = new Node(this.aggFunc);
        let len = this.factTable.length,
            i;
        for (i = 0; i < len; i++) {
            this.insertNode(this.factTable[i], tree, 0);
        }
        this.tree = tree;
        return tree;
    }

    insertNode(record, node, level): void {
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

    aggTree(node: Node<Row> = this.tree): Node<Row> {
        let children = node.children.values();
        for (let child of children) {
            this.aggTree(child);
        }
        node.aggData(this.measures);
        return node;
    }

    aggNode(node = this.tree): Node<Row> {
        let children = node.children.values();
        for (let child of children) {
            this.aggTree(child);
        }
        node.aggData(this.measures);
        return node;
    }
}

export default periodCube;
