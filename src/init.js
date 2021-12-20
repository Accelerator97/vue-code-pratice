import { initState } from "./state"
export function initMixin(Vue){  //表示在Vue的基础上做一次混合操作

    Vue.prototype._init= function(options){ //Vue原型上添加_init方法
        const vm= this
        vm.$options = options //后续对options进行扩展操作

        //对数据进行初始化 watch computed props data ... initState专门对状态进行初始化
        initState(vm)
    }
}