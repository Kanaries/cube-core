class Node {
    constructor () {
        this.children = new Map()
        this.rawData = []
    }
    push () {
        this.rawData.push(...arguments)
    }
    
    aggData (aggFunc, measures = []) {
        this._aggData = aggFunc(this.rawData, measures)
        return this._aggData
    }
}

class momentCube {
    constructor (props) {
        this.aggFunc = props.aggFunc
        this.factTable = props.factTable
        this.dimensions = props.dimensions
        this.measures = props.measures
        this.buildTree()
        this.aggTree()
    }

    setData (props) {
        let { 
            aggFunc = this.aggFunc, 
            factTable = this.factTable, 
            dimensions = this.dimensions, 
            measures = this.measures 
        } = props

        if (dimensions !== this.dimensions || factTable !== this.factTable) {
            this.dimensions = dimensions
            this.factTable = factTable
            this.measures = measures
            this.aggFunc = aggFunc
            this.buildTree()
            this.aggTree()
        } else if (measures !== this.measures || aggFunc !== this.aggFunc) {
            this.measures = measures
            this.aggFunc = aggFunc
            this.aggTree()
        }
    }

    buildTree () {
        let tree = new Node()
        let len = this.factTable.length, i
        for (i = 0; i < len; i++) {
            this.insertNode(this.factTable[i], tree, 0)
        }
        this.tree = tree
        return tree
    }

    insertNode (record, node, level) {
        if (level === this.dimensions.length) {
            node.push(record)
        } else {
            let member = record[this.dimensions[level]]
            if (!node.children.has(member)) {
                node.children.set(member, new Node())
            }
            this.insertNode(record, node.children.get(member), level + 1)
        }
    }

    aggTree (node = this.tree) {
        if (node.children.size > 0) {
            node.rawData = []
            let children = node.children.values()
            for (let child of children) {
                let i, data = this.aggTree(child).rawData;
                let len = data.length;
                for (i = 0; i < len; i++) {
                    node.rawData.push(data[i])
                }
            }
        }
        node.aggData(this.aggFunc, this.measures)
        return node
    }
}


export default momentCube
