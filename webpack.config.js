/**
 * Created by Songsong_yu on 2018/4/19.
 */
const webpack = require('webpack');

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

    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /(node_modules)/,
            loader: 'babel-loader',
        },
        /*{
            test:/\.css$/,
            loader:'style-loader!css-loader'
        }*/]
    },

    plugins: [
        //new webpack.optimize.UglifyJsPlugin({
        //  compress: {
        //    warnings: false,
        //  },
        //  output: {
        //    comments: false,
        //  },
        //}),//压缩和丑化

        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),//直接定义第三方库
    ],

    optimization: {
        runtimeChunk: {
            name: 'my-runtime',
        },
        splitChunks: {
            chunks:"all",
            cacheGroups: {
                commons: {
                    test: /common\/|components\//,
                    name: 'dist/js/commons',
                    priority: 10,
                    enforce: true
                },
                vendor: {
                    test: /node_modules/,
                    name: 'dist/vendor',
                    priority: 10,
                    enforce: true
                }
            }
        },
    },
};