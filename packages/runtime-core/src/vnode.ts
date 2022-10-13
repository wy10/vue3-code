import { isArray, isString, ShapeFlags } from "@vue/shared";
export const Text = Symbol('Text')

export function isVnode(value) {
  return !!(value && value.__v_isVnode)
}
export function isSameVnode(n1,n2) {  //判断两个虚拟节点是否是相同节点
  return n1.type === n2.type && n1.key === n2.key
}
export function createVnode(type,props,children = null){
   let shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0
   // 虚拟dom diff算法
   const vnode = {
    type,
    props,
    children,
    el:null, //虚拟节点对应的真是节点，后续diff算法比对完之后 更新el
    key:props?.['key'],
    __v_isVnode:true,
    shapeFlag
   }
   if(children){
    let type = 0
    if(isArray(children)){
      type = ShapeFlags.ARRAY_CHILDREN
    }else {
      children = String(children)
      type = ShapeFlags.TEXT_CHILDREN
    }
    vnode.shapeFlag |= type
   }
   return vnode
}