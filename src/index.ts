import { periodCube, momentCube } from './core/index'
import { CubeProps, AggFC } from './index.d'
type JsonRecord = { [key: string]: any };
interface TypedCube extends CubeProps<JsonRecord> {
    type: 'period' | 'moment';
}
function createCube({ type, aggFunc = count, factTable = [], dimensions = [], measures = [] }: TypedCube): periodCube<JsonRecord> | momentCube<JsonRecord> {
    switch (type) {
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

const count: AggFC<JsonRecord> = function (subset, MEASURES) {
    let cnts: JsonRecord = {}
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
