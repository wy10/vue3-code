import { isString, ShapeFlags } from "@vue/shared"
import { createVnode,isSameVnode,Text } from "./vnode"
// render('h1',{style:{color:'red'},onClick:()=>alert(1)},h('span','world'),'hello'),app)
//创建虚拟dom 
export function createRenderer(renderOptions) {
  let {
    insert:hostInsert,
    remove:hostRemove,
    setElementText:hostSetElementText,
    setText:hostSetText,
    parentNode:hostParentNode,
    nextSibling:hostNextSibling,
    createElement:hostCreateElement,
    createText:hostCreateText,
    patchProps:hostPatchProps
  } = renderOptions
  function normalize(child) {
    if(isString(child)){
      return createVnode(Text,null,child)
    }
    return child
  }
  function mountChildren(children,container){
    for(let i = 0; i < children.length; i++){
      let child = normalize(children[i])
      patch(null,child,container)
    }
  }
  function mountElement(vnode,container) {
    let {type, props,children,shapeFlag} = vnode
    let el = vnode.el = hostCreateElement(type)  //将真实元素挂载到这个虚拟节点上
    if(props){
      for(let key in props){
        hostPatchProps(el,key,null,props[key])
      }
    }
    if(shapeFlag && ShapeFlags.TEXT_CHILDREN){
      hostSetElementText(children)
    }else if(shapeFlag && ShapeFlags.ARRAY_CHILDREN){
      mountChildren(children,el)
    }
    hostInsert(el,container)
  }
  const processText = (n1,n2,container) => {
    if(n1 == null){
      hostInsert((n2.el = hostCreateText(n2.children)),container)
    }else {
      const el = n2.el = n1.el
      if(n1.children !== n2.children){
        hostSetText(el,n2.children)
      }
    }
  }
  const patchProps = (oldProps,newProps,el) =>{
    for(let key in newProps){
      hostPatchProps(el,key,oldProps[key],newProps[key])
    }
    for(let key in oldProps){
      if(newProps[key] === null){
        hostPatchProps(el,key,oldProps[key],null)
      }
    }
  }
  const patchChildren = (n1,n2,container) =>{
    // 比较两个虚拟节点的儿子的差异，el就是当前的父节点
    const c1 = n1.children
    const c2 = n2.children
    // 比较两个儿子列表的差异
  }
  const patchElement = (n1,n2) =>{  //先复用 在比较属性 在比较儿子
    let el = n2.el = n1.el
    let oldProps = n1.props || {}
    let newProps = n2.props || {}
    patchProps(oldProps,newProps,el)
    patchChildren(n1,n2,el)
  }
  const processElement = (n1, n2, container) =>{
    if(n1 === null) {
      mountElement(n2,container)
    }else {
      patchElement(n1,n2) 
    }
  }
  const patch = (n1,n2,container) => {
    if(n1 == n2) return
    if(n1 && !isSameVnode(n1,n2)){
      unmount(n1)
      n1 = null
    } 
    const { type, shapeFlag } = n2
    switch (type) {
      case Text:
        processText(n1,n2,container)
        break;
    
      default:
        if(shapeFlag & ShapeFlags.ELEMENT){
          processElement(n1,n2,container)
        }
        break;
    }
  }
  const unmount = (vnode) =>{
    hostRemove(vnode.el)
  }
  const render = (vnode,container) => {
    if(vnode === null){
      if(container._vnode){
        unmount(container._vnode)
      }
    }else{
      // 这里既有初始化的逻辑 又有更新的逻辑
      patch(container._vnode || null,vnode,container) 
    }
    container._vnode = vnode
  }
  return {
    render
  }
}

// 文本的处理，需要自己增加类型，因为不能通过document.createElement('文本')
// 我们如果传入null的时候在渲染，则是卸载逻辑，需要将dom节点删掉