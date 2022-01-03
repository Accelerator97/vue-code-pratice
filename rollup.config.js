import babel from 'rollup-plugin-babel'
export default {
    input:'./src/index.js', //入口文件
    output:{
        format:'umd', //支持amd和commonjs 并且暴露一个全局window.Vue
        name:'Vue',
        file:'dist/vue.js',
        sourcemap:true 
    },
    plugins:[
        babel({
            exclude:'node_modules/**'
        })

    ]
}