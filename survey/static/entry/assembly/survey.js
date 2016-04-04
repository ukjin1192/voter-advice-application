'use strict';

// Load modules
require('bootstrap-webpack');
var fullpage = require('fullpage.js');
require('jquery-slimscroll');

// Load custom modules
var setCSRFToken = require('../../module/setCSRFToken.js');
var setAuthToken = require('../../module/setAuthToken.js');
var clearAuthToken = require('../../module/clearAuthToken.js');

// Global variables
var surveyID = 1;
var activeSlideIndex;   // Starting from 1
var answerList = {};
var questionList = [];  // Starting from 0

// Show additional information of statement
$(document).on('show.bs.modal', '#cheating-paper', function() {
  $(this).find('.modal-body').html($('.slide.active').find('.cheating-paper__content').text());
});

// Synchronize progress bar
function syncProgressBar(value) {
  $('.header__progress-bar').css('width', value + '%');
}

// Synchronize choice with record
function syncChoice(value) {
  $('.choice').removeClass('choice--active');

  if (value === 1) $('.choice--agreement').addClass('choice--active');
  else if (value === 0) $('.choice--abtention').addClass('choice--active');
  else if (value === -1) $('.choice--disagreement').addClass('choice--active');
}

// Synchronize title and subtitle
function syncTitle(index) {
	$('.header__title').text(questionList[index].title);
	$('.header__subtitle').text(questionList[index].subtitle);
}

// Save choice
function saveChoice(choiceID) {

  // Set authentication and CSRF tokens at HTTP header
  setAuthToken();
  setCSRFToken();

  var formData = new FormData();
  formData.append('choice_id', choiceID);

  $.ajax({
    url: '/api/answers/',
    type: 'POST',
    data: formData,
    contentType: false,
    processData: false
  });
}

// Submit survey (Update user profile and create new result)
$(document).on('click', '.survey__submit-btn', function() {

  var $submitBtn = $(this);
  $submitBtn.button('loading');

  // Set authentication and CSRF tokens at HTTP header
  setAuthToken();
  setCSRFToken();
  
  var formData = new FormData();
  if ($('input[name="sex"]:checked').val() != undefined) formData.append('sex', $('input[name="sex"]:checked').val());
  if ($('#year-of-birth').val() != '') formData.append('year_of_birth', $('#year-of-birth').val());
  if ($('#political-tendency').val() != '') formData.append('political_tendency', $('#political-tendency').val());
  
  // Update user profile
  $.ajax({
    url: '/api/users/' + localStorage.getItem('user_id') + '/',
    type: 'PATCH',
    data: formData,
    contentType: false,
    processData: false
  }).done(function(data) {
    var formData = new FormData();
    formData.append('survey_id', surveyID);
    formData.append('category', 'agreement_score');
    
    // Create new result
    $.ajax({
      url: '/api/results/',
      type: 'POST',
      data: formData,
      contentType: false,
      processData: false
    }).done(function(data) {
      // Move to result page
      location.href = '/assembly/result/' + data.id + '/';
    }).fail(function() {
      $submitBtn.button('reset');
    });
  });
});

// Choose choice and move to next slide
$(document).on('click', '.choice', function() {
  var $choice = $(this);

  if ($choice.hasClass('choice--agreement')) {
    answerList[activeSlideIndex] = 1;
    saveChoice(questionList[activeSlideIndex - 1].agreement_choice_id);
  } else if ($choice.hasClass('choice--abtention')) {
    answerList[activeSlideIndex] = 0;
    saveChoice(questionList[activeSlideIndex - 1].abtention_choice_id);
  } else if ($choice.hasClass('choice--disagreement')) {
    answerList[activeSlideIndex] = -1;
    saveChoice(questionList[activeSlideIndex - 1].disagreement_choice_id);
  }

  // Move to next slide
  $.fn.fullpage.moveSlideRight();
});

$(window).load(function() {

  // Check user is valid
  if (localStorage.getItem('token') === null || localStorage.getItem('user_id') === null) {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    clearAuthToken();
    
    // Redirect to landing page if user is not valid 
    location.href = '/assembly/';
  } else {
    // Set authentication token at HTTP header
    setAuthToken();
    
    $.ajax({
      url: '/api/users/' + localStorage.getItem('user_id') + '/',
      type: 'GET'
    }).fail(function() {
      // When user is invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
      clearAuthToken();
      
      // Redirect to landing page if user is not valid 
      location.href = '/assembly/';
    });
  }

  $('#loading-icon').removeClass('hidden');

  // Get questions
  $.ajax({
    url: '/api/questions/',
    type: 'GET',
    data: {
      'survey_id': surveyID
    }
  }).done(function(data) {
    
    data.forEach(function(question, index) {
      var questionTemporaryExplanation = question.explanation.split('|');
      var choices = question.choices;
      var agreementChoiceID, abtentionChoiceID, disagreementChoiceID;
      choices.forEach(function(choice) {
        switch (choice.factor) {
          case 1:
            agreementChoiceID = choice.id;
            break;
          case 0:
            abtentionChoiceID = choice.id;
            break;
          case -1:
            disagreementChoiceID = choice.id;
            break;
          default:
            break;
        }
      });
      
      questionList.push({
        'title': (index + 1).toString() + '. ' + question.title,
        'subtitle': question.subtitle,
        'agreement_content': questionTemporaryExplanation[0],
        'disagreement_content': questionTemporaryExplanation[1],
        'agreement_choice_id': agreementChoiceID,
        'abtention_choice_id': abtentionChoiceID,
        'disagreement_choice_id': disagreementChoiceID,
        'cheating_paper_content': question.cheating_paper
      });
      
      // Initiate answer list
      answerList[index + 1] = null;
    });
       
    for (var i=0; i<questionList.length; i++) {
      var $slide = $('#slide-virtual-dom').clone().removeClass('hidden').removeAttr('id');
      $slide.attr('data-anchor', i + 1);
      $slide.find('.statement--agreement .statement__content').text(questionList[i].agreement_content);
      $slide.find('.statement--disagreement .statement__content').text(questionList[i].disagreement_content);
      $slide.find('.cheating-paper__content').text(questionList[i].cheating_paper_content);
      $('.survey__body .section').append($slide);
    }
    
    $('#slide-virtual-dom').remove();
    
    // Append additional info slide
    var $slide = $('#additional-info-slide').clone().removeClass('hidden').removeAttr('id');
    $('.survey__body .section').append($slide);
    questionList.push({
      'title': '사용자 설문 조사 (선택사항)',
      'subtitle': '서비스 개선에 활용됩니다.'
    });
    
    $('#additional-info-slide').remove();
    
    // Inititate fullpage.js with options
    $('.survey__body').fullpage({
      fixedElements: '.survey__header, .survey__footer',
      // Padding top and bottom are required to use slimscroll with fixed elements
      paddingTop: $('.survey__header').outerHeight(),
      paddingBottom: $('.survey__footer').outerHeight(),
      scrollOverflow: true, 
      loopHorizontal: false,
      
      afterRender: function() {
        // Update active slide index
        activeSlideIndex = $('.slide').index($('.slide.active')) + 1;
        
        syncProgressBar(activeSlideIndex * 100 / (questionList.length - 1));
        syncTitle(activeSlideIndex - 1);
      },
      
      afterSlideLoad: function(anchorLink, index, slideAnchor, slideIndex) {
        var $loadedSlide = $(this);
        
        // Update active slide index
        activeSlideIndex = slideIndex + 1;
        
        if (activeSlideIndex != questionList.length) syncChoice(answerList[activeSlideIndex]);
      },
      
      onSlideLeave: function(anchorLink, index, slideIndex, direction, nextSlideIndex) {
        var $leavingSlide = $(this);
        
        syncProgressBar((nextSlideIndex + 1) * 100 / (questionList.length - 1));
        syncTitle(nextSlideIndex);
        
        if (nextSlideIndex + 1 == questionList.length) {
          $('.header__progress-container, .footer__sub-container, .footer__description, .footer__choices').addClass('hidden');
          $('.survey__submit-btn').removeClass('hidden');
        } else {
          $('.header__progress-container, .footer__sub-container, .footer__description, .footer__choices').removeClass('hidden');
          $('.survey__submit-btn').addClass('hidden');
        }
      },
    }); 
  }).always(function() {
    $('#loading-icon').addClass('hidden');
  });
});
