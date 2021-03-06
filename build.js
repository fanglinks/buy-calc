/**
 * Config
 */
const config = {
  outputRoot: './dist/',
  srcRoot: './src/',
  publicPath: 'dist/',
  // publicPath: 'http://7xin1x.com1.z0.glb.clouddn.com/works/', 自动上传七牛  待做  
};





/**
 * webpack build.js
 * created by xingo 2017/02/16
 */
var path = require('path')

var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var assetsPath = path.resolve(__dirname, config.outputRoot);
var srcPath = path.resolve(__dirname, config.srcRoot);
var processEnv = process.argv[2]; // 'build','dev'

var webpackConfig = {
  entry: {
    app: path.resolve(srcPath, './app.jsx'),
  },
  output: {
    filename: 'js/[name].[chunkhash:3].js',
    chunkFilename: 'js/[name].[chunkhash:3].js',
    publicPath: config.publicPath,
    path: assetsPath,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract(
          [{
            loader: 'css-loader',
            options: { sourceMap: (processEnv == 'dev'), minimize: true }
          }]
        ),
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract(
          [{
            loader: 'css-loader',
            options: { sourceMap: (processEnv == 'dev'), minimize: true }
          }, {
            loader: 'less-loader',
            options: { sourceMap: (processEnv == 'dev') }
          }]
        ),
      },
      {
        test: /\.(png|jpe?g|gif|svg|ico)(\?.*)?$/,
        loader: 'url-loader',
        query: {
          limit: 20000,
          name: 'assets/[name].[hash:3].[ext]',
        }
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          "presets": [
            ["es2015", {
              "modules": false
            }], 'react'
          ]
        }
      },
    ]
  },
  resolve: {
    alias: {
      'assets': path.resolve(srcPath, './assets/'),
    }
  },
  plugins: [
    new ExtractTextPlugin({
      filename: 'css/bundle.[contenthash:3].css',
      disable: false,
      allChunks: true
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(srcPath, './index.ejs'),
      inject: true,
      filename: '../index.html',
      minify: processEnv == 'dev' ? false : {
        removeComments: true,
        collapseWhitespace: true
      },
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      comments: false,
      sourceMap: (processEnv == 'dev')
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify((processEnv == 'dev') ? 'dev' : 'production' ),
      }
    }),
  ],
  devtool: (processEnv == 'dev') ? 'source-map' : false,
};

if (processEnv == 'dev') {
  var BrowserSyncPlugin = require('browser-sync-webpack-plugin');
  webpackConfig.plugins.push(new BrowserSyncPlugin({
    host: 'localhost',
    port: 3000,
    server: {
      baseDir: [path.resolve(assetsPath, '../')]
    }
  }));
  webpackConfig.watch = true;
  webpackConfig.watchOptions = {
    aggregateTimeout: 300,
    poll: 1000,
    ignored: /node_modules/
  }
  compile(webpackConfig);
} else {
  compile(webpackConfig);
}



function compile(webpackConfig) {
  var ora = require('ora');
  var spinner = ora('building for production...');
  spinner.start();

  require('shelljs/global');
  rm('-rf', assetsPath);
  return webpack(webpackConfig, function (err, stats) {
    spinner.stop()
    if (err) throw err
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n')
  });
}