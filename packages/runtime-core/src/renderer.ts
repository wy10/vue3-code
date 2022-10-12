import { isString, ShapeFlags } from "@vue/shared"
import { createVnode,Text } from "./vnode"
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
    }
  }
  const patch = (n1,n2,container) => {
    if(n1 == n2) return
    const { type, shapeFlag } = n2
    if(n1 == null) {
      switch (type) {
        case Text:
          processText(n1,n2,container)
          break;
      
        default:
          if(shapeFlag & ShapeFlags.ELEMENT){
            mountElement(n2,container)
          }
          break;
      }
    }else {

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