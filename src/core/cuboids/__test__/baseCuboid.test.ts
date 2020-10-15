import { BaseCuboid } from '../baseCuboid';
// import dataSource from '../../../../datasets/cars.json';
import dataset from '../../../../datasets/titanic.json';
import { DefaultMeasureTypes } from '../../commons/measureFactory';
import { simpleAggregate, liteKeyAggregate } from '../../../utils/commons';
import aggregate, { createCube } from '../../..';
// const dimensions: string[] = [
//     // "Name",
//     "Miles_per_Gallon",
//     "Cylinders",
//     "Year",
//     "Origin"
// ];
// const measures: string[] = [
//     "Displacement",
//     "Horsepower",
//     "Weight_in_lbs",
//     "Acceleration",
// ];

// Object.keys(dataSource[0]).forEach(key => {
//     if (typeof dataSource[0][key] === 'number') {
//         measures.push(key)
//     } else {
//         dimensions.push(key)
//     }
// })

const { dataSource: dataSource,
    // config: {
    //     Dimensions: dimensions,
    //     Measures: measures
    // }
} = dataset as any;
const measures = ["Count", "Survived"];
const dimensions = ["Age","SibSp","Parch","Fare","Sex","Ticket","Cabin","Embarked","Pclass"]
const ops: DefaultMeasureTypes[] = measures.map(() => DefaultMeasureTypes.sum);
test('BaseCuboid', () => {
    let t0 = new Date().getTime();
    // const baseCuboid = new BaseCuboid(dataSource, dimensions, measures, ops);
    // baseCuboid.build();
    // const result = baseCuboid.query();
    // console.log("time cost cuboid", new Date().getTime() - t0);
    
    const bitFunc = liteKeyAggregate(dataSource, dimensions, measures);
    t0 = new Date().getTime();
    const bitResult = bitFunc();
    console.log("time cost bit", new Date().getTime() - t0);
    t0 = new Date().getTime();
    const stdResult = simpleAggregate(dataSource, dimensions, measures);
    console.log("time cost std", new Date().getTime() - t0);
    // t0 = new Date().getTime();
    // const oldResult = createCube({
    //     dimensions,
    //     measures,
    //     factTable: dataSource,
    //     type: 'moment'
    // })
    // oldResult.buildTree();
    // oldResult.aggTree();
    // console.log("time cost std", new Date().getTime() - t0);
    // t0 = new Date().getTime();
    expect(bitResult.length).toBe(stdResult.length);
    // expect(result.length).toBe(stdResult.length);
    // expect(baseCuboid.nestTree).toBeDefined();
    // expect(result.length > 0).toBe(true);
})