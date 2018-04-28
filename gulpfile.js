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
    // uglify = require('gulp-uglify'),
    // cssUglify = require('gulp-minify-css'),
    cssClean = require('gulp-clean-css'),

    webpack = require('webpack'),
    webpackConfig = require('./webpack.config.js'),
    gulpwebpack = require('gulp-webpack');

const webpackStream = require('webpack-stream');
const importcss = require('gulp-concat-css-import');

//开发环境的检测兼容 darwin(Mac)
const browser = os.platform() === 'linux' ? 'google-chrome' : (
                os.platform() === 'darwin' ? 'google chrome' : (
                    os.platform() === 'win32' ? 'chrome' : 'firefox'));
const host = {
    path: 'dist/', //dist部署的文件根路径
    port: 3090,
    html: 'index.html'
};

const incHtmlSrc = 'src/**/*.html', incHtmlDist = 'dist/';
const htmlSrc = 'src/views/**/*.html', htmlDist = 'dist/views/';
const imagesSrc = 'src/images/**/*.{png,jpg,gif,ico}', imagesDist = 'dist/images/';
const lessSrc = 'src/less/**/*.less';
const scssSrc = 'src/scss/**/*.scss';
const lessScssToCssSrc = 'src/css/';
const cssSrc = 'src/css/cssim/*.css', cssDist = 'dist/css/';


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
    gulp.src('src/images/*.{png,jpg,gif,ico}')
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
        .pipe(sourcemaps.init())
        .pipe(gulpless())
        .pipe(sourcemaps.write('../../../sourcemaps/lessmaps/'))
        .pipe(gulp.dest(lessScssToCssSrc))
        .pipe(connect.reload())
        // .on('end', done)
});

//编译scss
gulp.task('gulpsass', function (done) {
    return gulp.src(scssSrc)
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(sourcemaps.init())
        .pipe(gulpsass())
        .pipe(sourcemaps.write('../../../sourcemaps/scssmaps/'))
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
        // .pipe(concat('style.min.css')) //生成一个压缩的css
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

//压缩js
gulp.task('script', function() {
    // 1. 找到文件
    gulp.src('js/*.js')
    // 2. 压缩文件
        .pipe(uglify({ mangle: false }))
        // 3. 另存压缩后的文件
        .pipe(gulp.dest('dist/js'))
})

//编译@import css
gulp.task('gulpimportcss', function (done) {
    return gulp.src(['src/css/*.css'])
        .pipe(gulpimportcss())
        .pipe(gulp.dest('src/css/'))
        .pipe(connect.reload())
        // .on('end', done)
});
gulp.task('importcss', ['gulpless', 'gulpsass'], function () {
    return gulp.src(['src/css/*.css'])
        .pipe (importcss ({
            rootPath : 'src',
            isCompress : false
        }))
        .pipe(gulp.dest('src/css/cssim/'))
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
            uri: 'http://localhost:' + host.port+ '/' + host.html
        }))
        .on('end', done)
});

//清除
gulp.task('clean', function (done) {
    gulp.src(['dist', 'sourcemaps', 'src/sourcemaps', 'src/css/cssim/*.css'])
        .pipe(clean())
        .on('end', done)
});

//监控文件变化
gulp.task('watch', function (done) {
    //监听所有文件，变化之后运行数组中的任务
    // gulp.watch('src/**/*', ['fileinclude', 'copy:images', 'copy:fonts', 'testCssmin', 'build-js']);
    gulp.watch(incHtmlSrc, ['fileinclude']);
    gulp.watch(imagesSrc, ['copy:images']);
    gulp.watch('src/css/fonts/*', ['copy:fonts']);
    gulp.watch(lessSrc, ['testCssmin']);
    gulp.watch(scssSrc, ['testCssmin']);
    gulp.watch('src/css/*.css', ['testCssmin']);
    gulp.watch(cssSrc, ['testCssmin']);
    gulp.watch('src/js/**/*.js', ['build-js']);
});

//编排任务，避免每个任务需要单独运行
// gulp.task('build', ['fileinclude', 'copy:images', 'copy:fonts', 'cssmin', 'build-js']);
gulp.task('build', sequence('fileinclude', 'copy:images', 'copy:fonts', 'testCssmin', 'build-js'));
gulp.task('dev',['watch', 'connect', 'open']);

//同步执行task测试
gulp.task('sequence', sequence('gulpless', 'gulpsass', 'importcss', 'cssmin'));
