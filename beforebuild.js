const fs = require('fs')
const path = require('path')
const file = path.join(__dirname, './node_modules/gojs/release/go.js');
//注意该文件如果是模块化引入，文件路径应该是./node_modules/gojs/release/go-module.js 如果没有生效可以试试这个文件路径
//去除gojs水印
fs.readFile(file, 'utf8', function (err, data) {
    if (err) throw err;
    let hasMatch = false;
    let content = data.replace(/[\w\W]{8}7eba17a4ca3b1a8346[\w\W]{31}/gi, function (match) {
        if (match) hasMatch = true;
        return 'function(){return true;}'
    });//旧版去水印
    if (!hasMatch) {//新版去水印
        content = data.replace(/[^\)^\{}]*7ca11abfd7330390[^;]*/gi, function (match) {//查找绘制文本的语句
            let arr = /\]\(([^\,]+)/.exec(match);//查找语句中的获取水印文本函数
            //console.log(arr);
            return arr && arr.length >= 1 && arr[1];//用该函数整个替换绘制函数
        });
    }
    fs.writeFile(file, content, 'utf8', (err) => {
        if (err) throw err;
        // console.log('success done');
    });
});
