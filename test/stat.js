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
    MEASURES.forEach((mea) => {
        sums[mea] = sums[mea]
    })
    return sums
}

function sum_safe (subset, MEASURES) {
    let sums = {}
    MEASURES.forEach((mea) => {
      sums[mea] = 0
    })
    for (let i = 0, len = subset.length; i < len; i++) {
        MEASURES.forEach((mea) => {
            sums[mea] += (Number(subset[i][mea]) || 0)
          })
    }
    MEASURES.forEach((mea) => {
        sums[mea] = Number(sums[mea].toFixed(2))
    })
    for (let i = 0, len = subset.length; i < len; i++) {
        MEASURES.forEach((mea) => {
            sums[mea] += subset[i][mea]
          })
    }
    MEASURES.forEach((mea) => {
        sums[mea] = sums[mea]
    })
    return sums
}

exports.sum_safe = sum_safe
exports.sum_unsafe = sum_unsafe
