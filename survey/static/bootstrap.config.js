// Refer node_moduels/bootstrap-webpack/bootstrap.config.js

module.exports = {
  styleLoader: require('extract-text-webpack-plugin').extract('style-loader', 'css-loader!less-loader'),
  scripts: {
    'transition': true
  },
  styles: {
    'mixins': true,
    'normalize': true,
    'print': true,
    'scaffolding': true,
    'type': true,
  }
};
