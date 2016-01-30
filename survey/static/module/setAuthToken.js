'use strict';

var $ = require('jquery');

module.exports = function setAuthToken() {
  if (localStorage.getItem('token') != null) {
    $.ajaxSetup({
      headers: {
        'Authorization': 'JWT ' + localStorage.getItem('token')
      }
    });
  }
  return;
}
