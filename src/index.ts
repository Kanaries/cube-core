import { periodCube, momentCube } from './core/index'
import { CubeProps, JsonRecord } from './index.d'
import { count } from './utils/aggregation';

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

export { createCube }

export * from './utils/aggregation'
