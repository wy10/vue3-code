import { createRenderer } from '@vue/runtime-core'
import { nodeOpts } from './nodeOps'
import { patchProp } from './patchProps'

const renderOptions = Object.assign(nodeOpts,{patchProp})

export function render(vnode,container) {
  createRenderer(renderOptions).render(vnode,container)
}