'use strict';

var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
require('es6-promise').polyfill();

var productionMode = JSON.parse(process.env.production_mode || '0');

module.exports = {
  entry: {
    bundle: './index.js',
    vendor: [
      'jquery', 
      'jquery.cookie', 
      'bootstrap-webpack',
      'fullpage.js'
    ]
  },
  output: {
    path: './dist/',
    filename: '[name].js',
    publicPath: '/static/dist/'
  },
  plugins: productionMode ? [
    // Use jquery variable globally
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery'
    }),
    // Separate main file with vendors
    new webpack.optimize.CommonsChunkPlugin(
      'vendor',
      'vendor.bundle.js'
    ),
		// Extract CSS text from bundle into a file
    new ExtractTextPlugin('[name].css', {
			allChunks: true
		}),
    // Minify JS files
    new webpack.optimize.UglifyJsPlugin({
      minimize: true
    })
  ] : [
    // Use jquery variable globally
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'gindow.jQuery': 'jquery'
    }),
    // Separate main file with vendors
    new webpack.optimize.CommonsChunkPlugin(
      'vendor',
      'vendor.bundle.js'
    ),
		// Extract CSS text from bundle into a file
    new ExtractTextPlugin('[name].css', {
			allChunks: true
		})
  ],
  resolve: {
    extensions: ['', '.js', '.es6']
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader!sass-loader')
      },
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, 
        loader: 'url?limit=10000&mimetype=application/font-woff'
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, 
        loader: 'url?limit=10000&mimetype=application/octet-stream'
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, 
        loader: 'file'
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url?limit=10000&mimetype=image/svg+xml'
      }
    ]
  }
};
