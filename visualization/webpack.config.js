/**
 * Webpack configuration file
 */
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

module.exports = {
  entry: {
    'main': './script/visualization.js'
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name]-[hash].js'
  },
  resolve: {
    alias: {
      'react': path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom')
    }
  },
  module: {
    loaders: [
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['react']
        }
      },
      {
        test: /\.svg$/,
        loaders: [
          'svg-sprite'
        ]
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        loaders: [
          'style-loader',
          'css-loader',
          'autoprefixer?{browsers:["last 2 version", "safari 5", "ie > 9", "iOS > 7", "Android > 4"]}',
          'sass-loader?outputStyle=expanded&includePaths[]=' + path.resolve('node_modules/ring-ui/components')
        ]
      }, {
        test: /\.css$/,
        exclude: /node_modules/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.html$/,
        exclude: /node_modules/,
        loaders: [
          'html?' + JSON.stringify({
            collapseBooleanAttributes: false,
            collapseWhitespace: false
          })
        ]
      },
      {
        test: /\.png$/,
        exclude: /node_modules/,
        loader: 'url-loader?limit=10000'
      }
    ]
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new HtmlWebpackPlugin({
      template: 'index.html',
      filename: 'index.html'
    }),
    // new webpack.optimize.UglifyJsPlugin({
    //   minimize: true,
    //   sourceMap: false,
    //   compress: {
    //     warnings: false
    //   }
    // }),
    new webpack.DefinePlugin({
      'process.env':{
        'NODE_ENV': JSON.stringify('development')
      }
    })
  ]
};

