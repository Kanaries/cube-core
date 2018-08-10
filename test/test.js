const fs = require('fs')
const ds = require('../dist/bundle.js')
const { sum_safe, sum_unsafe } = require('./stat.js')
// const { TestTimer } = require('./testtimer.js')
const DataSet = ds.DataSet

// let timer = new TestTimer()
let t1, t0;
t0 = new Date().getTime();
let data = [], cnt = 0
// let data = JSON.parse(fs.readFileSync('../../data/library/cuts/libmax.json').toString())
let config = JSON.parse(fs.readFileSync('../../data/library/library-config.json').toString())

var JSONStream = require('JSONStream');
    var  es = require('event-stream');

    fileStream = fs.createReadStream('../../data/library/cuts/3lib.json', {encoding: 'utf8'});
        fileStream.pipe(JSONStream.parse('*')).pipe(es.through(function (record) {
            cnt++;
            data.push(record)
            if (cnt % 1000000 === 0) {console.log(cnt/1000000)}

            return record;
        },function end () {
          t1 = new Date().getTime();
          console.log('read/json parse cost', t1 - t0)
          let Dimensions = config.Dimensions.slice(0, 3)
          let Measures = config.Measures.slice(0, 1)
          let dataset = new DataSet({
            aggFunc: sum_unsafe,
            FACT_TABLE: data,
            DIMENSIONS: Dimensions,
            MEASURES: Measures
          })
          console.log('data length',data.length)
          console.log('Measures length', Measures.length)
          console.log('Dimensions length', Dimensions.length)
          t0 = new Date().getTime();
          dataset.buildTree()
          t1 = new Date().getTime();
          console.log('time cost for buildTree', t1 - t0)
          t0 = new Date().getTime();
          dataset.aggTree()
          t1 = new Date().getTime();
          console.log('time cost for aggTree', t1 - t0)

          }));




// console.log(data)
