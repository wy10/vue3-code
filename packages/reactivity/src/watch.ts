import { isFunction, isObject } from "@vue/shared";
import { ReactiveEffect } from "./effect";
import { isReactive } from "./reactive";

function traversal(value,set = new Set()) { // 如果对象中有循环引用的问题
  // 不是对象就不想再递归了
  if(!isObject(value)) return value
  if(set.has(value)) {
    return value
  }
  set.add(value)
  for(let key in value) {
    traversal(value[key],set)
  }
  return value
}

export function watch(source,cb) {
  let getter;
  if(isReactive(source)) {
    // 对用户传入的数据进行循环，递归循环，访问属性的时候手机effect
    getter = () => traversal(source)
  }else if(isFunction(source)) {
    getter = source
  }
  let oldValue
  const job = () =>{
    const newValue = effect.run()
    cb(oldValue,newValue)
    oldValue = newValue
  }
  const effect = new ReactiveEffect(getter,job)  // 监控自己构造的函数，变化后重新执行job
  oldValue = effect.run()

}