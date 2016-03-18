'use strict';

// Load modules
var $ = require('jquery');

module.exports = function showQuestionValidationMessage(message) {
  $('#question-validation-message').html(message).removeClass('hidden');          
  setTimeout(function() {                                                                          
    $('#question-validation-message').addClass('hidden').html('');                                 
  }, 1500);
  return;
}
