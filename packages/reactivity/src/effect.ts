export let activeEffect = undefined

function cleanupEffect(effect) {
  const { deps } = effect
  for(let i = 0; i < deps.length; i++) {
    deps[i].delete(effect)  // 解除effect,重新依赖收集
  }
  effect.deps.length = 0
}
export class ReactiveEffect {
  public active = true
  public parent = null
  public deps = []   //记录依赖了哪些属性，当这些属性被删除的时候，effect也需要被删除
  constructor(public fn, public scheduler) {}
  run() {  
    if(!this.active) {
      return this.fn()
    }
    try {
      this.parent = activeEffect
      activeEffect = this
      // 在用户执行之前 将之前的内容清空,下面的这种情况是不应该触发effect的
      // state.flag = true
      // effect(()=>{
      //   state.flag?state.name:state.age
      // })
      // state.flag = false
      // state.name = "123"
      cleanupEffect(this)
      return this.fn()
    }finally{
      activeEffect = this.parent
      this.parent = null
    }
  
  }
  stop() {
    if(this.active) {
      this.active = false
      cleanupEffect(this)
    }
  }
}

// effect(()=>{
      //   state.flag?state.name:state.age
      // },{ scheduler(){} })
export function effect(fn, options:any = {}) {
  // fn 可以根据状态变化重新执行，effect可以嵌套写
  const _effect = new ReactiveEffect(fn,options.scheduler)
  _effect.run()
  const runner = _effect.run.bind(this)
  runner.effect = _effect
  return runner
}

// 最开始的思路是栈[e1,e2]
// 树形结构

// effect(()=>{ e1      parent = null,activeEffect = e1, name -> e1
//   state.name
//   effect(()=>{ e2    parent = e1, activeEffect = e2, age -> e2
//     state.age
//   })
//   state.address      activeEffect = e2.parent
// })

// {
    // weakmap
//   {
//     name:'xx',
//     age:18
//   }:{
        // map
//     name:[e1], //set
//     addresss:[e1],
//     age:[e2]
//   },

// }
const targetMap = new WeakMap()
export function track(target,type,key) {
  if(!activeEffect) return
  // 依赖收集
  let depsMap = targetMap.get(target)
  if(!depsMap) {
    targetMap.set(target,(depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if(!dep) {
    depsMap.set(key,(dep = new Set()))
  }
  trackEffect(dep)
}

export function trackEffect(dep){
  if(activeEffect) {
    // set可以自动去重，但是会浪费性能，判断之后添加属于性能优化
    let shouldTrack = !dep.has(activeEffect)
    if(shouldTrack) {
      dep.add(activeEffect)
      // 直接存 当前 name:对应的所有effect,当name不存在的时候 所有的effect也不应该存在了
      activeEffect.deps.push(dep)
    }
  }
}

export function trigger(target,type,key,value,oldValue) {
  const depsMap = targetMap.get(target)
  if(!depsMap) return
  let effects = depsMap.get(key)
  // 执行直线先拷贝一份，不要在原Set循环，比如我在循环的过程中又往Set里面放数据 程序就会崩溃
  if(effects) {
    triggerEffect(effects)
  }
}

export function triggerEffect(effects) {
  effects = new Set(effects)
  effects && effects.forEach(effect => {
    // 屏蔽掉无限调用 情况：在effect中为属性赋值,只让此effect只执行一次
    if(effect !== activeEffect) {
      if(effect.scheduler) {
        effect.scheduler()
      } else {
        effect.run()
      }
    }
  });
}