import {initMixin} from './init.js'

function Vue(options){

    //options是用户传入的配置项,_表示的是Vue内部调用，希望用户不要调用
    this._init(options)
}

initMixin(Vue)



export default Vue