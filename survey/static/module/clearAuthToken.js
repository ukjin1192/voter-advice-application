'use strict';

// Load modules
var $ = require('jquery');

module.exports = function clearAuthToken() {
  $.ajaxSetup({
    headers: {
      'Authorization': null
    }
  });
  return;
}
