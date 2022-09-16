import { isObject } from "@vue/shared";
import { mutableHandlers, ReactiveFlags } from './baseHandler';

const reactiveMap = new WeakMap()

export function isReactive(value) {
  return !!(value && value[ReactiveFlags.IS_REACTIVE])
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
  const proxy = new Proxy(target,mutableHandlers)
  reactiveMap.set(target,proxy)
  return proxy
}