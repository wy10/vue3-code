## template -> 编译... -> 形成真实的 dom

- 1.获取 template
- 2.template -> ast 树（源代码的抽象语法结构的树状描述）
- 3.Ast -> render 函数 -> \_c \_v \_s
- 4.通过 render 函数转换虚拟节点
- 5.通过 patch 到真实 dom

render > template > html 式模板
