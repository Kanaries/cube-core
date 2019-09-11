const fs = require('fs')
const { createCube, sum, sum_unsafe  } = require('../../dist/bundle.js')

let dimRange = [0, 20]
let meaRange = [0, 100]
let log = []
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
            record[mea] = parseInt(Math.random() * (meaRange[1] - meaRange[0]) + dimRange[0])
        })
        data.push(record)
    }
    test({data, Dimensions, Measures})
}
function test({ data, Dimensions, Measures}) {
    let t0, t1, info = {
        DimCount: Dimensions.length,
        MeaCount: Measures.length,
        dataCount: data.length,
        DimMember: dimRange[1] - dimRange[0]
    };
    let dataset = createCube({
        type: 'period',
        aggFunc: sum_unsafe,
        factTable: data,
        dimensions: Dimensions,
        measures: Measures
    })
    t0 = new Date().getTime();
    dataset.buildTree()
    t1 = new Date().getTime();
    info.buildTree = t1 - t0
    t0 = new Date().getTime();
    dataset.aggTree()
    t1 = new Date().getTime();
    // console.log(dataset.tree._aggData, dataset.tree.cache)
    info.aggTree = t1 - t0
    console.log(info)
    log.push(info)
}

// for (let i = 0; i < 20; i++) {
//     makeData(10, 10, 50000 + i * 50000)
// }

for (let i = 0; i < 10; i++) {
    for (let j = 2; j <= 10; j++) {
        for (let k = 1; k <= 10; k++) {
            makeData(j, k, 10000 + i * 10000)
        }
    }
}

// for (let i = 0; i < 20; i++) {

//     makeData(10, 10, 500000)
//     dimRange[0]++
// }


// fs.writeFile('testlog_dim_member.json', JSON.stringify(log), (err) => {console.log(err)})

