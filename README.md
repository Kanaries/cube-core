# Pivot Util
pivot util 是一个高效的Cube求解工具，你可以借助它来实现快速的Cube运算或搭建pivot table组件。

## 使用

```bash
npm install --save pivot-util
```

```js
import {DataSet} from 'pivot-util'
```

初始化一个数据集
```js
const ds = new Dataset({
    DIMENSIONS: ['Age', 'Sex'],
    MEASURES: ['Survied'],
    FACT_TABLE: [{},{},...,{}],
    aggFunc: () => {return {}}
})
```

建树
```js
ds.buildTree()
```

聚合树
```js
ds.aggTree()
```

