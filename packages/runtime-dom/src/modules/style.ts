export function patchStyle(el,prevValue,nextValue) {
  // 样式需要比对差异 style = {font-size:18,color:red} -> style = {color:blue,background:red}
  for(let key in nextValue){
    el.style[key] = nextValue[key]
  }
  if(prevValue){
    for(let key in prevValue){
      if(!nextValue[key]){
        el.style[key] = null
      }
    }
  }
}