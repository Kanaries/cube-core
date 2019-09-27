import { periodCube, momentCube } from "./core/index";
import { CubeProps, JsonRecord } from "./types";

// import { JsonRecord } from './types';
import { tree2Table } from './utils/transform';
import { sum_unsafe, mean, count } from './utils/aggregation';
interface TypedCube extends CubeProps {
  type: "period" | "moment";
}

interface AggregateProps {
  dataSource: JsonRecord[];
  dimensions: string[];
  measures: string[];
  asFields: string[]
  operator: 'sum' | 'mean' | 'count'
}
const operatorMap = {
  'sum': sum_unsafe,
  'mean': mean,
  'count': count,
}

function copyDataSource(data: JsonRecord[]): JsonRecord[] {
  return data.map(row => {
    return { ...row }
  })
}

function aggregate(props: AggregateProps): JsonRecord[] {

  const { dimensions, measures, asFields, operator, dataSource } = props;
  const data = [];
  const cube = createCube({
    type: 'moment',
    aggFunc: operatorMap[operator] || count,
    dimensions,
    measures,
    factTable: dataSource
  }) as momentCube;
  let table = tree2Table({ dimensions, measures, cube });
  table.forEach(row => {
    asFields.forEach((as, i) => {
      row[as] = row[measures[i]]
    })
  })
  return table;
}

function createCube({
  type,
  aggFunc = count,
  factTable = [],
  dimensions = [],
  measures = []
}: TypedCube): periodCube | momentCube {
  switch (type) {
    case "period":
      return new periodCube({
        aggFunc,
        factTable,
        dimensions,
        measures
      });
    case "moment":
      return new momentCube({
        aggFunc,
        factTable,
        dimensions,
        measures
      });
    default:
      return new momentCube({
        aggFunc,
        factTable,
        dimensions,
        measures
      });
  }
}

export default aggregate;
export { createCube };

export * from "./utils/aggregation";
