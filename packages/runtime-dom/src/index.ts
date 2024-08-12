import { createRenderer } from '@vue/runtime-core'
import { nodeOpts } from './nodeOps'
import { patchProp } from './patchProps'

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
  }
  return {
    createApp: apiCreateApp(render)
  }
}

type RenderType = (x: any, y: any) => any

export function apiCreateApp(render: RenderType) {
  return function (rootComp, rootProp) {
    const mount = (container) => {
      let vnode = createVnode(rootComp, rootProp)
      render(vnode, container)
    }
    return {
      mount,
    }
  }
}

export function createVnode(rootComp,rootProp){

}