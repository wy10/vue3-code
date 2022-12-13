import { ref } from '@vue/reactivity'
import { h } from './h'

export { createRenderer } from './renderer'
export { h } from './h'
export * from './vnode'

function useCounter() {
    const count = ref(0)
    function add() {
        return count.value++
    }
    return {
        count,
        add
    }
}
let app = {
    props:{
        title:{}
    },
    setup(props,ctx){
        let {count,add} = useCounter()
        return {
            count,
            add
        }
    },
    render(proxy) {
        return h('h1',{onclick:this.addd,title:proxy.titile},'hello'+this.count)
    },

}

export function createComponentInstance(vnode) {
    // 创造组件实例
    const type = vnode.type
    const instance = {
        vnode, //实例对应的虚拟节点
        type, //组件对象
        subTree:null, //组件渲染的内容
        ctx:{}, //组件上下文
        props:{}, //组件属性
        attrs:{}, //除了props中的属性
        slots:{}, //组件的插槽
        setupState:{}, //setup返回的状态
        propsOptions:type.props, //属性选项
        proxy:null, //实例的代理对象
        render:null, //组件的渲染函数
        emit:null, //事件触发
        exposed:{}, //暴露的方法
        isMounted:false //是否挂载完成
    }
    instance.ctx = {_:instance}
    return instance
}