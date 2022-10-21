import { parseHtmlToAst } from "./astParse"
import { generate } from "./generate"

function compileToRenderFunction(html) {
    const ast = parseHtmlToAst(html)
    // 通过generate 将ast转成render函数中需要的code 
   /* 
   render(h(
      'div',
      {id:'app',style:{color:red}},
      h('Text','你好' + _s(name))
    ),app)
    */
    const code = generate(ast)
    const render = new Function(`
      width(this){return ${code}}
    `)
}


export {
  compileToRenderFunction
}

// html = el.outerHTML