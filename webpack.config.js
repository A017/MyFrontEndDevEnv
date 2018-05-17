/**
 * Created by Songsong_yu on 2018/4/19.
 */
const webpack = require('webpack');
// var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");

module.exports = {
    entry: {
        index:'./src/js/index.js',
        main:'./src/js/main.js'
    },
    output: {
        path: __dirname+'/dist/js',
        filename: '[name].js'
    },
    devtool:'source-map',
    // mode:'development', //这个参数有两个值： 'development'或者 'production'，一个是开发环境，一个是生产环境。
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules)/,
            loader: 'babel-loader',
        },
        {
            test: require.resolve('zepto'),
            loader: 'exports-loader?window.Zepto!script-loader'
        },
        {
            test:/\.css$/,
            exclude: /(node_modules)/,
            loader:'style-loader!css-loader'
            /*use:[
                {
                    loader:'style-loader'
                },
                {
                    loader:'css-loader'
                }
            ]*/
        }]
    },
    resolve: {
        alias: {
            'vue': 'vue/dist/vue.js'
        }
    },
    plugins: [

       /* new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),//直接定义第三方库*/

      /*  new CommonsChunkPlugin({ // webpack4之前版本的写法(webpack1.xx)
            name: "commons",
            // (the commons chunk name)

            filename: "commons.js",
            // (the filename of the commons chunk)

            minChunks: 2,
            // (Modules must be shared between 3 entries)

            chunks: ["index", "main"]
            // (Only use these entries)
        })//定义公共chunk*/
    ],
};