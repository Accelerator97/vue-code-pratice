import { isFunction } from "../utils"
import { observe } from "./observer/index.js"
export function initState(vm){
    const opts = vm.$options
    if(opts.data){
        initData(vm)
    }
    // if(opts.computed){
    //     initComputed()
    // }
    // if(opts.watch){
    //     initWatch()
    // }
    // if(opts.props){
    //     initProps()
    // }
}

function proxy(vm,source,key){
    Object.defineProperty(vm,key,{
        get(){
            return vm[source][key]
        },
        set(newValue){
            vm[source][key] = newValue
        }
    })
}

function initData(vm){
    let data = vm.$options.data
    //判断data是否是函数，如果是函数就通过call调用 this指向vm
    //这时候data与vm没有关系，所以添加vm._data，通过_data进行关联
    data = vm._data = isFunction(data)?data.call(vm):data

    for(let key in data){ //设置代理，直接通过vm.xxx访问而不是通过vm._data.xxx访问
        proxy(vm,'_data',key)
    }
   //通过Object.defineProperty进行数据劫持
    observe(data)
}