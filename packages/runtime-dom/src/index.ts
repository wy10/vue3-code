import { createRenderer } from '@vue/runtime-core'
import { nodeOpts } from './nodeOps'
import { patchProp } from './patchProps'
import { isArray, isString, ShapeFlags } from '@vue/shared'

const renderOptions = Object.assign(nodeOpts, { patchProp })
// 创建web端的渲染器
export function render(vnode, container) {
  createRenderer(renderOptions).render(vnode, container)
}



export function createApp(...args) {
  let app = createRender(renderOptions).createApp(...args)
  let { mount } = app
  app.mount = (container) => {

    mount(container)
  }
  return app

}

// createRender =>runtime-core
export function createRender(renderOptions): any {
  const render = (vnode, container) => {
    // patch操作
    // 1. 创建组件实例 2. 初始化组件实例数据 3. 执行渲染
    const instance = vnode.component = createInstance(vnode)
    setInstance(instance)
  }
  return {
    createApp: apiCreateApp(render)
  }
}

export const createInstance = (vnode) =>{
  const instance = {
    vnode,
    type:vnode.type,
    subTree:null,
    props:{},
    attrs:{},
    slots:{},
    setUpstates:{},
    proxy:{},
    ctx:{}

  }
  instance.ctx = {_:instance}
  return instance
}

export const setInstance = (instance) =>{
  // 初始化props attrs proxy render
}

type RenderType = (x: any, y: any) => any

export function apiCreateApp(render: RenderType) {
  return function (rootComp, rootProp) {
    const mount = (container) => {
      let vnode = createVnode(rootComp, rootProp,null)
      render(vnode, container)
    }
    return {
      mount,
    }
  }
}

export function createVnode(rootComp,rootProp,children){
  /* 
  const rootComp = {
    setup(){
    },
    render(){
    }
  }
  */
 let shapeFlag = isString(rootComp)?ShapeFlags.ELEMENT:ShapeFlags.STATEFUL_COMPONENT
  const node =  {
    type:rootComp,
    props:rootProp,
    children,
    el:null,
    shapeFlag
  }
  if(children){
    let type = 0
    if(isArray(children)){
      type = ShapeFlags.ARRAY_CHILDREN
    }else{
      type = ShapeFlags.TEXT_CHILDREN
    }
    node.shapeFlag |= type
  }
  return node
}