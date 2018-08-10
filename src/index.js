import { periodCube, momentCube } from './core/cube.js'
function createCube({type, aggFunc=count, factTable=[], dimensions=[], measures=[]}) {
    switch (type) {
        case 'period':
            return new periodCube({
                aggFunc,
                FACT_TABLE: factTable,
                DIMENSIONS: dimensions,
                MEASURES: measures
            })
        case 'moment':
            return new momentCube({
                aggFunc,
                FACT_TABLE: factTable,
                DIMENSIONS: dimensions,
                MEASURES: measures
            })
        default:
            return new momentCube({
                aggFunc,
                FACT_TABLE: factTable,
                DIMENSIONS: dimensions,
                MEASURES: measures
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
