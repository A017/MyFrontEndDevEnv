/**
 * Created by Songsong_yu on 2018/4/19.
 */
var gulp = require('gulp'),
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

    webpack = require('webpack'),
    webpackConfig = require('./webpack.config.js'),
    gulpwebpack = require('gulp-webpack');

//开发环境的检测兼容 darwin(Mac)
var browser = os.platform() === 'linux' ? 'google-chrome' : (
                os.platform() === 'darwin' ? 'google chrome' : (
                    os.platform() === 'win32' ? 'chrome' : 'firefox'));
var host = {
    path: 'dist/', //dist部署的文件根路径
    port: 3090,
    html: 'index.html'
};

var incHtmlSrc = 'src/**/*.html', incHtmlDist = 'dist/';
var htmlSrc = 'src/views/**/*.html', htmlDist = 'dist/views/';
var imagesSrc = 'src/images/*', imagesDist = 'dist/images/';
var lessSrc = 'src/less/**/*.less';
var scssSrc = 'src/scss/**/*.scss';
var lessScssToCssSrc = 'src/css/';
var cssSrc = 'src/css/**/*.css', cssDist = 'dist/css/';


//合并HTML
gulp.task('fileinclude', function(done) {
    return gulp.src([incHtmlSrc])
        .pipe(fileinclude({
            prefix: '@@', //识别一些特殊的点，符号
            basepath: '@file' //文件所在地额地方
        }))
        .pipe(gulp.dest(incHtmlDist))
        .pipe(notify({ message: 'html task complete' }))
        .pipe(connect.reload())
        .on('end', done);
});

//拷贝html
gulp.task('copy:html', function (done) {
    return gulp.src([htmlSrc])
        .pipe(gulp.dest(htmlDist))
        .pipe(connect.reload())
        .on('end', done);
});

//拷贝图片
gulp.task('copy:images', function (done) {
    return gulp.src([imagesSrc])
        .pipe(gulp.dest(imagesDist))
        .pipe(connect.reload())
        .on('end', done)
});

//压缩图片--(先压缩后复制)
gulp.task('imagemin', function (done) {
    return gulp.src([imagesSrc])
        .pipe(imagemin())
        .pipe(gulp.dest(imagesDist))
        .pipe(connect.reload())
        .on('end', done)
});

//编译less(匹配符“!除了..”，“*”，“**匹配路径下的0个或多个子文件夹”，“{}”)
gulp.task('gulpless', function (done) {
    return gulp.src(lessSrc)
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(sourcemaps.init())
        .pipe(gulpless())
        .pipe(sourcemaps.write('../../../sourcemaps/lessmaps/'))
        .pipe(gulp.dest(lessScssToCssSrc))
        .pipe(connect.reload())
        .on('end', done)
});

//编译scss
gulp.task('gulpsass', function (done) {
    return gulp.src(scssSrc)
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(sourcemaps.init())
        .pipe(gulpsass())
        .pipe(sourcemaps.write('../../../sourcemaps/scssmaps/'))
        .pipe(gulp.dest(lessScssToCssSrc))
        .pipe(connect.reload())
        .on('end', done)
});

//合并、压缩css代码
gulp.task('cssmin', function (done) {
    return gulp.src([cssSrc])
        .pipe(sourcemaps.init())
        .pipe(concat('style.min.css'))
        .pipe(cssmin())  //兼容IE7及以下需设置compatibility属性 .pipe(cssmin({compatibility: 'ie7'}))
        .pipe(sourcemaps.write('../../../sourcemaps/cssminmaps/'))
        .pipe(gulp.dest(cssDist))
        .pipe(connect.reload())
        .on('end', done)
});

//编译@import css
gulp.task('gulpimportcss', function (done) {
    return gulp.src(['src/css/importCss.css'])
        .pipe(gulpimportcss())
        .pipe(gulp.dest('src/css/'))
        .pipe(connect.reload())
        .on('end', done)
});

//编译@import js
/*
gulp.task('gulpimportjs', function() {
    return gulp.src(imporJsSrc)
        .pipe(gulpimportjs({hideConsole: true}))
        .pipe(gulp.dest(imporJsDest))
        .pipe(connect.reload())
        .on('end', done)
});
*/

//调用webpack编译js
/*gulp.task('build-js', function (done) {
 gulp.src(jsSrc) //输入主js文件
 .pipe(gulpwebpack(webpackConfig, webpack))
 .pipe(gulp.dest(jsDist))
 .pipe(connect.reload())
 .on('end', done)
 });*/
gulp.task('build-js', function(callback) {
    return gulp.src('AppSrc/entry.js')
        .pipe(gulpwebpack( require('./webpack.config.js')))
        .pipe(gulp.dest(jsDist));
});

//运行web服务器
gulp.task('connect', function (done) {
    console.log("正在连接中.........");
    connect.server({
        root: host.path,
        port: host.port,
        livereload: true //热更新属性
    })
});

//自动打开浏览器
gulp.task('open', function (done) {
    gulp.src('')
        .pipe(gulpopen({
            app: browser,
            uri: 'http://localhost:' + host.port + host.html
        }))
        .on('end', done)
});

//清除
gulp.task('clean', function (done) {
    gulp.src(['dist', 'sourcemaps', sourceFileName+'/sourcemaps'])
        .pipe(clean())
        .on('end', done)
});

//监控文件变化
gulp.task('watch', function (done) {
    //监听所有文件，变化之后运行数组中的任务
    gulp.watch('src/**/*', ['gulpimportcss', 'gulpless','gulpsass', 'cssmin', 'fileinclude', 'html', 'imagemin', 'build-js'])
        .on('end', done)
});

//编排任务，避免每个任务需要单独运行
gulp.task('dev', ['connect', 'fileinclude', 'html', 'gulpimportcss', 'gulpless', 'gulpsass', 'cssmin', 'imagemin', 'watch', 'open', 'build-js']);