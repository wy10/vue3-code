function createInvoker(v) {
  const invoker = (e) => invoker.value(e)
  invoker.value = v
}
export function patchEvent(el,eventName,nextValue) {
  // 先移除事件 在重新绑定 性能低
  let invokers = el._vei|| (el._vei = {})
  let exits = invokers[eventName]
  if(exits && nextValue){
    exits.value = nextValue
  }else {
    let event = eventName.slice(2).toLowerCase()
    if(nextValue){
      const invoker = invokers[eventName] = createInvoker(nextValue)
      el.addEventListener(event,invoker)
    }else if(exits){
      el.removeEventListener(event,exits)
      invokers[eventName] = undefined
    }
  } 
}