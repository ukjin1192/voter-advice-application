'use strict';

var $ = require('jquery');
var setAuthToken = require('./setAuthToken');

module.exports = function getResultID(answerID) {
  setAuthToken();
  
  $.ajax({
    url: '/api/results/' + answerID + '/',
    type: 'GET'
  }).done(function(data) {
    $('#result-detail').html(data.record);
  }).fail(function(data) {
    console.log('Failed to get result: ' + data);
  }); 
  return;
}
