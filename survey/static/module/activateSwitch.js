'use strict';

var $ = require('jquery');

module.exports = function activateSwitch() {
  var questionWeight = $(this).closest('.question').find('.question-weight');
  var questionWeightSwitch = questionWeight.find('.checkbox-switch');

  questionWeight.removeClass('hidden');
  questionWeightSwitch.bootstrapSwitch({'onText': '네', 'offText': '아니오', 'handleWidth': '40px'});
  return;
}
