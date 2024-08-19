// 提高一下情况的性能
/**
 * 第一次绑定click事件 'a'
 * 第二次绑定click事件 'b'
 * 使用createInvoker的话不需要进行el.removeEventListener el.addEventListener
 * 同样都是绑定click 只需要把绑定的event换一下好了
 * {
 *  click:funciton(v){
 *    const invoker = (e)=>invoker.value(e)
 *    invoker.value = () => alert("123")
 *    return invoker
 *  } 
 * }
 * 
 */
function createInvoker(v) {
  const invoker = (e) => invoker.value(e)
  invoker.value = v
  return invoker
}
export function patchEvent(el, eventName, nextValue) {
  // 先移除事件 在重新绑定 性能低 
  let invokers = el._vei || (el._vei = {})
  let exits = invokers[eventName]
  if (exits && nextValue) {
    exits.value = nextValue
  } else {
    let event = eventName.slice(2).toLowerCase()   //onClick => click
    if (nextValue) {
      const invoker = invokers[eventName] = createInvoker(nextValue)
      el.addEventListener(event, invoker)
    } else if (exits) {
      el.removeEventListener(event, exits)
      invokers[eventName] = undefined
    }
  }
}