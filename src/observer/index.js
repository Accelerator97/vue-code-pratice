import { isObject } from "../../utils";
import {arrayMethods} from './array'

class Observer{
    constructor(data){ 
        //这里的this是Observer类的实例
        //给data添加__ob__属性，这是为了如果data是数组的情况下，可以访问Observer类上的方法observeArray
        //所有被劫持的属性都有__ob__
        //写成这种形式是为了防止如果是对象走walk方法然后添加了__ob__,因为__ob__对应的this是一个实例对象，所以会不停地对__ob__进行观测，导致爆栈
        Object.defineProperty(data,'__ob__',{
            value:this,
            enumerable:false //不可枚举
        })
        data.__ob__ = this
        //对于数组，Vue没有监控索引的变化，但是如果索引对应的数据是对象需要被监控 
        if(Array.isArray(data)){
            //数组劫持的逻辑
            //对数组原来的方法进行改写，切片编程，高阶函数
            data.__proto__ = arrayMethods
            //如果数组里面的数据是对象类型，那么需要监控对象的变化
            this.observeArray(data)
        }else{
            this.walk(data)//对对象所有属性进行劫持
        }
     

    }
    observeArray(data){ //对于数组中的对象再次进行监控 递归
        data.forEach(item => {
            observe(item)
        })
    }
    walk(data){
        //Object.keys保证是对对象的私有属性进行遍历
        Object.keys(data).forEach(key=>{
            defineReactive(data,key,data[key])
        })
    }
}

//Vue2会对对象进行遍历一次，为每个属性添加set/get方法，所以性能会差一点
function defineReactive(data,key,value){
    //value有可能是对象，进行递归，为value下面的属性添加set/get方法（所以性能会比较差）
    observe(value)
    Object.defineProperty(data,key,{
        get(){
            return value
        },
        set(newValue){
            observe(newValue) //如果用户赋值一个新对象，需要对这个新对象进行劫持
            value = newValue
        }
    })

}

export function observe(data){
    //是对象才进行观测
    if(!isObject(data)){
         return 
    }
    if(data.__ob__){
        //如果data有__ob__属性，说明已经被观测过了
        return 
    }
    return new Observer(data)
}

/**
 * 小结：
 * 如果数据是对象，会不断递归进行劫持
 * 如果是数组，会劫持数组的方法，如果数组中的数据是对象，还会进行检测劫持
 */