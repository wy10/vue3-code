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
// source 有可能是用户传入的对象有可能是函数
export function watch(source,cb) {
  let getter;
  if(isReactive(source)) {
    // 对用户传入的数据进行循环，递归循环的目的是为了收集effect
    getter = () => traversal(source)
  }else if(isFunction(source)) {
    getter = source
  }
  let oldValue
  let cleanup
  const onCleanup = (fn) =>{
    cleanup = fn //保存用户的函数 
  }
  const job = () =>{
    if(cleanup) cleanup()  //下一次watch开始触发上一次的watch的清理,只改变用户最后一次触发watch的值
    const newValue = effect.run()
    cb(oldValue,newValue,onCleanup)
    oldValue = newValue
  }
  const effect = new ReactiveEffect(getter,job)  // 属性变化后，执行job
  oldValue = effect.run()  //source中的所有属性都收集当前这个effect

}
// 执行上一次console.log()
// let clean
// function cleanUp(fn) {
//   clean = fn
// }

// function trigger(cb) {
//   if(clean) {
//     clean()
//   }
//   cb(cleanUp)
// }

// trigger((cleanUp)=>{ cleanUp(()=>console.log("x"))})
// trigger((cleanUp)=>{ cleanUp(()=>console.log("xx"))})
// trigger((cleanUp)=>{ cleanUp(()=>console.log("xxx"))})