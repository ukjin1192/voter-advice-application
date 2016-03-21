'use strict';

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

  $('.result__iframe').attr({
    'src': 'https://pingkorea.shinyapps.io/deployment/' + location.search,
    'width': width,
    'height': height
  });
});
