import { createRenderer } from '@vue/runtime-core'
import { nodeOpts } from './nodeOps'
import { patchProp } from './patchProps'

const renderOptions = Object.assign(nodeOpts,{patchProp})
// 创建web端的渲染器
export function render(vnode,container) {
  createRenderer(renderOptions).render(vnode,container)
}