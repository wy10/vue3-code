---
iife => global
var VueReactive = (function(){
return {
reactive,
computed,
watch
}
})()
---

cjs common.js
var reactive = function(){}
var computed = function(){}
var watch = funciton() {}
module.exports = {
reactive,
computed,
watch
}

---

esm
var reactive = function() {}
var computed = function() {}
var watch = function() {}
export {
reactive,
computed,
watch
}

---

响应式、运行组件（js 渲染，小程序渲染）vue 中为了解耦将逻辑分为两个模块

- 运行时 （不依赖平台，browser、test、小程序）靠的是虚拟 dom
- 针对不同平台的运行时，vue 针对浏览器平台
- 渲染器根据传入的不同功能来进行不同平台的渲染
  runtime-core 核心 runtime-dom 基于浏览器 runtime-test 基于测试 还可以自己扩展基于小程序...

runtime-dom 中提供 domAPI 然后把 domAPI 传入 runtime-core 中的 createRenderer 函数来创建基于浏览器的渲染器

```
html
<div id = "app"></div>

let { createRenderer,h } = VueRuntimeDOM
<!-- 渲染器渲染的是虚拟dom 这段代码是会报错的-->
let renderer = createRenderer()  //创建一个空渲染器
let vnode = h('div','hello')     //创建一个虚拟dom
renderer.render(vnode,app)       //将虚拟dom渲染到id=app的dom元素上面

<!-- ？？？空渲染器如何渲染呢 你需要告诉createRender使用浏览器的api来进行渲染 -->
let renderer = createRenderer({
  createElement(element){
    return document.createElement(element)
  },
  setElementText(el,text){
    el.innerHtml = text
  },
  insert(el,container){
    container.appendChild(el)
  },
  // h('div',{style:{color:"red"}},'hello'),处理属性
  patchProp(el,key,prevValue,newValue){

  }
})  //创建一个在浏览器端使用的渲染器

let vnode = h('div','hello')
/**
创建一个虚拟dom,{
  type,
  props,
  children,
  el:null, //虚拟节点对应的真是节点，后续diff算法比对完之后 更新el
  key:props?.['key'],
  __v_isVnode:true,
  shapeFlag
}
*/

renderer.render(vnode,app)
//然后在renderer.render函数中会把虚拟dom的type属性传递给createEelement(vnode.type)..完成<div>hello</div>
将<div>hello</div>塞到id=app的dom元素上面

总结：底层是虚拟dom，上一层只需要我们传入渲染APP,createRender.render就会按照用户的行为去创建
```
