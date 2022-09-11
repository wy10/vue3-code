import { isObject } from '@vue/shared'
import { track,trigger } from './effect'
import { reactive } from './reactive'
export const enum ReactiveFlags {
  IS_REACTIVE = '__v__isReactive'
}
export const mutableHandlers  = {
  get(target, key, receiver) {
    if(key === ReactiveFlags.IS_REACTIVE) {
      return true
    }
    // 订阅
    track(target,'get',key)
    const result = Reflect.get(target,key,receiver)
    if(isObject(result)) return reactive(result)
    return result
  },
  set(target,key,value,receiver) {
    let oldValue = target[key]
    let result = Reflect.set(target,key,value,receiver)
    if(oldValue != value) {
      // 发布
      trigger(target,'set',key,value,oldValue)
    } 
    return result
  }
}

// 对象某个属性 -> 多个effect
// WeakMap = {对象:Map{name:Set}}
// { 对象：{name:[]}}