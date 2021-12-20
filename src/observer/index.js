import { isObject } from "../../utils";

class Observer{
    constructor(data){ //对对象所有属性进行劫持
        this.walk(data)

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
    return new Observer(data)
}