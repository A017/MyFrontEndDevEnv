/**
 * Created by Songsong_yu on 2018/4/19.
 */
const webpack = require('webpack');
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");

module.exports = {
    entry: {
        index:'./src/js/index.js',
        main:'./src/js/main.js'
    },
    output: {
        filename: '[name].js'
    },
    devtool:'source-map',

    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
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
            $: 'jquery'
        }),//直接定义第三方库

        new CommonsChunkPlugin({
            name: "commons",
            // (the commons chunk name)

            filename: "commons.js",
            // (the filename of the commons chunk)

            minChunks: 2,
            // (Modules must be shared between 3 entries)

            chunks: ["index", "main"]
            // (Only use these entries)
        })//定义公共chunk

    ]
};