import { patchAttr } from "./modules/attr";
import { patchClass } from "./modules/class";
import { patchEvent } from "./modules/event";
import { patchStyle } from "./modules/style";
// 比对属性 id class style
// null -> 值 新增属性
// 值 -> 值 对比差异
// 值 —> null 删除属性
export function patchProp(el,key,prevValue,nextValue) {
  // 类名 el.className
  if(key === 'class') {
    patchClass(el,nextValue)
  }else if(key === 'style') {
    // 样式 el.style
    patchStyle(el,prevValue,nextValue)
  }else if(/^on[^A-Z]/.test(key)) {
    // 事件 addEventListener
    patchEvent(el,key,nextValue)
  }else{
    // setAttribute
    patchAttr(el,key,nextValue)
  }
}



