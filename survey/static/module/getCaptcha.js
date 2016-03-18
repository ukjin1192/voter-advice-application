'use strict';

// Load modules
var $ = require('jquery');

module.exports = function getCaptcha() {
  $('#create-user-form-alert-message').html('').addClass('hidden');

  $.ajax({
    url: '/captcha/refresh/',
    type: 'GET'
  }).done(function(data) {
    $('#captcha-image').attr('src', data.image_url);
    $('#captcha-key').val(data.key);
  }).fail(function(data) {
    console.log('Failed to get captcha: ' + data);
  }); 
  return;
}
