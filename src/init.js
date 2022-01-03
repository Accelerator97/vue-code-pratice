import { initState } from "./state"
import {compileToFunction} from './compiler/index'
export function initMixin(Vue){  //表示在Vue的基础上做一次混合操作

    Vue.prototype._init= function(options){ //Vue原型上添加_init方法
        const vm= this
        vm.$options = options //后续对options进行扩展操作

        //对数据进行初始化 watch computed props data ... initState专门对状态进行初始化
        initState(vm)


        if(vm.$options.el){
            //将数据挂载到模版上
            vm.$mount(vm.$options.el)
        }
    }
    Vue.prototype.$mount = function(el){
        const vm = this
        const options = vm.$options
        el = document.querySelector(el)
        //把模版转化成对应的渲染函数 => 虚拟dom概念 生成vnode => diff算法 更新虚拟dom =>产生真实节点，进行更新
        if(!options.render){//没有render用template
            let template = options.template
            if(!template && el ){ //如果没有template但是有el
                template = el.outerHTML
                let render = compileToFunction(template)
                options.render = render //生成渲染函数
            }
        }

    }
}