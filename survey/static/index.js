'use strict';

// Load bootstrap with custom configuration
require('bootstrap-webpack!./bootstrap.config.js');
require('./styles.scss');

var setAuthToken = require('./module/setAuthToken');
var clearAuthToken = require('./module/clearAuthToken');

$(document).ready(function() {
  $('#loading-icon').hide();
});
