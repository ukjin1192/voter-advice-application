'use strict';

// Load custom modules
var setAuthToken = require('../../module/setAuthToken.js');

// Global variables
var pathName = window.location.pathname;
var resultID = pathName.match(/result\/(\d+)/)[1];

// Fit iframe as full size
$(window).on('resize', function() {
  $('.result__iframe').attr({
    'width': $('.result__body').width(),
    'height': $(window).height() - $('.result__header').outerHeight()
  });
});

$(window).load(function() {

  // Vertically center aligning iframe loading image
  if ($('.result__iframe--loading').height() > $(window).height()) {
    $('.result__iframe--loading').css(
      'margin-top', 
      ($('.result__iframe--loading').height() - $(window).height()) / -2
    );
  }

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
      'width': $('.result__body').width(),
      'height': $(window).height() - $('.result__header').outerHeight()
    });
  });

  // Change loading image
  setTimeout(function() {
    $($('.result__iframe--loading')[1]).removeClass('hidden');
    $($('.result__iframe--loading')[0]).addClass('hidden');
  }, 4000);

  // Hide iframe loading image when iframe loaded
  setTimeout(function() {
    $('.result__iframe--loading').addClass('hidden');
    $('.result__header').removeClass('hidden');
    // Set maximum time limit to show loading image
  }, 8000);
});
