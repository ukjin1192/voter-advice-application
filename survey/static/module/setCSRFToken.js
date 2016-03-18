'use strict';

// Load modules
var $ = require('jquery');
require('jquery.cookie');

module.exports = function setCSRFToken() {
  $.ajaxSetup({
    headers: {
      'X-CSRFToken': $.cookie('csrftoken')
    }
  });
  return;
}
