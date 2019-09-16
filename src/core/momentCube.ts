import { AggFC, DataSource, Fields, CubeProps } from "../types";

class Node<Row> {
    public children: Map<string, Node<Row>>;
    public rawData: DataSource<Row>;
    private _aggData: Row;
    constructor() {
        this.children = new Map();
        this.rawData = [];
    }
    push(...params: Array<Row>) {
        this.rawData.push(...params);
    }

    aggData(aggFunc: AggFC<Row>, measures = []) {
        this._aggData = aggFunc(this.rawData, measures);
        return this._aggData;
    }
}

class momentCube<Row> {
    private aggFunc: AggFC<Row>;
    private factTable: DataSource<Row>;
    private dimensions: Fields;
    private measures: Fields;
    public tree: Node<Row>;
    constructor(props: CubeProps<Row>) {
        this.aggFunc = props.aggFunc;
        this.factTable = props.factTable;
        this.dimensions = props.dimensions;
        this.measures = props.measures;
        this.buildTree();
        this.aggTree();
    }
    get(dimensions: Fields): Row | false {
        const { tree, aggFunc, measures } = this;
        const search: (node: Node<Row>, level: number) => Row | false = (
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
    setData(props: CubeProps<Row>): void {
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

    buildTree(): Node<Row> {
        let tree: Node<Row> = new Node();
        let len = this.factTable.length,
            i;
        for (i = 0; i < len; i++) {
            this.insertNode(this.factTable[i], tree, 0);
        }
        this.tree = tree;
        return tree;
    }

    insertNode(record: Row, node: Node<Row>, level: number): void {
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

    aggTree(node = this.tree): Node<Row> {
        if (node.children.size > 0) {
            node.rawData = [];
            let children = node.children.values();
            for (let child of children) {
                let i: number;
                let data: DataSource<Row> = this.aggTree(child).rawData;
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
