class pNode {
    constructor (aggFunc) {
        this.children = new Map()
        this._rawData = []
        this.aggFunc = aggFunc
        this.cache = false
    }
    push () {
        this._rawData.push(...arguments)
    }
    aggData (measures = []) {
        if (!this.cache) {
            this._aggData = this.aggFunc(this.rawData, measures)
            this.cache = true
        }
        return this._aggData
    }
    clearCache () {
        this.cache = false
    }
    get rawData () {
        if (!this.cache) {
            if (this.children.size !== 0) {
                let children = this.children.values()
                let rawData = []
                for (let child of children) {
                    let i, data = child.rawData;
                    let len = data.length;
                    for (i = 0; i < len; i++) {
                        rawData.push(data[i])
                    }
                }
                this._rawData = rawData
            }
            this.cache = true
        }
        return this._rawData
    }
}


class periodCube {
    constructor (props) {
        this.aggFunc = props.aggFunc
        this.factTable = props.factTable
        this.dimensions = props.dimensions
        this.measures = props.measures
    }

    buildTree () {
        let tree = new pNode(this.aggFunc)
        let len = this.factTable.length, i
        for (i = 0; i < len; i++) {
            this.insertNode(this.factTable[i], tree, 0)
        }
        this.tree = tree
        return tree
    }

    insertNode (record, node, level) {
        node.push(record)
        node.cache = false
        if (level < this.dimensions.length) {
            let member = record[this.dimensions[level]]
            if (!node.children.has(member)) {
                node.children.set(member, new pNode(this.aggFunc))
            }
            this.insertNode(record, node.children.get(member), level + 1)
        }
    }

    aggTree (node = this.tree) {
        let children = node.children.values()
        for (let child of children) {
            this.aggTree(child)
        }
        node.aggData(this.measures)
        return node
    }

    aggNode (node = this.tree) {
        let children = node.children.values()
        for (let child of children) {
            this.aggTree(child)
        }
        node.aggData(this.measures)
        return node
    }
}

export default periodCube