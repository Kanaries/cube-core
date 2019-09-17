const fs = require('fs')
const { createCube, sum, sum_unsafe } = require('../../built/index.js')

let t1, t0;
t0 = new Date().getTime();
let data = [], cnt = 0
// let data = JSON.parse(fs.readFileSync('../../data/library/cuts/libmax.json').toString())
let config = JSON.parse(fs.readFileSync('../../../data/library/library-config.json').toString())

var JSONStream = require('JSONStream');
    var  es = require('event-stream');

    fileStream = fs.createReadStream('../../../data/library/cuts/3lib.json', {encoding: 'utf8'});
        fileStream.pipe(JSONStream.parse('*')).pipe(es.through(function (record) {
            cnt++;
            data.push(record)
            if (cnt % 1000000 === 0) {console.log(cnt/1000000)}

            return record;
        },function end () {
          t1 = new Date().getTime();
          console.log('read/json parse cost', t1 - t0)
          let Dimensions = config.Dimensions.slice(0, 5)
          let Measures = config.Measures.slice(0, 2)
          let dataset = createCube({
            type: 'period',
            aggFunc: sum_unsafe,
            factTable: data,
            dimensions: Dimensions,
            measures: Measures
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
        //   console.log(dataset.tree)

          }));




// console.log(data)
