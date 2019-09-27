const assert = require('assert');
const { createCube, sum_unsafe, default: aggregate } = require('../built/index.js')

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
            assert.deepStrictEqual(node._aggData, sums);
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
            assert.deepStrictEqual(node._aggData, sums);
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

describe('createCube', () => {
    describe('test aggregate', () => {
        it('[aggregate]', () => {
            let {data, Dimensions, Measures} = makeData(10, 10, 500)
            let table = aggregate({
                operator: 'sum',
                dataSource: data,
                dimensions: Dimensions,
                measures: Measures,
                asFields: Measures.map(mea => `${mea}_sum`)
            })
            assert.equal(table.length > 0, true)
        })
    })

    describe('edit moment cube', () => {
        console.log('test test1')
        let {data, Dimensions, Measures} = makeData(10, 10, 500)
        let cube = createCube({
            type: 'moment',
            aggFunc: sum_unsafe,
            factTable: data,
            dimensions: Dimensions,
            measures: Measures
        })
        // cube.buildTree()
        it('test buildTree', () => {
            check({cube, dataSource: data, Dimensions, Measures})
        })

        it('test aggTree', () => {
            checkAgg({cube, dataSource: data, Dimensions, Measures})
        })
        it('test after set dimensions', () => {
            cube.setData({
                dimensions: Dimensions.slice(3)
            })
            check({cube, dataSource: data, Dimensions: Dimensions.slice(3), Measures})
            checkAgg({cube, dataSource: data, Dimensions: Dimensions.slice(3), Measures})
            cube.setData({dimensions: Dimensions})
        })
        
        it('test after set masures', () => {
            cube.setData({
                measures: Measures.slice(3)
            })
            check({cube, dataSource: data, Dimensions, Measures: Measures.slice(3)})
            checkAgg({cube, dataSource: data, Dimensions, Measures: Measures.slice(3)})
            cube.setData({measures: Measures})
        })

        it('test after set all', () => {
            let {data: data1, Dimensions: Dimensions1, Measures: Measures1} = makeData(3, 3, 200)
            cube.setData({
                factTable: data1,
                dimensions: Dimensions1,
                measures: Measures1
            })
            check({cube, dataSource: data1, Dimensions: Dimensions1, Measures: Measures1})
            checkAgg({cube, dataSource: data1, Dimensions: Dimensions1, Measures: Measures1})
        })

    });
    describe('[moment]normal dataset test', () => {
        it('[moment]small dataset test (20)', () => {
            let {data, Dimensions, Measures} = makeData(3, 3, 20)
            let cube = createCube({
                type: 'moment',
                aggFunc: sum_unsafe,
                factTable: data,
                dimensions: Dimensions,
                measures: Measures
            })
            check({cube, dataSource: data, Dimensions, Measures})
            checkAgg({cube, dataSource: data, Dimensions, Measures})
        });
        it('[moment]large dataset test (2000)', () => {
            let {data, Dimensions, Measures} = makeData(10, 10, 2000)
            let cube = createCube({
                type: 'moment',
                aggFunc: sum_unsafe,
                factTable: data,
                dimensions: Dimensions,
                measures: Measures
            })
            check({cube, dataSource: data, Dimensions, Measures})
            checkAgg({cube, dataSource: data, Dimensions, Measures})
        });
    })

    // describe('timelimit test', () => {
    //     it('[moment] Time Cost (D=10, M = 10, S = 200000) < 10s', () => {
    //         let {data, Dimensions, Measures} = makeData(10, 10, 200000)
    //         let cube = createCube({
    //             type: 'moment',
    //             aggFunc: sum_unsafe,
    //             factTable: data,
    //             dimensions: Dimensions,
    //             measures: Measures
    //         })
    //         let t0, t1, t2, t3;
    //         t0 = new Date().getTime()
    //         cube.buildTree()
    //         t1 = new Date().getTime()
    //         cube.aggTree()
    //         t2 = new Date().getTime()
    //         console.log(`build=${t1 - t0},agg=${t2 - t1}`)
    //         assert.strictEqual(t2 - t0 < 10000, true)
    //     });
    // })

});