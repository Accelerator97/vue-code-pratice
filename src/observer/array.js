let oldArrayPrototype = Array.prototype
export let arrayMethods = Object.create(oldArrayPrototype)
//以Array的原型作为当前对象的原型 arrayMehthods.__proto__ = Array.prototype

let methods = [
    'push',
    'shift',
    'unshift',
    'pop',
    'reverse',
    'sort',
    'splice'
]

methods.forEach(method => {
    //用户如果调用以上七个方法会用我自己重写的，否则用数组原来的方法
    arrayMethods[method] = function(...args){
        oldArrayPrototype[method].call(this,...args)
        //根据当前数组获取Observer类的实例
        //这里的this指向数组
        let ob = this.__ob__ 
        let inserted

        switch(method){
            case 'push':
                inserted = args //args就是新增的内容
            case 'unshift': 
                inserted = args//args就是新增的内容
            case 'splice':
                //xxx.splice(0,1,xxx) 在下标为0的地方插入一个数xxx 
                //此时args的第三个参数就是xxx 为新增的内容  
                inserted = args.slice(2)   
            default:
                break;    
        } 
        //如果有新增的内容要继续进行劫持，需要观察数组的每一项，而不是数组
        if(inserted){
              ob.obserArray(inserted)
        }
    }
})