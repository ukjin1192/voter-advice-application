'use strict';

var $ = require('jquery');
var setAuthToken = require('./setAuthToken');
var setCSRFToken = require('./setCSRFToken');

module.exports = function getResultID(category) {
  setAuthToken();
  setCSRFToken();

  var formData = new FormData();
  formData.append('category', category);

  $.ajax({
    url: '/api/results/',
    type: 'POST',
    data: formData,
    contentType: false,
    processData: false
  }).done(function(data) {
    location.href = '/result/' + data.id + '/';
  }).fail(function(data) {
    console.log('Failed to get result ID: ' + data);
  }); 
  return;
}
