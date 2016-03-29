'use strict';

var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
require('es6-promise').polyfill();

module.exports = {
  entry: {
    base: './entry/base',
    assembly_index: './entry/assembly/index',
    assembly_survey: './entry/assembly/survey',
    assembly_result: './entry/assembly/result',
    party_index: './entry/party/index',
    vendor: [
      'jquery', 
      'jquery.cookie', 
      'jquery-slimscroll',
      'bootstrap-webpack',
      'lodash',
      'fullpage.js',
      'fastclick',
      'rangeslider.js'
    ]
  },
  output: {
    path: './dist/',
    filename: '[name].js',
    publicPath: '/static/dist/'
  },
  plugins: [
    // Use jquery variable globally
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery'
    }),
    // Separate main file with vendors
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      chunks: ['base, assembly_index, assembly_survey, assembly_result, party_index'],
      filename: 'vendor.js',
      minChunks: Infinity
    }),
		// Extract CSS text from bundle into a file
    new ExtractTextPlugin('[name].css', {
			allChunks: true
		})
  ],
  resolve: {
    root: path.resolve('../../node_modules'),
    extensions: ['', '.js', '.es6']
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
      },
      {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract('style-loader', 'css-loader!less-loader')
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
