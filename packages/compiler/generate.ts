
var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
function generate(el) {
  let children = getChildren(el)
  let code = `
    h('${el.tag}',${
      el.attrs.length > 0
      ?
      `${formatProps(el.attrs)}`
      :'undefined'
    }${
      children ?`${children}`:''
    })
  `
  return code
}

function formatProps(attrs) {
  let str = ''
  for(var i = 0; i < attrs.length; i++){
    let attr = attrs[i]
    if(attr.name === 'style'){
      let styleAttrs = {}
      attr.value.split(';').map((styleAttr)=>{
        let [key,value] = styleAttr.split(':')
        styleAttrs[key] = value
      })
      attr.value = styleAttrs
    }
    
    str += `${attr.name}:${JSON.stringify(attr.value)}`
  }
  return `{${str.slice(0,-1)}}`
}
function getChildren(el) {
  const children = el.children
  if(children){
    return children.map(c=>{
      return generateChildren(c).join(",")
    })
  }
}
function generateChildren(node) {
  if(node.type === 1){
    return generate(node)
  }else if(node.type == 3){
    let text = node.text
    if(!defaultTagRE.test(text)){
      return `h('Text',${JSON.stringify(text)})`
    }
    // 有双大括号的
    let match
    let index
    let lastIndex = defaultTagRE.lastIndex = 0
    let textArr = []
    while(match = defaultTagRE.exec(text)){
      index = match.index
      if(index > lastIndex){
        textArr.push(JSON.stringify(text.slice(lastIndex,index)))
      }
      textArr.push(`_s(${match[1].trim()})`)
      lastIndex = index + match[0].length
    }
    if(lastIndex <text.length){
      textArr.push(JSON.stringify(text.slice(lastIndex)))
    }
    return `h(${textArr.join('+')})`
  }
}
export {
  generate
}