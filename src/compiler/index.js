//这些正则对应源码compiler/parser/html-parser.js、compiler/parser/text-parser.js

//属性 id="app" id='app' id=app
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/

//标签名
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`

//获取标签名match后索引为1的项<my:header></my:header>
const qnameCapture = `((?:${ncname}\\:)?${ncname})`

//匹配开始标签<div
const startTagOpen = new RegExp(`^<${qnameCapture}`)

//匹配开始标签的关闭 > />
const startTagClose = /^\s*(\/?)>/

//匹配闭合标签</div>
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)

//匹配双大括号{{aaa}} 
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g


//现在是把html进行解析 
function start(tagName,attrs){ //<div a=1>
    console.log('start',tagName,attrs)

}
function end(tagName){  //</div>
    console.log('end',tagName)

}
function chars(text){
    console.log('text',text)

}
function parserHTML(html){ // <div id="app">123</div>

    function advance(len){  //截取标签
        html = html.substring(len)
    }
    function parseStartTag(){ //解析开始标签
       const start = html.match(startTagOpen)
       if(start){
           const match = {
               tagName:start[1],
               attrs:[]
           }
           advance(start[0].length)  //此时打印为 id="app">123</div>
           let end 
           let attr
           //如果没有遇到结尾标签 > 就不停解析，下面是获取开始标签上的属性
           while(!(end = html.match(startTagClose)) && (attr = html.match(attribute))){
               match.attrs.push({name:attr[1],value:attr[3] || attr[4] ||attr[5]})
               advance(attr[0].length)
           }
           if(end){
               advance(end[0].length)
           }
           return match

       }
       return false //不是开始标签

    }

    while(html){  //看要解析的内容是否存在，如果存在就不停的解析
        let textEnd = html.indexOf('<') //判断是否以<开头
        if(textEnd === 0){
            const startTagMatch = parseStartTag(html) //解析开始标签
            if(startTagMatch){
               start(startTagMatch.tagName,startTagMatch.attrs)
               continue
            }
        
            const endTagMatch = html.match(endTag) //解析结束标签
            if(endTagMatch){
                end(endTagMatch[1])
                advance(endTagMatch[0].length)
                continue
            }
        }
        let text //此时模版为 xxx</div>  获取标签内的文本
        if(textEnd > 0){
            text= html.substring(0,textEnd)
        }
        if(text){
            chars(text)
            advance(text.length)
        } 
    }
}

export function compileToFunction(template){
    parserHTML(template)
}