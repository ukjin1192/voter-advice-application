'use strict';

var $ = require('jquery');
var setCSRFToken = require('./setCSRFToken.js');
var setAuthToken = require('./setAuthToken.js');

module.exports = function loadResultPage(category) {
  var formData = new FormData();
  formData.append('category', category);
  
  // Set authentication and CSRF tokens at HTTP header
  setAuthToken();
  setCSRFToken();
  
  $.ajax({
    url: '/api/results/',
    type: 'POST',
    data: formData,
    contentType: false,
    processData: false
  }).done(function(data) {
    // Move to result page
    location.href = '/result/' + data.id + '/';
  }).fail(function(data) {
    console.log('Failed to get result ID: ' + data);
  }); 
  return;
}
