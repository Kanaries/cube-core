import { periodCube, momentCube, momentCubeGPU } from './core/index.js'
function createCube({type, aggFunc=count, factTable=[], dimensions=[], measures=[]}) {
    switch (type) {
        case 'moment-gpu':
        return new momentCubeGPU({
            aggFunc,
            factTable,
            dimensions,
            measures
        })
        case 'period':
            return new periodCube({
                aggFunc,
                factTable,
                dimensions,
                measures
            })
        case 'moment':
            return new momentCube({
                aggFunc,
                factTable,
                dimensions,
                measures
            })
        default:
            return new momentCube({
                aggFunc,
                factTable,
                dimensions,
                measures
            })
    }
}

function count (subset, MEASURES) {
    let cnts = {}
    MEASURES.forEach((mea) => {
      cnts[mea] = 0
    })
    for (let i = 0, len = subset.length; i < len; i++) {
        MEASURES.forEach((mea) => {
            cnts[mea] ++
          })
    }
    return cnts
}

export { createCube }
