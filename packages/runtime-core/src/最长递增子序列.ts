// 2,3,8,9,5,6,7,12,22 求最长递增子序列长度 递增序列可以采用二分查找
// 2,3,8,9,12,22
// 2,3,5,6,7,12,22
// 找更有潜力的数值，比末尾小这个数值更有潜力，就用替换的方式找到当前序列中比这个元素打的值替换
function getSequence(arr){
  let len = arr.length
  const result  = [0] // 这里方的是索引
  let p = arr.slice(0)
  let lastIndex
  let start
  let end
  let middle
  for(let i = 0; i < len; i++){
    const arrI = arr[i]
    if(arrI !== 0){
      lastIndex = result[result.length - 1]
      if(arr[lastIndex] < arrI){
        // 记录当年前前一个人索引
        p[i] = lastIndex
        result.push(i)
        continue
      }
      // 二分查找替换元素
      start = 0;
      end = result.length -1
      while (start < end) {
        middle = Math.floor((start + end) / 2)
        // 找到序列中间的值，通过索引找到对应的值
        if(arr[result[middle]] < arrI){
          start = middle + 1
        }else {
          end = middle - 1
        }
      }
      if(arrI < arr[result[start]]){
        p[i] = result[start -1] //替换索引
        result[start] = i   // 找到更有潜力的替换之前的（贪心算法）但这里[0,1,4,3]结果是错误的
      }
    }
  }
  let i = result.length //拿到最后一个向前追溯
  let last = result[i - 1]
  while (i-- > 0) {
    result[i] = last
    last = p[last]
  }
  return result
}

let arr1 = [1,2,3,4,5,6,7,0]
let arr2 = [2,3,8,9,5]   // => [0,1,2,3] [0,1,4,3] 贪心加上二分查找替换的结果是错误的
let arr3 = [2,3,1,5,6,8,7,9,4]
console.log(getSequence(arr2))