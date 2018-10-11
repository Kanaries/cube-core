# cube-core
cube-core 是一个高效的Cube求解工具，你可以借助它来实现快速的Cube运算或搭建pivot table组件。
如果你想了解能够使用cube-core做什么，可以了解一个基于cube-core实现的前端的高性能pivot table项目：[fast-pivot](https://github.com/ObservedObserver/fast-pivot)

## 使用

```bash
npm install --save cube-core
```

####  创建一个多维数据集
```js
import {createCube} from 'cube-core'

let cube = createCube ({
    aggFunc: (subset, measures) => {},
    factTable: [{}, {}, {}, ..., {}],
    dimensions: ['dim1', 'dim2', ..., 'dimn'],
    measures: ['mea1', 'mea2', ..., 'mean']
})
```
+ factTable: 事实表数据。
+ dimensions: 维度数组，对应事实表中的维度字段名
+ measures: 度量数组，对应事实表中的度量字段名
+ aggFunc: 聚合函数，接收两个参数subset（事实表的子集）, measures。示例：
```js
function sum_unsafe (subset, MEASURES) {
    let sums = {}
    MEASURES.forEach((mea) => {
      sums[mea] = 0
    })
    for (let i = 0, len = subset.length; i < len; i++) {
        MEASURES.forEach((mea) => {
            sums[mea] += subset[i][mea]
          })
    }
    return sums
}
```

你可以选择在做聚合运算时进行类型判断以防止意外的错误，但聚合运算将会是整个cube求解中很消耗资源的一部分、所以尽量保证将数据清洗、特殊处理的过程放在cube求解之前，保证cube拿到的faceTable是干净、安全的数据。

### API

#### cube.setData
`setData`会接收新的数据信息并根据信息重新计算聚合。
+ dimensions: (可选) 由维度字段名构成的数组
+ measures: (可选) 由度量字段名构成的数组
+ aggFunc: (可选) 聚合函数
+ factTable: (可选) 事实表数据

示例
```js
cube.setData({
    dimensions: Dimensions.slice(3)
})
```

#### cube.tree
cube中构建的聚合树(索引树)会构建在属性tree中，你可以尝试自定义的对tree上的每个节点进行操作。
节点node的结构为
```js
// moment cube
class Node {
    constructor () {
        this.children = new Map()
        this.rawData = []
    }
    push () {
        this.rawData.push(...arguments)
    }
    
    aggData (aggFunc, measures = []) {
        this._aggData = aggFunc(this.rawData, measures)
        return this._aggData
    }
}
// period cube
class pNode {
    constructor (aggFunc) {
        this.children = new Map()
        this._rawData = []
        this.aggFunc = aggFunc
        this.cache = false
    }
    push () {
        this._rawData.push(...arguments)
    }
    aggData (measures = []) {
        if (!this.cache) {
            this._aggData = this.aggFunc(this.rawData, measures)
            this.cache = true
        }
        return this._aggData
    }
    clearCache () {
        this.cache = false
    }
    get rawData () {
        if (!this.cache) {
            if (this.children.size !== 0) {
                let children = this.children.values()
                let rawData = []
                for (let child of children) {
                    let i, data = child.rawData;
                    let len = data.length;
                    for (i = 0; i < len; i++) {
                        rawData.push(data[i])
                    }
                }
                this._rawData = rawData
            }
            this.cache = true
        }
        return this._rawData
    }
}
```


#### node._aggData 与 node.aggData(aggFunc)
node 为tree上的任意节点，在node上，我们可以通过_aggData调用已经计算过的计算聚合值的缓存，也可以通过aggData(aggFunc)来重新获得当前节点基于聚合函数aggFunc的新的聚合值，这使得你可以在树的不同层级的不同节点使用不同的聚合方式。
```js
> node._aggData
> {profit: 120, cost: 200, count: 15}
```

#### node.rawData
为了支持更多的场景，你还可以直接从当前节点获取该节点对应的原始数据而非聚合数据。这在可视化类BI应用中的聚合度量模式切换时的实现会提供极大的便利（比如散点图）。
```js
> node.rawData
[
    {profit: 12, cost: 20, count: 1},
    {profit: 8, cost: 12, count: 1},
    {profit: 31, cost: 28, count: 1},
    {profit: 19, cost: 5, count: 1},
    ...
]
```

### 流程
![](http://carrot.zone:8080/lifecycle-core-cube.png)

## 测试
cube-core为你提供了最基本的算法正确性检验测试与时间测试，你只需要使用`npm test`即可进行测试。

在`./test/performance`中，有一些可以使用的对于真实数据集、尤其是那些非常大的数据集的测试脚本，你可以修改其中数据集文件的路径来使用自己的数据集进行测试。

### 在前端的使用
在前端使用时，你还需要将cube.tree转化成自己的UI渲染需要的数据结构。

### 个性化的优化

如果你能够定义两个聚合的快速合并方法，那么这棵树的性能可以大幅度提升。例如
> parent.sum = child1.sum + child2.sum + ... + childn.sum
> 而不是 parent.sum = sum(parent.rawData)

对于和、计数、平均值、最大、最小值甚至是K大数等，没有必要每次都重新聚合后的数组进行计算，而是根据子节点的聚合值完成O(1)的运算。但对于更复杂的场景，设计这样一个聚合运算会愈发艰难。所以，cube-core再设计Cube时仍为你提供了node.rawData这一属性以方便你应对更为复杂的场景。

但你很快会发现，如果能够通过定义节点聚合值得聚合方式，那么你会获得极高的时间与空间的收益。
