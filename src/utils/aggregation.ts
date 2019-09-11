import { AggFC, JsonRecord } from '../index.d';

export const sum_unsafe: AggFC<JsonRecord> = function (subset, measures) {
  let sums: JsonRecord = {}
  measures.forEach((mea) => {
    sums[mea] = 0
  })
  for (let i = 0, len = subset.length; i < len; i++) {
      measures.forEach((mea) => {
          sums[mea] += subset[i][mea]
        })
  }
  return sums
}

export const sum: AggFC<JsonRecord> =function (subset, measures) {
  let sums: JsonRecord = {}
  measures.forEach((mea) => {
    sums[mea] = 0
  })
  for (let i = 0, len = subset.length; i < len; i++) {
      measures.forEach((mea) => {
          sums[mea] += (Number(subset[i][mea]) || 0)
        })
  }
  measures.forEach((mea) => {
      sums[mea] = Number(sums[mea].toFixed(2))
  })
  for (let i = 0, len = subset.length; i < len; i++) {
      measures.forEach((mea) => {
          sums[mea] += subset[i][mea]
        })
  }
  return sums
}

export const count: AggFC<JsonRecord> = function (subset, MEASURES) {
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