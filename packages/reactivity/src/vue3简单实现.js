function reactive(target) {
  let baseHandler = {
    get(target,key,receiver){
      // 收集依赖
      track(target,key)
      const result = Reflect.get(target,key,receiver)
      return result
    },
    set(target,key,value,receiver){
      const result = Reflect.set(target,key,value,receiver)
      // 触发依赖
      trigger(target,key)
      return result
    }
  }
  return new Proxy(target,baseHandler)
}
let currentEffect = undefined
//依赖收集 和 触发 
class Effect {
  constructor(fn) {
    this.fn = fn
  }
  run() {
    currentEffect = this
    return this.fn()
  }
}

function trigger(target,key) {
  const dep = targetMap.get(target)
  if(dep) {
    const set = dep.get(key)
    if(set) {
      for(let value of set.values()) {
        value.run()
      }
    }
  }
}
// 将属性和依赖进行对应收集
const targetMap = new WeakMap()
function track(target,key) {
  let dep = targetMap.get(target)
  if(!dep) {
    targetMap.set(target,dep = new Map())
  }
  let set = dep.get(key)
  if(!set) {
    dep.set(key,set = new Set())
  }
  set.add(currentEffect)
}

function effect(fn) {
  const effectO = new Effect(fn)
  effectO.run()
}

const state = reactive({
  name:'wenyan',
  addr:{
    str:'中和街道',
    code:'10001'
  }
})

// effect(()=>{
//   console.log(state.name)
// })

class computedRef {
  constructor(getter,setter) {
    this.getter = getter
    this.setter = setter
  }
  get value() {
    let effect = new Effect(this.getter)
    return effect.run()
  }
  set value(newValue) {
    this.setter(newValue)
  }
}
function computed(objOrFn) {
  let getter;
  let setter;
  if(typeof objOrFn === 'function'){
    getter = objOrFn
    setter = function (params) {}
  }
  if(typeof objOrFn === 'object') {
    getter = objOrFn.get
    setter = objOrFn.set
  }
  return new computedRef(getter,setter)
}

// let stateComputed = computed(()=>{
//   return 'hello' + state.name
// })
const stateComputed = computed({
    get() {
      return 'xxx' + state.name
    },
    set(newValue) {
      state.name = newValue
    }
})

state.name="ha"
console.log(stateComputed.value)

stateComputed.value = "lo"
console.log(stateComputed.value)

