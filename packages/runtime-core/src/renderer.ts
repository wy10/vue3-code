import { reactive } from "@vue/reactivity"
import { hasOwn, isFunction, isObject, isString, ShapeFlags } from "@vue/shared"
import { ReactiveEffect } from "packages/reactivity/src/effect"
import { createComponentInstance } from "."
import { createVnode, isSameVnode, Text } from "./vnode"

function getSequence(arr) {
  let len = arr.length
  const result = [0] // 这里方的是索引
  let p = arr.slice(0)
  let lastIndex
  let start
  let end
  let middle
  for (let i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      lastIndex = result[result.length - 1]
      if (arr[lastIndex] < arrI) {
        // 记录当年前前一个人索引
        p[i] = lastIndex
        result.push(i)
        continue
      }
      // 二分查找替换元素
      start = 0;
      end = result.length - 1
      while (start < end) {
        middle = Math.floor((start + end) / 2)
        // 找到序列中间的值，通过索引找到对应的值
        if (arr[result[middle]] < arrI) {
          start = middle + 1
        } else {
          end = middle
        }
      }
      if (arrI < arr[result[start]]) {
        p[i] = result[start - 1] //替换索引
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
export function initProps(instance, rawProps) {
  const props = {}
  const attrs = {}
  const options = Object.keys(instance.propsOptions) //用户注册过的props
  if (rawProps) {
    for (let key in rawProps) {
      const value = rawProps[key]
      if (options.includes(key)) {
        props[key] = value
      } else {
        attrs[key] = value
      }
    }
  }
  instance.props = reactive(props)
  instance.attrs = attrs
}
export function createSetupContext(instance) {
  return {
    attrs: instance.attrs,
    slots: instance.slots,
    emit: instance.emit,
    expose: (exposed) => instance.exposed = exposed || {}
  }
}
export function setupStatefullComponent(instance) {
  // 核心就是调用组件的setup方法
  const Component = instance.type
  const { setup } = Component
  instance.proxy = new Proxy(instance.ctx, {
    get({ _: instance }, key, receiver) {
      const { setupState, props } = instance
      if (hasOwn(setupState, key)) {
        return setupState[key]
      } else if (hasOwn(props, key)) {
        return props[key]
      }
    },
    set({ _: instance }, key, value, receiver) {
      const { setupState, props } = instance   //props不可以修改
      if (hasOwn(setupState, key)) {
        return setupState[key] = value
      } else if (hasOwn(props, key)) {
        console.warn("props are readonly")
      }
      return true
    }
  })
  if (setup) {
    const setupContext = createSetupContext(instance)
    let setupResult = setup(instance.props, setupContext)
    if (isFunction(setupResult)) {
      instance.render = setupResult //如果setup返回的是函数，那么就是render函数
    } else if (isObject(setupResult)) {
      instance.setupState = setupResult
    }
  }
  if (!instance.render) {
    // 如果没有render，而写的是template,则要模板编译
    instance.render = Component.render
  }
}
export function setupComponent(instance) {
  const { props, children } = instance.vnode
  // 组件的属性初始化
  initProps(instance, props)
  // 插槽的初始化

  setupStatefullComponent(instance)
}
// render('h1',{style:{color:'red'},onClick:()=>alert(1)},h('span','world'),'hello'),app)
// h(Text,'hello')
//创建虚拟dom 
export function createRenderer(renderOptions) {
  let {
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
    setText: hostSetText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    createElement: hostCreateElement,
    createText: hostCreateText,
    patchProps: hostPatchProps
  } = renderOptions
  function normalize(child) {
    if (isString(child)) {
      return createVnode(Text, null, child)
    }
    return child
  }
  function mountChildren(children, container) {
    for (let i = 0; i < children.length; i++) {
      let child = normalize(children[i])
      patch(null, child, container)
    }
  }
  function setupRenderEffect(initialVNode, instance, container) {
    // 创建渲染effect
    // 核心就是调用render，数据变化就重新调用render
    const componentUpdateFn = () => {
      let { proxy } = instance // render中的参数
      if (!instance.isMounted) {
        const subTree = instance.subTree = instance.render.call(proxy, proxy)
        // 组件的初始化流程
        patch(null, subTree, container) //稍后渲染完subTree 会生成真实节点之后挂载
        instance.isMounted = true
      } else {
        // 组件更新流程,做diff算法，比较前后两棵树
        const prevTree = instance.subTree
        const nextTree = instance.render.call(proxy, proxy)
        patch(prevTree, nextTree, container)
      }
    }
    const effect = new ReactiveEffect(componentUpdateFn, () => { })
    const update = effect.run.bind(effect)
    update()
  }
  function mountComponent(initialVNode, container) {
    // 1.给组件创造一个实例
    const instance = initialVNode.component = createComponentInstance(initialVNode)
    // 2.需要给组件的实例进行赋值操作
    setupComponent(instance)
    // 3.调用render方法实现组件的渲染逻辑，如果依赖发生变化，组件要重新渲染
    setupRenderEffect(initialVNode, instance, container)
  }
  function mountElement(vnode, container, anchor) {
    let { type, props, children, shapeFlag } = vnode
    let el = vnode.el = hostCreateElement(type)  //将真实元素挂载到这个虚拟节点上
    if (props) {
      for (let key in props) {
        hostPatchProps(el, key, null, props[key])
      }
    }
    if (shapeFlag && ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children)
    } else if (shapeFlag && ShapeFlags.ARRAY_CHILDREN) {
      // 如果有儿子并且是数组的话
      mountChildren(children, el)
    }
    hostInsert(el, container, anchor)
  }
  const processText = (n1, n2, container) => {
    if (n1 == null) {
      hostInsert((n2.el = hostCreateText(n2.children)), container)
    } else {
      const el = n2.el = n1.el
      if (n1.children !== n2.children) {
        hostSetText(el, n2.children)
      }
    }
  }
  const patchProps = (oldProps, newProps, el) => {
    for (let key in newProps) {
      hostPatchProps(el, key, oldProps[key], newProps[key])
    }
    for (let key in oldProps) {
      if (newProps[key] === null) {
        hostPatchProps(el, key, oldProps[key], null)
      }
    }
  }
  const unmountChildren = (children) => {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i])
    }
  }
  /**
   *h('div',{},[ h('li',{key:'a'},'a'),h('li',{key:'b'},'b')])
    h('div',{},[ h('li',{key:'b'},'b'),h('li',{key:'c'},'c')])
   */
  const patchKeyedChildren = (c1, c2, container) => {
    let e1 = c1.length - 1
    let e2 = c2.length - 1
    let i = 0 // 指针
    // sync from start  1,2,3    1,2,      [i = 2,e1 = 2,e2 = 1]
    // sync from start  1,2      1,2,3     [i = 2,e1 = 1,e2 = 2]
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSameVnode(n1, n2)) { //两个节点是相同节点，则需要比较孩子和自身的属性
        patch(n1, n2, container)
      } else {
        break
      }
      i++
    }
    // sync from end  1,2,3    2,3          [i = 0,e1 = 0,e2 = -1]
    // sync from end  2,3      1,2,3        [i = 0,e1 = -1,e2 = 0]
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]
      if (isSameVnode(n1, n2)) { //两个节点是相同节点，则需要比较孩子和自身的属性
        patch(n1, n2, container)
      } else {
        break
      }
      e1--
      e2--
    }
    // sync from start  1,2    1,2,3     [i = 2,e1 = 1,e2 = 2]
    // sync from end    2,3    1,2,3     [i = 0,e1 = -1,e2 = 0]
    if (i > e1) {
      // 新的比老的多
      if (i <= e2) {
        // 新增元素
        const nextPos = e2 + 1
        // 如果有值说明是在头部追加，如果没有说明是在尾部追加
        const anchor = c2[nextPos] ? c2[nextPos] : null
        while (i <= e2) {
          patch(null, c2[i], container, anchor) //插入需要参照物
          i++
        }
      }
    } else if (i > e2) {
      // 新的比老的少，删除多余老的
      // sync from start  1,2,3    1,2,      [i = 2,e1 = 2,e2 = 1]
      // sync from end    1,2,3    2,3       [i = 0,e1 = 0,e2 = -1]
      while (i <= e1) {
        unmount(c1[i])
        i++
      }
    }
    // 乱序的情况 c，d，e     e，c，d，h
    const s1 = i
    const s2 = i
    // 用新节点创建映射表，用老列表项在新映射表中查找，有复用老的，没有删除老的，新的多余的增加
    const keyToNewIndexMap = new Map()
    for (let i = s2; i <= e2; i++) {
      const child = c2[i]
      keyToNewIndexMap.set(child.key, i)
    }
    const toBepatched = e2 - s2 + 1    // [e,c,d,h]
    const newIndexToOldMapIndex = new Array(toBepatched).fill(0)   //最长递增子序列
    // 拿老的去新的中查找
    for (let i = s1; i <= e1; i++) {  //c，d，e
      const prevChild = c1[i]
      const newIndex = keyToNewIndexMap.get(prevChild.key)
      if (newIndex === undefined) {
        unmount(prevChild)
      } else {
        // 将老数组[c,d,e]的位置+1 映射到[e=0,c=0,d=0,h=0]的数组中 =>[3,1,2,0]
        newIndexToOldMapIndex[newIndex - s2] = i + 1 //保证填的肯定不是0
        // 比较两节点 patchAttr patchChildren
        patch(prevChild, c2[newIndex], container)
      }
    }
    let queue = getSequence(newIndexToOldMapIndex)  //[c,d]
    let j = queue.length - 1
    for (let i = toBepatched - 1; i >= 0; i--) {
      let lastIndex = s2 + i
      let lastChild = c2[lastIndex]
      let anchor = lastIndex + 1 < c2.length ? c2[lastIndex + 1].el : null
      if (newIndexToOldMapIndex[i] === 0) {
        patch(null, lastChild, container, anchor)
      } else {
        // 性能消耗，最长递增子序列，减少dom的插入操作
        if (i !== queue[j]) {
          hostInsert(lastChild.el, container, anchor) //将列表倒叙插入
        } else {
          j--   //元素不需要移动[a,b,c,d,e,q,f,g] => [a,b,e,c,d,h,f,g]
        }
      }
    }
  }
  const patchChildren = (n1, n2, el) => {
    // 比较两个虚拟节点的儿子的差异，el就是当前的父节点
    const c1 = n1.children
    const c2 = n2.children
    // 比较两个儿子列表的差异
    /** 
    1. 都是文本
    2. 老的是数组，新的是文本
    3. 老的是文本，新的是数组
    4. 新老都是数组
    */
    /* 
     1.新的有儿子，旧的没有儿子
     2.旧的有儿子，新的没有儿子
     3.新旧儿子都是文本
     4.新旧儿子都是数组
    */
    const prevShapeFlag = n1.shapeFlag
    const shapeFlag = n2.shapeFlag
    // 现在是文本1，2两种情况合并
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 1. 之前是数组
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1)
      }
      hostSetElementText(el, c2)

    } else {
      // 现在是数组，但是存在数组为空的情况
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 1. 老的是数组 
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          patchKeyedChildren(c1, c2, el)
        } else {
          // 新数组有可能为空
          unmountChildren(c1)
        }
      } else {
        // 之前是文本
        hostSetElementText(el, '')
        mountChildren(c2, el)
      }
    }
  }
  const patchElement = (n1, n2) => {  //先复用 在比较属性 在比较儿子
    let el = n2.el = n1.el
    let oldProps = n1.props || {}
    let newProps = n2.props || {}
    patchProps(oldProps, newProps, el)
    patchChildren(n1, n2, el)
  }
  const processElement = (n1, n2, container, anchor) => {
    if (n1 === null) {
      // 组件的初始化
      mountElement(n2, container, anchor)
    } else {
      // 组件的更新
      patchElement(n1, n2)
    }
  }
  const processComponent = (n1, n2, container, anchor = null) => {
    if (n1 === null) {
      // 组件的初始化
      mountComponent(n2, container)
    } else {
      // 组件的更新
    }
  }
  const patch = (n1, n2, container, anchor = null) => {
    if (n1 == n2) return
    if (n1 && !isSameVnode(n1, n2)) {
      unmount(n1)
      n1 = null
    }
    const { type, shapeFlag } = n2
    switch (type) {
      case Text:
        processText(n1, n2, container)
        break;

      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, anchor)
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          processComponent(n1, n2, container)
        }
        break;
    }
  }
  const unmount = (vnode) => {
    hostRemove(vnode.el)
  }
  // 这个函数代表两种可能性，一个是dom挂载到容器中，一个是删除容器的内容
  const render = (vnode, container) => {
    if (vnode === null) {
      if (container._vnode) {
        unmount(container._vnode)
      }
    } else {
      // 这里既有初始化的逻辑 又有更新的逻辑
      patch(container._vnode || null, vnode, container)
    }
    container._vnode = vnode
  }
  return {
    render
  }
}

// 文本的处理，需要自己增加类型，因为不能通过document.createElement('文本')
// 我们如果传入null的时候在渲染，则是卸载逻辑，需要将dom节点删掉