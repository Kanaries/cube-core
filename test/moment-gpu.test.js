const assert = require('assert');
const { createCube } = require('../dist/bundle.js')
const { sum_unsafe } = require('./performance/stat.js')
function sum_gpu (subset, keys) {
    var sum = keys.map(key => 0)
    for (let i = 0; i < subset.length; i++) {
        for (j = 0; j < keys.length; j++) {
            sum[j] += subset[i][keys[j]]
        }
    }
    return sum;
}
function sum_test (subset, len) {
    
}
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
            let sums = sum_gpu(data, Measures)
            assert.deepStrictEqual(node._aggData, sums);
            assert.deepStrictEqual(node.size, data.length);
            
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
            let sums = sum_gpu(data, Measures)
            assert.deepStrictEqual(node._aggData, sums);
            assert.deepStrictEqual(node.size, data.length);
            // assert.strictEqual(node.rawData.length, data.length)

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
    
    describe('[moment-gpu]normal dataset test', () => {
        let t0, t1
        let {data, Dimensions, Measures} = makeData(10, 1000, 200)
        t0 = new Date().getTime() 
        let cube = createCube({
            type: 'moment',
            aggFunc: sum_unsafe,
            factTable: data,
            dimensions: Dimensions,
            measures: Measures
        })
        t1 = new Date().getTime()
        console.log('normal', t1 - t0)
        
        t0 = new Date().getTime() 
        
        cube = createCube({
            type: 'moment-gpu',
            aggFunc: sum_gpu,
            factTable: data,
            dimensions: Dimensions,
            measures: Measures
        })
        t1 = new Date().getTime()
        console.log('gpu', t1 - t0)
        
        it('[moment-gpu] leaf check (20)', () => {
            // t0 = new Date().getTime() 
            check({cube, dataSource: data, Dimensions, Measures})
            // t1 = new Date.getTime()
            // console.log(t1 - t0)
        });
        it('[moment-gpu] node check (20)', () => {
            checkAgg({cube, dataSource: data, Dimensions, Measures})
        });
        // it('[moment-gpu]large dataset test (2000)', () => {
        //     let {data, Dimensions, Measures} = makeData(10, 10, 2000)
        //     let cube = createCube({
        //         type: 'moment-gpu',
        //         aggFunc: sum_gpu,
        //         factTable: data,
        //         dimensions: Dimensions,
        //         measures: Measures
        //     })
        //     check({cube, dataSource: data, Dimensions, Measures})
        //     checkAgg({cube, dataSource: data, Dimensions, Measures})
        // });
    })


});