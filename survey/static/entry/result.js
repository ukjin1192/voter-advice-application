'use strict';

// Load custom modules
var setAuthToken = require('../module/setAuthToken.js');

// Global variables
var pathName = window.location.pathname;
var resultID = pathName.match(/result\/(\d+)/)[1];

$(window).on('resize', function() {

  var width = $('.result__container').width(),
      height = $('.result__container').width();

  $('.result__iframe').attr({
    'width': width,
    'height': height
  });
});

$(window).load(function() {

  var width = $('.result__container').width(),
      height = $('.result__container').width();

  // Set authentication token at HTTP header
  setAuthToken();

  // Get result object (One dimensional analysis)
  $.ajax({
    url: '/api/results/' + resultID + '/',
    type: 'GET'
  }).done(function(data) {
    $('.result__iframe').attr({
      'src': 'https://pingkorea.shinyapps.io/deployment/?' + data.record,
      'width': width,
      'height': height
    });
  });
});
