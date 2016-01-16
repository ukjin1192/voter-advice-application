'use strict';

// Load bootstrap with custom configuration
require('bootstrap-webpack!./bootstrap.config.js');
require('./styles.scss');

var setCSRFToken = require('./module/setCSRFToken');
var setAuthToken = require('./module/setAuthToken');
var clearAuthToken = require('./module/clearAuthToken');
var getCaptcha = require('./module/getCaptcha');
var activateSwitch = require('./module/activateSwitch');
var getResultID = require('./module/getResultID');
var getResult = require('./module/getResult');

$(document).on('click', '#refresh-captcha', getCaptcha);

$(document).on('click', '.question-choices [type="radio"]', activateSwitch);

$(document).on('submit', '#create-user-form', function(event) {
  event.preventDefault();

  $('#create-user-form-alert-message').html('').addClass('hidden');

  var formData = new FormData();
  formData.append('captcha_key', $('#captcha-key').val());
  formData.append('captcha_value', $('#captcha-value').val());

  clearAuthToken();
  setCSRFToken();

  $.ajax({
    url: '/api/users/',
    type: 'POST',
    data: formData,
    contentType: false,
    processData: false
  }).done(function(data) {
    if (data.state == false) {
      $('#create-user-form-alert-message').html('일치하지 않습니다').removeClass('hidden');
    } else {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user_id', data.id);
      $('#captcha-key').val('');
      $('#captcha-value').val('');
      setAuthToken();
      $.fn.fullpage.moveSectionDown();
    }
  }).fail(function(data) {
    console.log('Failed to create user: ' + data);
  }); 
});

$(document).on('click', '#get-party-result-btn', function() {
  getResultID('party')
});

$(document).ready(function() {
  var pathname = window.location.pathname;

  if (pathname == '/') {
    getCaptcha();

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
      
      var totalSections = $('#page-scroll-container .section').length;
      var totalQuestions = totalSections - 3;
      var anchorsList = ['main', 'tag'];
      for (var i = 1; i < totalQuestions + 1; i++) {
        anchorsList.push('Q' + i);
      }
      anchorsList.push('additional');
      
      $('#page-scroll-container').removeClass('hidden').fullpage({
        anchors: anchorsList,
        onLeave: function(index, nextIndex, direction){
          var leavingSection = $(this);
          
          if (index > 2 && index < totalSections) {
            var questionID = leavingSection.find('.question-id').val();
            var formData = new FormData();
            
            formData.append('choice_id', leavingSection.find('input[type="radio"]:checked').val());
            if (leavingSection.find('.checkbox-switch').is(':checked')) formData.append('weight', 2);
            else formData.append('weight', 1);
            formData.append('duration', 4);
             
            setAuthToken();
            setCSRFToken();
            
            $.ajax({
              url: '/api/answers/',
              type: 'POST',
              data: formData,
              contentType: false,
              processData: false
            }).done(function(data) {
              console.log('Succeed to create answer: ' + data);
            }).fail(function(data) {
              console.log('Failed to create answer: ' + data);
            }); 
          }
        }
      });
    }).fail(function(data) {
      console.log('Failed to get questions: ' + data);
    }); 
  } else if (pathname == '/result/') {
  } else if (/result\/(\d+)/.test(pathname)) {
    var answerID = pathname.match(/result\/(\d+)/)[1]
    getResult(answerID);    
  }

  $('#loading-icon').addClass('hidden');
});
