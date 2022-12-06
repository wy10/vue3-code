export let activeEffect = undefined

function cleanupEffect(effect) {
  const { deps } = effect
  for(let i = 0; i < deps.length; i++) {
    deps[i].delete(effect)  // 解除effect,重新依赖收集/清除set中的effect,重新将effect放入对应属性的set中
  }
  effect.deps.length = 0
}
// 让effect记录他依赖哪些属性，同时也要记录当前的属性依赖哪些effect
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
      // 每次执行effect的时候，都需要把自己从对应属性的set中清除掉，然后重新把自己添加到对应属性的set中
      // cleanupEffect实在是太绕了，举例子说明吧，比如下面的情况，第一次执行的时候

      /**
       * flag:[e1],name:[e1]; e1.dep = [{name:[e1],flag:[e1]}]
       */

      // 改变state.flag = fasle
      /**
       * flag:[e1]中的e1开始run, e1.dep=[{name:[]},{flag:[]}],重新收集 flag:[newe1],age:[newe1]
       */
       
      // state.flag = true
      // effect(()=>{
      //   state.flag?state.name:state.age
      // })
      // state.flag = false
      // state.name = "123"     这个时候name中的set已经为空，不在执行e1

      cleanupEffect(this)
      // 走proxy中的get方法，相当于做依赖收集
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
  // fn 可以根据状态变化重新执行，effect可以嵌套写,把fn(effect)包装成响应式的effect
  const _effect = new ReactiveEffect(fn,options.scheduler)
  _effect.run()
  // runner.effect.stop() runner()
  const runner = _effect.run.bind(_effect)
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
      // 当前effect依赖哪些属性 
      activeEffect.deps.push(dep)
    }
  }
}

export function trigger(target,type,key,value,oldValue) {
  const depsMap = targetMap.get(target)
  if(!depsMap) return
  let effects = depsMap.get(key)
  // 先拷贝一份，不要在原Set循环，比如我在循环的过程中又往Set里面放数据 程序就会崩溃
  if(effects) {
    triggerEffect(effects)
  }
}

export function triggerEffect(effects) {
  effects = new Set(effects)
  effects && effects.forEach(effect => {
    /** 
     *  最新注释：目前这个effect !== activeEffect 没什么用了，因为在执行effect函数的时候,会将该effect从属性的set中移除
     *  当在effect中为属性赋值的时候，set中并不能拿到effect了，不会造成循环执行
     * // 视频中的讲解：屏蔽掉无限调用 情况：在effect中为属性赋值,只让此effect只执行一次 这个是发生在还没有执行cleanupEffect的时候
    */
    if(effect !== activeEffect) {
      if(effect.scheduler) {
        effect.scheduler()
      } else {
        effect.run()
      }
    }
  });
}