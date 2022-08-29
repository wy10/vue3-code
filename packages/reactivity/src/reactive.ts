import { isObject } from "@vue/shared";

const reactiveMap = new WeakMap()
const enum ReactiveFlags {
  IS_REACTIVE = '__v__isReactive'
}
// 同一个对象被代理多次需要返回同一个代理
// 代理对象被再次代理，直接返回
export function reactive(target) {
  if(!isObject(target)) {
    return
  }

  if(target[ReactiveFlags.IS_REACTIVE]) {
    return target
  }

  let exisittingProxy = reactiveMap.get(target)
  if(exisittingProxy) return exisittingProxy
  const proxy = new Proxy(target,{
    get(target,key,receiver) {
      if(key === ReactiveFlags.IS_REACTIVE) {
        return true
      }
      return Reflect.get(target,key,receiver)
    },
    set(target,key,value,receiver) {
      return Reflect.set(target,key,value,receiver)
    }
  })
  reactiveMap.set(target,proxy)
  return proxy
}