# MyFrontEndDevEnv
my front-end development environment
#need npm install -g webpack-cli && npm install -D webpack-cli
#module: {loaders:} => module: {rules:} webpack4.xx
#add gulp-sequence 同步执行gulp.task, 防止异步执行task造成的文件混乱
#update gulp的webpack-stream插件 https://blog.csdn.net/maomaolaoshi/article/details/78741007
#npm install --save gulp-concat-css-import
#npm i -D script-loader exports-loader 用于导入没有模块化的第三方库
#增加css-loader style-loader的使用
#增加gulp-rev, gulp-rev-collector 添加版本号
#更改gulp-rev和gulp-rev-collector(重要)
#需要将默认的形式x-hashcode.css/x-hashcode.js形式改为x.css?v=hashcode/x.js?v=hashcode形式需要修改node_modules\gulp-rev\index.js 第42行return filename + extension;改为return filename + extension + '?v=' + file.revHash;
#node_modules\rev-path\index.js第10行return modifyFilename(pth, (filename, ext) => `${filename}-${hash}${ext}`);改为 return modifyFilename(pth, (filename, ext) => `${filename}${ext}`);


