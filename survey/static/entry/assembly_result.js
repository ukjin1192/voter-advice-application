'use strict';

// Load custom modules
var setAuthToken = require('../module/setAuthToken.js');

// Global variables
var pathName = window.location.pathname;
var resultID = pathName.match(/result\/(\d+)/)[1];

// Fit iframe as full size
$(window).on('resize', function() {
  $('.result__iframe').attr({
    'width': $('.result__container').width(),
    'height': $(window).height() - $('.result__header').outerHeight()
  });
});

$(window).load(function() {

  // Set authentication token at HTTP header
  setAuthToken();

  // Get result object (One dimensional analysis)
  $.ajax({
    url: '/api/results/' + resultID + '/',
    type: 'GET'
  }).done(function(data) {
    // Fit iframe as full size
    $('.result__iframe').attr({
      'src': 'https://pingkorea.shinyapps.io/deployment/?' + data.record,
      'width': $('.result__container').width(),
      'height': $(window).height() - $('.result__header').outerHeight()
    });
  });
  
  $('.result__iframe').on('load', function() {
    console.log('iframe loaded');
  });
});
