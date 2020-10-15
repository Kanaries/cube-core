import { JsonRecord } from "../types";
import { sum } from "./aggregation";

export function simpleAggregate(
    dataSource: JsonRecord[],
    dimensions: string[],
    measures: string[]
) {
    const spliter = "_join_";
    let dataFrames: Map<string, any[]> = new Map();
    const encodingDataSource = dataSource.map(record => {
        let key = dimensions.map(d => record[d]).join(spliter);
        let nextRecord: JsonRecord = {
            key
        };
        for (let mea of measures) {
            nextRecord[mea] = record[mea];
        }
        return nextRecord;
    });
    const t = new Date().getTime();
    for (let record of encodingDataSource) {
        // let key = dimensions.map(d => record[d]).join(spliter);
        let key = record.key;
        if (!dataFrames.has(key)) {
            dataFrames.set(key, []);
        }
        dataFrames.get(key).push(record);
    }
    const t1 = new Date().getTime();
    console.log("group by cost", t1 - t);
    let ans: JsonRecord[] = [];
    for (let [key, frame] of dataFrames) {
        const result = sum(frame, measures);
        const dimValeus = key.split(spliter);
        dimensions.forEach((dim, i) => {
            result[dim] = dimValeus[i];
        });
        ans.push(result);
    }
    return ans;
}

export function liteKeyAggregate(
    dataSource: JsonRecord[],
    dimensions: string[],
    measures: string[]
) {
    const key2index: Map<string, Map<any, number>> = new Map();
    const index2key: Map<string, any[]> = new Map();
    // for (let dim of dimensions)
    for (let dim of dimensions) {
        let dict: Map<any, number> = new Map();
        let list: any[] = [];
        key2index.set(dim, dict);
        index2key.set(dim, list);
        for (let record of dataSource) {
            if (!dict.has(record[dim])) {
                dict.set(record[dim], dict.size);
                list.push(record[dim]);
            }
        }
    }
    return () => {
        const encodingDataSource = dataSource.map(record => {
            let key = 0;
            for (let dim of dimensions) {
                key = key << Math.ceil(Math.log2(key2index.get(dim).size)) || 1;
                key += key2index.get(dim).get(record[dim]);
            }
            let nextRecord: JsonRecord = {
                key
            };
            for (let mea of measures) {
                nextRecord[mea] = record[mea];
            }
            return nextRecord;
        });
        let maxBit = 1;
        for (let item of key2index.values()) {
            console.log(item.size, maxBit);
            maxBit = maxBit << (Math.ceil(Math.log2(item.size)) || 1);
        }

        const t = new Date().getTime();
        let dataFrames: any[][] = new Array(maxBit).fill(null);
        console.log(maxBit, dataFrames);
        for (let record of encodingDataSource) {
            let key = record.key;
            if (!dataFrames[key]) {
                dataFrames[key] = [];
            }
            dataFrames[key].push(record);
        }
        const t1 = new Date().getTime();
        console.log("group by cost", t1 - t);
        let ans: JsonRecord[] = [];
        for (let key = 0; key < dataFrames.length; key++) {
            if (dataFrames[key] === null) continue;
            console.log(dataFrames[key]);
            const result = sum(dataFrames[key], measures);
            const dimValeus: any = [];
            for (let i = dimensions.length - 1; i >= 0; i--) {
                let bsize =
                    1 <<
                    (Math.ceil(Math.log2(key2index.get(dimensions[i]).size)) ||
                        1);
                let index = key && bsize - 1;
                key = key >> bsize;
                dimValeus.push(index2key.get(dimensions[i])[index]);
            }
            dimensions.forEach((dim, i) => {
                result[dim] = dimValeus[i];
            });
            ans.push(result);
        }
        return ans;
    };
}
