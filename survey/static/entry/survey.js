'use strict';

// Load modules
require('bootstrap-webpack');
var fullpage = require('fullpage.js');
var rangeslider = require('rangeslider.js');

// Load custom modules
var setCSRFToken = require('../module/setCSRFToken.js');
var setAuthToken = require('../module/setAuthToken.js');
var clearAuthToken = require('../module/clearAuthToken.js');
var getCaptcha = require('../module/getCaptcha.js');
var activateSlotMachine = require('../module/activateSlotMachine.js');
var loadResultPage = require('../module/loadResultPage.js');
var showQuestionValidationMessage = require('../module/showQuestionValidationMessage.js');
var updateGhostVisibility = require('../module/updateGhostVisibility.js');

// Global variables
var pathName = window.location.pathname;
var domainName = $('#domain-name').val();
// Support for optimizely editor
if (RegExp(domainName).test(pathName)) pathName = pathName.split(domainName)[1];
var surveyID = pathName.match(/survey\/(\d+)/)[1]

// Decide to use captcha validation or not
if ($('#use-captcha').val() == 'True') var useCaptcha = true;
else var useCaptcha = false;

$(document).on('click', '#refresh-captcha', getCaptcha);

// Validate captcha input and create user
$(document).on('submit', '#create-user-form', function(event) {
  event.preventDefault();

  // Clear alert message and hide it
  if (useCaptcha) $('#create-user-form-alert-message').html('').addClass('hidden');
  $('#create-user-submit-btn').button('loading');

  var formData = new FormData();
  if (useCaptcha) {
    formData.append('captcha_key', $('#captcha-key').val());
    formData.append('captcha_value', $('#captcha-value').val());
  }

  // Clear authentication and set CSRF tokens at HTTP header
  clearAuthToken();
  setCSRFToken();

  $.ajax({
    url: '/api/users/',
    type: 'POST',
    data: formData,
    contentType: false,
    processData: false
  }).done(function(data) {
    // When captcha input is not valid
    if (data.state == false && useCaptcha == true) {
      $('#create-user-form-alert-message').html('일치하지 않습니다').removeClass('hidden');
    } else {
      // Save user's token and ID
      localStorage.setItem('token', data.token);
      localStorage.setItem('user_id', data.id);
      
      // Clear captcha input form
      if (useCaptcha) $('#captcha-key, #captcha-value').val('');
      
      // Clear original survey data
      $('.question-choice, input[name="sex"]').attr('checked', false); 
      $('.answer-id, .original-choice-id, #year-of-birth, #supporting-party').val('');
      
      // Hide buttons for participated user
      $('#continue-survey-btn, #edit-survey-btn, #move-to-result-page-btn').addClass('hidden');
      
      // Set authentication token at HTTP header
      setAuthToken();
      
      // Move to 1st question page
      $.fn.fullpage.moveSectionDown();
    }
  }).always(function() {
    $('#create-user-submit-btn').button('reset');
  }); 
});

$(document).on('click', '.question-choice', function() {
  var $leavingSection = $(this).closest('.section');
  var duration = new Date().getTime() / 1000 - localStorage.getItem('duration');

  // When user think enough or already answered question
  if (duration > parseInt($leavingSection.find('.question-duration-limit').val()) || 
    $leavingSection.find('.answer-id').val() != '') {
    // Auto scrolling
    $.fn.fullpage.moveSectionDown();
    $('#move-to-unanswered-question-btn').addClass('hidden');
  }
  // Too short duration to choose choice 
  else {
    showQuestionValidationMessage('조금만 더 생각해주세요');
    $leavingSection.find('.question-choice:checked').attr('checked', false); 
    return false;
  }
});

$(document).on('submit', '#update-user-form', function(event) {
  event.preventDefault();

  $('#submit-survey-btn').button('loading');

  if ($('input[name="sex"]:checked').val() != undefined ||
    $('#year-of-birth').val() != '' || $('#supporting-party').val() != '') {
    
    // Save additional info
    var formData = new FormData();
    if ($('input[name="sex"]:checked').val() != undefined) formData.append('sex', $('input[name="sex"]:checked').val());
    if ($('#year-of-birth').val() != '') formData.append('year_of_birth', $('#year-of-birth').val());
    if ($('#supporting-party').val() != '') formData.append('supporting_party', $('#supporting-party').val());
    
    // Set authentication and CSRF tokens at HTTP header
    setAuthToken();
    setCSRFToken();
    
    $.ajax({
      url: '/api/users/' + localStorage.getItem('user_id') + '/',
      type: 'PATCH',
      data: formData,
      contentType: false,
      processData: false
    });
  }

  // Check user chose all questions
  var firstUnaswerdQuestionOrder = parseInt($('.answer-id[value=""]').closest('.question').find('.question-order').val());

  // When user does not completed survey 
  if (isNaN(firstUnaswerdQuestionOrder) == false) {
    $('#move-to-unanswered-question-btn').attr('href', '#Q' + firstUnaswerdQuestionOrder).removeClass('hidden');
    $('#submit-survey-btn').button('reset');
  }
  // Move to result page when user completed survey
  else {
    loadResultPage(surveyID, 'comparison_1d');
  }
});

$(document).on('click', '#move-to-result-page-btn', function() {
  $('#move-to-result-page-btn').button('loading');
  loadResultPage(surveyID, 'comparison_1d');
});

$(window).load(function() {

  // Update ghost visibility
  updateGhostVisibility();

  // Fill out captcha form if captcha validation is activated
  if (useCaptcha) getCaptcha();
  
  // Get all questions without user answers
  $.ajax({
    url: '/api/questions/',
    type: 'GET',
    data: {
      'survey_id': surveyID
    }
  }).done(function(data) {
    var totalQuestions = data.length;
    var totalSections = totalQuestions + 2;
    
    // Initiate section slider
    $('#section-slider').attr('max', totalSections);
    var $sectionSlider = $('#section-slider');
    var $sectionSliderHandle;
    
    $sectionSlider.rangeslider({
      polyfill: false,
      onSlideEnd: function(position, value) {
        var lastAnsweredSectionIndex = parseInt($('.question-choice[type="radio"]:checked').
          last().closest('.question').find('.question-order').val()) + 1;
        if (isNaN(lastAnsweredSectionIndex)) lastAnsweredSectionIndex = 1; 
        
        // Sync section width slider value
        if (value <= lastAnsweredSectionIndex + 1) $.fn.fullpage.moveTo(value);
        // When user tries to skip unaswered questions
        else {
          $('#section-slider').val(lastAnsweredSectionIndex + 1).change();
          $.fn.fullpage.moveTo(lastAnsweredSectionIndex + 1);
        } 
      }
    });
    
    data.forEach(function(question, index) {
      var $section = $('#section-virtual-dom').clone().removeClass('hidden').removeAttr('id');
      $section.find('.question-id').val(question.id);
      $section.find('.question-order').val(index + 1);
      $section.find('.question-duration-limit').val(question.duration_limit);
      $section.find('.question-image').attr('data-src', question.image_url);
      $section.find('.question-explanation').html(question.explanation);
      
      var choices = question.choices;
      if (Math.random() < 0.5) choices = _.reverse(choices);
      
      choices.forEach(function(choice) {
        $section.find('.question-choices').append('<div class="radio"><input type="radio" ' +
          'class="question-choice" id="C' + choice.id  + '" name="question-' + question.id + '" value="' + 
          choice.id + '" /><label for="C' + choice.id  +'">' + choice.context + '</label></div>');
      });
      
      $('#page-scroll-container .section').last().before($section);
    });
    
    $('#section-virtual-dom').remove();
    
    // Get user profile and answers, then fill out this data into questions
    if (localStorage.getItem('token') != null && localStorage.getItem('user_id') != null) {
      $('#check-data-existence-message').removeClass('hidden');
      
      // Set authentication token at HTTP header
      setAuthToken();
      
      // Get user profile
      $.ajax({
        url: '/api/users/' + localStorage.getItem('user_id') + '/',
        type: 'GET',
        data: {
          'survey_id': surveyID
        }
      }).done(function(data) {
        // Fill out profile
        $('input[name="sex"][value="' + data.sex + '"]').attr('checked', true);
        $('#year-of-birth').val(data.year_of_birth);
        $('#supporting-party').find('option[value="' + data.supporting_party + '"]').attr('selected', true);
        
        var completedSurvey = data.completed_survey;
        
        // Get user answers
        $.ajax({
          url: '/api/answers/',
          type: 'GET'
        }).done(function(data) {
          // Fill out answers
          data.forEach(function(answer, index) {
            var $question = $('.question-choice[type="radio"][value="' + answer.choice + '"]').
              attr('checked', true).closest('.question');
            $question.find('.answer-id').val(answer.id);
            $question.find('.original-choice-id').val(answer.choice);
          });
          
          // When user completed survey
          if (completedSurvey) {
            $('#edit-survey-btn, #move-to-result-page-btn').removeClass('hidden');
          }
          // When user does not completed survey
          else {
            var firstUnaswerdQuestionOrder = parseInt($('.answer-id[value=""]').closest('.question').
              find('.question-order').val());
            $('#continue-survey-btn').attr('href', '#Q' + firstUnaswerdQuestionOrder).removeClass('hidden');
          }
          $('#create-user-submit-btn').removeClass('btn-xlg').html('기존 데이터 지우고 새로 시작하기');
        }).fail(function(data) {
          // When user first visited site
          $('#landing-page-help-messages').removeClass('hidden');
          clearAuthToken();
          localStorage.clear();
        }); 
      }).fail(function(data) {
        clearAuthToken();
        localStorage.clear();
      }).always(function() {
        $('#check-data-existence-message').addClass('hidden');
      }); 
    } else{
      // When user first visited site
      $('#landing-page-help-messages').removeClass('hidden');
      clearAuthToken();
      localStorage.clear();
    }
    
    var anchorsList = ['main', ];
    for (var i = 1; i < totalQuestions + 1; i++) {
      anchorsList.push('Q' + i);
    }
    anchorsList.push('additional');
    
    // Inititate fullpage.js with options
    $('#page-scroll-container').fullpage({
      
      // Enable anchor and history feature
      anchors: anchorsList,
      
      // Disables featutre moving to specific section when loaded
      animateAnchor: false,
      
      afterLoad: function(anchorLink, index){
        var $loadedSection = $(this);
        
        if (index == 2) {
          $('#section-slider-container').removeClass('hidden');
          
          // Update visibility of ghosts
          updateGhostVisibility();
          
          // Show tooltip message for section slider for a moment
          $('#section-slider-container').tooltip('show');
          setTimeout(function() {
            $('#section-slider-container').tooltip('hide');
          }, 3000);
        }
      },
      
      onLeave: function(index, nextIndex, direction){
        var $leavingSection = $(this);
        
        // Prevent to leave section when user tries to fold voice of customer form by clicking back button on mobile
        if ($('#voice-of-customer').hasClass('in')) {
          $('#voice-of-customer').collapse('hide');
          return false;
        }
        
        if (index > 1 && index < totalSections) {
          // Reset duration
          localStorage.setItem('duration', new Date().getTime() / 1000);
          
          var choiceID = $leavingSection.find('.question-choice[type="radio"]:checked').val();
          var originalChoiceID = $leavingSection.find('.original-choice-id').val();
          var answerID = $leavingSection.find('.answer-id').val();
          
          if (choiceID == undefined && direction == 'down') {
            showQuestionValidationMessage('질문에 답해주세요');
            return false;
          }
          
          if (choiceID != undefined) {
            // Create answer
            if (answerID == '') {
              var formData = new FormData();
              formData.append('choice_id', choiceID);
              
              // Set authentication and CSRF tokens at HTTP header
              setAuthToken();
              setCSRFToken();
              
              $.ajax({
                url: '/api/answers/',
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false
              }).done(function(data) {
                $leavingSection.find('.answer-id').val(data.id);
                $leavingSection.find('.original-choice-id').val(choiceID);
              }).fail(function(data) {
                $leavingSection.find('.question-choice[type="radio"]:checked').attr('checked', false);
              }); 
            }
            // Update answer
            else if (originalChoiceID != choiceID) {
              var formData = new FormData();
              formData.append('choice_id', choiceID);
              
              // Set authentication and CSRF tokens at HTTP header
              setAuthToken();
              setCSRFToken();
              
              $.ajax({
                url: '/api/answers/' + answerID + '/',
                type: 'PATCH',
                data: formData,
                contentType: false,
                processData: false
              }).done(function(data) {
                $leavingSection.find('.original-choice-id').val(choiceID);
              }).fail(function(data) {
                $leavingSection.find('.question-choice[type="radio"]:checked').attr('checked', false);
                $leavingSection.find('.question-choice[value="' + originalChoiceID + '"]').attr('checked', true);
              }); 
            }
          }
        }
        // Start survey when user validated
        else if (index == 1) {
          if (localStorage.getItem('token') == null) return false;
        }
        
        // Sync slider with section index
        if (nextIndex == 1) $('#section-slider-container').addClass('hidden').tooltip('hide');
        else if (index == 1 && nextIndex == 2) $('#section-slider').val(nextIndex).change();
        else {
          $('#section-slider-container').removeClass('hidden');
          $('#section-slider').val(nextIndex).change();
        }
        
        // Update visibility of ghosts
        updateGhostVisibility();
      }
    });
  }); 
  
  // Get comparison targets
  $.ajax({
    url: '/api/comparison_targets/',
    type: 'GET',
    data: {
      'survey_id': surveyID
    }
  }).done(function(data) {
    var wordList = [];
    
    data.forEach(function(comparison_target, index) {
      // Fill out comparison target list
      if (comparison_target.completed_survey) {
        $('#supporting-party').append('<option value="' + comparison_target.name + '">' + comparison_target.name + '</option>');
      }
      wordList.push(comparison_target.name);
    }); 
    
    // Activate slot machine with shuffled comparison target list
    wordList = _.shuffle(wordList);
    activateSlotMachine(wordList);
  }); 
  
  // Update visibility of ghosts when window resized
  $(window).on('resize', function() {
    setTimeout(function() {
      updateGhostVisibility();
    }, 1000);
  });
});
