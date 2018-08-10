const assert = require('assert');
const { createCube } = require('../dist/bundle.js')
const { sum_unsafe } = require('./performance/stat.js')
let dimRange = [0, 20]
let meaRange = [0, 100]
function makeData (D, M, S) {
    let Dimensions = [], Measures = [], data = []
    for (let i = 0; i < D; i++) {
        Dimensions.push('dim' + i.toString())
    }
    for (let i = 0; i < M; i++) {
        Measures.push('mea' + i.toString())
    }
    for (let i = 0; i < S; i++) {
        let record = {}
        Dimensions.forEach(dim => {
            record[dim] = (Math.random() * (dimRange[1] - dimRange[0]) + dimRange[0]).toFixed(0)
        })
        Measures.forEach(mea => {
            record[mea] = parseInt(Math.random() * (meaRange[1] - meaRange[0]) + meaRange[0])
        })
        data.push(record)
    }
    return {data, Dimensions, Measures}
}

function check ({cube, dataSource, Dimensions, Measures}) {
    function dfs (node, dict, level) {
        if (node.children.size === 0) {
            let keys = Object.keys(dict)
            // console.log(`check leaf on level ${level}`)
            let data = dataSource.filter((item) => {
                return keys.every((key) => {
                    return dict[key] === item[key]
                })
            })
            let sums = sum_unsafe(data, Measures)
            assert.deepStrictEqual(node.aggData(Measures), sums);
            assert.deepStrictEqual(node.rawData, data);
            
        } else {
            let children = node.children.entries()
            for (let child of children) {
                dfs(child[1], {
                    ...dict,
                    [Dimensions[level]]: child[0]
                }, level + 1)
            }
        }
    }
    dfs(cube.tree, {}, 0)
}

function checkAgg ({cube, dataSource, Dimensions, Measures}) {
    function dfs (node, dict, level) {
        if (node.children.size === 0) {
        } else {
            let keys = Object.keys(dict)

            let data = dataSource.filter((item) => {
                return keys.every((key) => {
                    return dict[key] === item[key]
                })
            })
            let sums = sum_unsafe(data, Measures)
            assert.deepStrictEqual(node.aggData(Measures), sums);
            assert.strictEqual(node.rawData.length, data.length)

            let children = node.children.entries()
            for (let child of children) {
                dfs(child[1], {
                    ...dict,
                    [Dimensions[level]]: child[0]
                }, level + 1)
            }
        }
    }
    dfs(cube.tree, {}, 0)
}


describe('[period cube]normal test', () => {
    it('[period]small dataset test (20)', () => {
        let {data, Dimensions, Measures} = makeData(3, 3, 20)
        let cube = createCube({
            type: 'period',
            aggFunc: sum_unsafe,
            factTable: data,
            dimensions: Dimensions,
            measures: Measures
        })
        cube.buildTree()
        check({cube, dataSource: data, Dimensions, Measures})
        cube.aggTree()
        checkAgg({cube, dataSource: data, Dimensions, Measures})
    });
    it('[period]large dataset test (2000)', () => {
        let {data, Dimensions, Measures} = makeData(10, 10, 2000)
        let cube = createCube({
            type: 'period',
            aggFunc: sum_unsafe,
            factTable: data,
            dimensions: Dimensions,
            measures: Measures
        })
        cube.buildTree()
        check({cube, dataSource: data, Dimensions, Measures})
        cube.aggTree()
        checkAgg({cube, dataSource: data, Dimensions, Measures})
    });
})