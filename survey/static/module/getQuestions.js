'use strict';

var $ = require('jquery');

module.exports = function getQuestions() {
  $.ajax({
    url: '/api/questions/',
    type: 'GET'
  }).done(function(data) {
    data.forEach(function(question) {
      var sectionDOM = $('#section-virtual-dom').clone().removeClass('hidden').removeAttr('id');
      
      sectionDOM.find('.question-id').val(question.id);
      sectionDOM.find('.question-image').attr('src', question.image_url);
      sectionDOM.find('.question-explanation').html(question.explanation);
      
      var choices = question.choices;
      choices.forEach(function(choice) {
        sectionDOM.find('.question-choices').append('<div class="radio"><label>' +
					'<input type="radio" name="question-"' + question.id + '" value="' + choice.id + '" />' + 
          choice.context + '</label></div>');
      });
      
      $('#page-scroll-container .section').last().before(sectionDOM);
    });
  }).fail(function(data) {
    console.log('Failed to get questions: ' + data);
  }); 
  return;
}
