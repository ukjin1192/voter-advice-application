'use strict';

// Load modules
require('bootstrap-webpack');

$(window).on('resize', function() {
  $('.landing__image').attr('height', $(window).height());
});

$(window).load(function() {
  $('.landing__image').attr('height', $(window).height());
});
