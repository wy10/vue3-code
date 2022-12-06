import { isFunction } from "@vue/shared"
import { ReactiveEffect, trackEffect, triggerEffect } from "./effect";
// 类中的访问器属性 基于的是 defineProperty
class ComputedRefImpl {
  public effect
  public _dirty = true
  public __v_isReadonly = true
  public __v_isRef = true
  public _value
  public dep
  constructor(getter,public setter){
    // 将计算属性的函数包装成effect
    this.effect = new ReactiveEffect(getter,()=>{
      // 依赖改变之后要触发这个调度器
      if(!this._dirty) {
        this._dirty = true
        triggerEffect(this.dep)
      }
    })
  }
  // 取计算属性值的时候进行依赖收集
  get value(){
    trackEffect(this.dep || (this.dep = new Set()))
    if(this._dirty) {
      this._dirty = false
      this._value = this.effect.run()
    }
    return this._value
  }
  set value(newValue){
    this.setter(newValue)
  }
}

export const computed = (getterOrOptions) => {
  let onlyGetter = isFunction(getterOrOptions)
  let getter;
  let setter;
  if(onlyGetter) {
    getter = getterOrOptions
    setter = () =>{}
  }else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
  return new ComputedRefImpl(getter,setter)
}

/** 
 * const state = reactive({age:1})
 * const comp = computed({
 *  get() {
 *    return state.age
 *  },
 *  set(val) {
 *    state.age = val
 *  } 
 * })
 * effect(() => console.log(comp.value))
 * comp.value = 3
 * 核心部分是this.effect = new ReactiveEffect(getter,()=>{})
 * 这个地方在computed中state.age = val 改变的时候是要触发这个调度器的，这个调度器中将会触发之前收集的effect(()=>console.log(comp.value)),
 * 间接实现了comp.value值改变，触发effect
 * 
 * 核心部分是get value()中的trackEffect收集了computed.value对应的effect(() => console.log(comp.value)),紧接着this.effect.run的时候，
 * 改变activeEffect为this.effect,此时state.age = val收集的是带有调度器的this.effect
*/