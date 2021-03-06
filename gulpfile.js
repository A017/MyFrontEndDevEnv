/**
 * Created by Songsong_yu on 2018/4/19.
 */
const gulp = require('gulp'),
    fileinclude = require('gulp-file-include'), //合并公共html代码（例如header和footer）
    clean = require('gulp-clean'), //清除
    concat = require('gulp-concat'), //合并压缩css，js所需插件
    cssmin = require('gulp-cssmin'), //或者使用cssmin = require('gulp-minify-css');
    connect = require('gulp-connect'),
    os = require('os'),
    gulpopen = require('gulp-open'),
    gulpsass = require('gulp-sass'),
    gulpless = require('gulp-less'),
    sourcemaps = require('gulp-sourcemaps'),
    notify = require('gulp-notify'),  //当发生异常时提示错误
    plumber = require('gulp-plumber'), //处理出现异常并不终止watch事件
    gulpimportcss = require('gulp-import-css'),
    gulpimportjs = require('gulp-js-import'),
    rename = require('gulp-rename'),
    imagemin = require('gulp-imagemin'),
    autoprefixer = require('gulp-autoprefixer'), //根据设置浏览器版本自动处理浏览器前缀
    sequence = require('gulp-sequence'), //用于同步执行task
    // 获取 uglify 模块（用于压缩 JS）
    uglify = require('gulp-uglify'),
    // cssUglify = require('gulp-minify-css'),
    cssClean = require('gulp-clean-css'),
    // runSequence = require('run-sequence'),
    rev = require('gulp-rev'),
    revCollector = require('gulp-rev-collector'),

    webpack = require('webpack'),
    webpackConfig = require('./webpack.config.js'),
    gulpwebpack = require('gulp-webpack');

const webpackStream = require('webpack-stream');
const importcss = require('gulp-concat-css-import');

require('gulp-awaitable-tasks')(gulp);

//开发环境的检测兼容 darwin(Mac)
const browser = os.platform() === 'linux' ? 'google-chrome' : (
                os.platform() === 'darwin' ? 'google chrome' : (
                    os.platform() === 'win32' ? 'chrome' : 'firefox'));
const host = {
    path: __dirname + '/dist/', //dist部署的文件根路径
    port: 3090,
    html: 'index.html'
};
const host2 = {
    path: __dirname + '/dist/',
    port: 3000,
    html: 'SDCardIndex.html'
};

const incHtmlSrc = 'src/**/*.html', incHtmlDist = 'dist/';
const htmlSrc = 'src/views/**/*.html', htmlDist = 'dist/views/';
const imagesSrc = 'src/images/**/*.{png,jpg,gif,ico}', imagesDist = 'dist/images/';
const lessSrc = 'src/less/**/*.less';
const scssSrc = 'src/scss/**/*.scss';
const lessScssToCssSrc = 'src/css/';
const cssSrc = 'src/css/cssim/*.css', cssDist = 'dist/css/';

//定义需要添加版本号的css、js文件路径
const cssRevSrc = 'dist/css/**/*.css';
const jsRevSrc = 'dist/js/**/*.js';


//合并HTML
gulp.task('fileinclude', function(done) {
    return gulp.src([incHtmlSrc])
        .pipe(fileinclude({
            prefix: '@@', //识别一些特殊的点，符号
            basepath: '@file' //文件所在地额地方
        }))
        .pipe(gulp.dest(incHtmlDist))
        // .pipe(notify({ message: 'html task complete' }))
        .pipe(connect.reload());
        // .on('end', done);
});

//拷贝index.html
gulp.task('copy:indexHtml', function (done) {
    return gulp.src(['src/index.html'])
        .pipe(gulp.dest('dist/'))
        .pipe(connect.reload())
        // .on('end', done);
});
//拷贝views-html
gulp.task('copy:viewsHtml', function (done) {
    return gulp.src(['src/views/*.html'])
        .pipe(gulp.dest('dist/views/'))
        .pipe(connect.reload())
    // .on('end', done);
});

//拷贝fonts
gulp.task('copy:fonts', function (done) {
    return gulp.src(['src/css/fonts/*'])
        .pipe(gulp.dest('dist/css/fonts/'))
        .pipe(connect.reload())
    // .on('end', done);
});

//拷贝图片
gulp.task('copy:images', function (done) {
    return gulp.src([imagesSrc])
        .pipe(gulp.dest(imagesDist))
        .pipe(connect.reload())
        // .on('end', done)
});

//压缩图片--(先压缩后复制)
gulp.task('imagemin', function (done) {
    gulp.src('src/images/**/*.{png,jpg,gif,ico}')
        .pipe(imagemin())
        .pipe(gulp.dest(imagesDist))
        .pipe(connect.reload())
        .on('end', done)
});

//编译less(匹配符“!除了..”，“*”，“**匹配路径下的0个或多个子文件夹”，“{}”)
gulp.task('gulpless', function (done) {
    return gulp.src(lessSrc)
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        // .pipe(sourcemaps.init())
        .pipe(gulpless())
        // .pipe(sourcemaps.write('../../../sourcemaps/lessmaps/'))
        .pipe(gulp.dest(lessScssToCssSrc))
        .pipe(connect.reload())
        // .on('end', done)
});

//编译scss
gulp.task('gulpsass', function (done) {
    return gulp.src(scssSrc)
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        // .pipe(sourcemaps.init())
        .pipe(gulpsass())
        // .pipe(sourcemaps.write('../../../sourcemaps/scssmaps/'))
        .pipe(gulp.dest(lessScssToCssSrc))
        .pipe(connect.reload())
        // .on('end', done)
});

//合并、压缩css代码
gulp.task('cssmin', ['importcss'], function (done) {
    return gulp.src([cssSrc])
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        // .pipe(sourcemaps.init())
        .pipe(rename({ suffix: '.min' }))
        // .pipe(concat('style.min.css')) //所有css合并生成一个压缩的css
        .pipe(cssmin())  //兼容IE7及以下需设置compatibility属性 .pipe(cssmin({compatibility: 'ie7'}))
        // .pipe(sourcemaps.write('../../../sourcemaps/cssminmaps/'))
        .pipe(gulp.dest(cssDist))
        .pipe(connect.reload())
        // .on('end', done)
});
gulp.task('cssuglify', ['importcss'], function(){
    return gulp.src(cssSrc)
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(cssUglify())
        .pipe(gulp.dest(cssDist))
        .pipe(connect.reload())
});
gulp.task('testCssmin', ['importcss'], function () {
    return gulp.src(cssSrc)
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(cssClean())
        .pipe(gulp.dest(cssDist))
        .pipe(connect.reload())
});
gulp.task('min-css', function () {
    return gulp.src('dist/css/**/*.css')
        .pipe(cssClean())
        .pipe(gulp.dest(cssDist))
});

//编译@import css-- @import url('');
/*gulp.task('gulpimportcss', function (done) {
    return gulp.src(['src/css/!*.css'])
        .pipe(gulpimportcss())
        .pipe(gulp.dest('src/css/'))
        .pipe(connect.reload())
        // .on('end', done)
});*/
gulp.task('importcss', ['gulpless'], function () {
    return gulp.src(['src/css/*.css'])
        .pipe (importcss ({
            rootPath : 'src',
            isCompress : false
        }))
        .pipe(gulp.dest('src/css/cssim/'))
        .pipe(connect.reload());
});

//compile-css
gulp.task('compile-css', function*() {
    /*编译sass/scss*/
    /*yield gulp.src(scssSrc,  { base: "./" })
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(gulpsass())
        .pipe(gulp.dest(lessScssToCssSrc));*/

    /*编译less*/
    /*yield gulp.src(lessSrc,  { base: "" })
        .pipe(sourcemaps.init())
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(gulpless())
        .pipe(sourcemaps.write('', {addComment: true}))
        .pipe(gulp.dest(lessScssToCssSrc));*/

    /*加载额外css@import url("css")*/
   /* yield gulp.src(['src/css/!*.css'],  { base: "" })
        .pipe(sourcemaps.init())
        .pipe (importcss ({
            rootPath : 'src',
            isCompress : false
        }))
        .pipe(sourcemaps.write('', {addComment: true}))
        .pipe(gulp.dest('src/css/cssim/'));*/

    /*压缩或者合并最后的css*/
   /* yield gulp.src(cssSrc,  { base: "" })
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(sourcemaps.init())
        .pipe(cssClean())
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('', {addComment: true}))
        .pipe(gulp.dest(cssDist))
        .pipe(connect.reload())*/
    yield gulp.src(lessSrc,  { base: "" })
        .pipe(sourcemaps.init())
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(gulpless())
        /*.pipe (importcss ({
            rootPath : 'dist',
            isCompress : false
        }))*/
        // .pipe(cssClean())
        .pipe(rename({ suffix: '.min' }))
       /* .pipe(rev()) //输出后的文件就会生成hash码*/
        .pipe(sourcemaps.write('', {addComment: true}))
        .pipe(gulp.dest(cssDist))
        /*.pipe(rev.manifest()) //set hash key json
        .pipe(gulp.dest('rev/css/'))  //dest hash key json*/
        .pipe(connect.reload());
});

//编译@import js
/*
gulp.task('gulpimportjs', function() {
    return gulp.src(imporJsSrc)
        .pipe(gulpimportjs({hideConsole: true}))
        .pipe(gulp.dest(imporJsDest))
        .pipe(connect.reload())
        // .on('end', done)
});
*/

//调用webpack编译js
gulp.task('build-js', function (done) {
    return gulp.src('src/entry.js')
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(webpackStream(webpackConfig))
        .pipe(gulp.dest('dist/js'))
        .pipe(connect.reload())
        // .on('end', done)
 });
/*gulp.task('build-js', function(callback) {
    return gulp.src('src/entry.js')
        .pipe(gulpwebpack(require('./webpack.config.js')))
        .pipe(gulp.dest('dist/js'));
});*/

//压缩js
gulp.task('min-script', function() {
    gulp.src('dist/js/**/*.js')
        .pipe(uglify({ mangle: false })) //mangle 是否修改变量名
        // .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('dist/js'))
});

//compile-js { base: "./" }(根目录)
gulp.task('compile-js', function*() {
    /*编译js*/
   /* yield gulp.src('src/entry.js',  { base: "" })
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(webpackStream(webpackConfig))
        .pipe(gulp.dest('dist/js'));*/

    /*压缩js*/
   /* yield gulp.src(['dist/js/app.js'],  { base: "" })
        .pipe(sourcemaps.init())
        .pipe(uglify({ mangle: false })) //mangle 是否修改变量名
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('', {addComment: true}))
        .pipe(gulp.dest('dist/js'))
        .pipe(connect.reload())*/

    yield gulp.src('src/entry.js',  { base: "" })
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(webpackStream(webpackConfig))
        .pipe(gulp.dest('dist/js'))
        .pipe(connect.reload());
});

//CSS生成文件hash编码并生成 rev-manifest.json文件名对照映射
gulp.task('revCss', function(){
    gulp.src(cssRevSrc)
        .pipe(rev())
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/css/'));
});


//js生成文件hash编码并生成 rev-manifest.json文件名对照映射
gulp.task('revJs', function(){
    gulp.src(jsRevSrc)
        .pipe(rev())
        .pipe(rev.manifest())
        .pipe(gulp.dest('rev/js/'));
});

//Html替换css、js文件版本
gulp.task('revHtml', function () {
    gulp.src(['rev/**/*.json', 'dist/**/*.html'])
        .pipe(revCollector())
        .pipe(gulp.dest('dist/'));
});

//运行web服务器
gulp.task('connect', function (done) {
    console.log("web服务器正在连接中.........");
    connect.server({
        root: host.path,
        port: host.port,
        livereload: true //热更新属性
    })
});
//运行web服务器2
gulp.task('connect2', function (done) {
    console.log("web服务器2正在连接中.........");
    connect.server({
        root: host2.path,
        port: host2.port,
        livereload: true
    })
});

//自动打开浏览器
gulp.task('open', function (done) {
    gulp.src('')
        .pipe(gulpopen({
            app: browser,
            uri: 'http://localhost:' + host.port+ '/' + host.html
        }))
        .on('end', done)
});
//自动打开浏览器2
gulp.task('open2', function (done) {
    gulp.src('')
        .pipe(gulpopen({
            app: browser,
            uri: 'http://localhost:' + host2.port+ '/' + host2.html
        }))
        .on('end', done)
});

//清除
gulp.task('clean', function (done) {
    gulp.src(['dist', 'sourcemaps', 'src/sourcemaps', 'src/css/*.css', 'src/css/*.map', 'src/css/cssim/*.css', 'src/css/cssim/*.map'])
        .pipe(clean())
        .on('end', done)
});

//监控文件变化
gulp.task('watch', function (done) {
    //监听所有文件，变化之后运行数组中的任务
    // gulp.watch('src/**/*', ['fileinclude', 'copy:images', 'copy:fonts', 'testCssmin', 'build-js']);
    gulp.watch(incHtmlSrc, ['fileinclude']);
    gulp.watch('src/views/*.inc', ['fileinclude']);
    gulp.watch('src/views/*.html', ['fileinclude']);
    gulp.watch(imagesSrc, ['copy:images']);
    gulp.watch('src/css/fonts/*', ['copy:fonts']);
    gulp.watch(lessSrc, ['compile-css']);
    // gulp.watch(scssSrc, ['compile-css']);
    // gulp.watch('src/css/*.css', ['compile-css']);
    // gulp.watch(cssSrc, ['compile-css']);
    gulp.watch('src/js/**/*.js', ['compile-js']);
});

//编排任务，避免每个任务需要单独运行
gulp.task('dev', ['fileinclude', 'copy:images', 'copy:fonts', 'compile-css', 'compile-js']);
// gulp.task('build', sequence('fileinclude', 'copy:images', 'copy:fonts', 'testCssmin', 'build-js'));
gulp.task('test',['watch', 'connect', 'open']);
gulp.task('build',['min-css', 'min-script']); //发布前压缩相关js/css

//同步执行task测试
gulp.task('sequence', sequence('gulpless', 'gulpsass', 'importcss', 'cssmin'));
