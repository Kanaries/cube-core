import GPU from 'gpu'
const gpu = new GPU();

class Node {
    constructor (meaCount) {
        this.children = new Map()
        this.rawData = []
        for (let i = 0; i < meaCount; i++) {
            this.rawData.push([])
        }
        this.size = 0
    }
    push (record, keys) {
        keys.forEach((key, index) => {
            this.rawData[index].push(record[key])
        })
        this.size++
        // this.rawData.push(...arguments)
    }
    append (matrix, size) {
        let meaCount = this.rawData.length
        for (let i = 0; i < meaCount; i++) {
            for (let j = 0; j < size; j++) {
                this.rawData[i].push(matrix[i][j])
            }
        }
        this.size += size
    }

    aggData (aggFunc, measures = []) {
        this._aggData = aggFunc(this.rawData, this.size)
        return this._aggData
    }
}

class momentCubeGPU {
    constructor (props) {
        // this.aggFunc = props.aggFunc
        this.factTable = props.factTable
        this.dimensions = props.dimensions
        this.measures = props.measures
        this.meaLen = this.measures.length
        const meaLen = this.meaLen
        this.aggFunc = gpu.createKernel(function(subset, len) {
            var sum = 0
            for (let i = 0; i < this.constants.size; i++) {
                sum += subset[this.thread.x][i]
            }
            return sum;
        }).setOutput([meaLen]).setConstants({size: 100});

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
        let tree = new Node(this.meaLen)
        let len = this.factTable.length, i
        for (i = 0; i < len; i++) {
            this.insertNode(this.factTable[i], tree, 0)
        }
        this.tree = tree
        return tree
    }

    insertNode (record, node, level) {
        if (level === this.dimensions.length) {
            node.push(record, this.measures)
        } else {
            let member = record[this.dimensions[level]]
            if (!node.children.has(member)) {
                node.children.set(member, new Node(this.meaLen))
            }
            this.insertNode(record, node.children.get(member), level + 1)
        }
    }

    aggTree (node = this.tree) {
        if (node.children.size > 0) {
            // node.rawData = []
            let children = node.children.values()
            for (let child of children) {
                let {rawData, size} = this.aggTree(child);
                node.append(rawData, size)
            }
        }
        this.aggFunc.setConstants({size: node.size})
        node.aggData(this.aggFunc)
        return node
    }
}


export default momentCubeGPU
