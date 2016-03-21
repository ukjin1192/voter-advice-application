'use strict';

// Load modules
require('bootstrap-webpack');

// Load custom modules
var setCSRFToken = require('../module/setCSRFToken.js');

$(document).on('click', '.landing__btn', function() {
  var btn = $(this);
  btn.button('loading');

  if (localStorage.getItem('token') === null) {
    setCSRFToken();
    
    $.ajax({
      url: '/api/users/',
      type: 'POST'
    }).done(function(data) {
      // Save user's token and ID
      localStorage.setItem('token', data.token);
      localStorage.setItem('user_id', data.id);
    }).always(function() {
      btn.button('reset');
      location.href = '/assembly/survey/';
    }); 
  } else {
    btn.button('reset');
    location.href = '/assembly/survey/';
  }
});

$(window).on('resize', function() {
  $('.landing__image').attr('height', $(window).height());
});

$(window).load(function() {
  $('.landing__image').attr('height', $(window).height());
});
